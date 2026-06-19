-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── STUDENTS ──────────────────────────────────────────────────────────────
create table public.students (
  id               uuid primary key default gen_random_uuid(),
  index_number     varchar(20) unique not null,  -- KNUST format e.g. "1234567"
  email            text unique not null,          -- KNUST institutional email
  phone            text,
  full_name        text not null,
  year_of_study    int check (year_of_study between 1 and 6),
  department       text,
  hall             text,
  role             text not null default 'voter' check (role in ('voter','commissioner','admin')),
  is_eligible      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── ELECTIONS ─────────────────────────────────────────────────────────────
create table public.elections (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text,
  start_time          timestamptz not null,
  end_time            timestamptz not null,
  status              text not null default 'draft'
                        check (status in ('draft','open','closed','results_published')),
  created_by          uuid not null references public.students(id),
  results_published_at timestamptz,
  audit_log_hash      text,       -- SHA-256 of full audit log, set on close
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── CANDIDATES ────────────────────────────────────────────────────────────
create table public.candidates (
  id             uuid primary key default gen_random_uuid(),
  election_id    uuid not null references public.elections(id) on delete cascade,
  student_id     uuid references public.students(id),
  position_title text not null,
  full_name      text not null,   -- denormalised for display after student record changes
  manifesto_url  text,
  photo_url      text,
  is_approved    boolean not null default false,
  vote_count     int not null default 0,
  created_at     timestamptz not null default now()
);

-- ── VOTES ─────────────────────────────────────────────────────────────────
-- voter_token = SHA256(voter_id || election_id || SERVER_SALT) — not the raw voter_id
create table public.votes (
  id               uuid primary key default gen_random_uuid(),
  election_id      uuid not null references public.elections(id),
  voter_token      text not null,  -- anonymised — no direct link back to student
  candidate_id     uuid not null references public.candidates(id),
  ballot_hash      text not null,  -- SHA256 receipt returned to voter
  idempotency_key  uuid not null unique,
  submitted_at     timestamptz not null default now(),
  -- One vote per anonymised voter per election — enforced at DB level
  unique (voter_token, election_id)
);

-- ── OTP TOKENS ────────────────────────────────────────────────────────────
create table public.otp_tokens (
  id            uuid primary key default gen_random_uuid(),
  index_number  text not null,
  otp_hash      text not null,   -- bcrypt hash of 6-digit OTP — plain text never stored
  expires_at    timestamptz not null default (now() + interval '10 minutes'),
  is_used       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ── AUDIT LOG (append-only) ───────────────────────────────────────────────
create table public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  election_id  uuid references public.elections(id),
  event_type   text not null check (event_type in (
    'auth_attempt','otp_issued','otp_verified','otp_failed',
    'vote_submitted','vote_duplicate_blocked',
    'election_created','election_opened','election_closed','results_published',
    'candidate_approved','candidate_rejected',
    'anomaly_flagged','anomaly_dismissed',
    'admin_action'
  )),
  actor_id     uuid references public.students(id),
  details      jsonb,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz not null default now()
);

-- ── ANOMALY FLAGS ─────────────────────────────────────────────────────────
create table public.anomaly_flags (
  id           uuid primary key default gen_random_uuid(),
  election_id  uuid references public.elections(id),
  flag_type    text not null check (flag_type in (
    'rapid_otp_requests','bot_speed_vote',
    'concurrent_sessions','multi_account_ip'
  )),
  severity     text not null check (severity in ('low','medium','high')),
  description  text not null,
  ip_address   text,
  actor_id     uuid references public.students(id),
  is_dismissed boolean not null default false,
  reviewed_by  uuid references public.students(id),
  created_at   timestamptz not null default now()
);

-- ── TRIGGERS ─────────────────────────────────────────────────────────────
-- Auto-increment candidate.vote_count on each new vote
create or replace function increment_vote_count()
returns trigger language plpgsql as $$
begin
  update public.candidates
  set vote_count = vote_count + 1
  where id = NEW.candidate_id;
  return NEW;
end;
$$;

create trigger on_vote_insert
  after insert on public.votes
  for each row execute function increment_vote_count();

-- Auto-update updated_at on students and elections
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger students_updated_at before update on public.students
  for each row execute function set_updated_at();

create trigger elections_updated_at before update on public.elections
  for each row execute function set_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────
alter table public.students       enable row level security;
alter table public.elections      enable row level security;
alter table public.candidates     enable row level security;
alter table public.votes          enable row level security;
alter table public.otp_tokens     enable row level security;
alter table public.audit_log      enable row level security;
alter table public.anomaly_flags  enable row level security;

-- Students: read own record only
create policy "students_read_own" on public.students
  for select using (auth.uid() = id);

-- Elections: everyone reads open/published; commissioners read their own drafts
create policy "elections_public_read" on public.elections
  for select using (status in ('open','closed','results_published'));

create policy "elections_commissioner_read" on public.elections
  for select using (
    auth.uid() = created_by
    or exists (
      select 1 from public.students
      where id = auth.uid() and role in ('commissioner','admin')
    )
  );

create policy "elections_commissioner_write" on public.elections
  for all using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('commissioner','admin')
    )
  );

-- Candidates: everyone reads approved; commissioners manage their elections
create policy "candidates_public_read" on public.candidates
  for select using (is_approved = true);

create policy "candidates_commissioner_write" on public.candidates
  for all using (
    exists (
      select 1 from public.elections e
      join public.students s on s.id = auth.uid()
      where e.id = election_id
      and (e.created_by = auth.uid() or s.role = 'admin')
    )
  );

-- Votes: voters insert own (via Edge Function); commissioners read aggregate counts only
create policy "votes_commissioner_read" on public.votes
  for select using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('commissioner','admin')
    )
  );

-- Audit log: INSERT only for authenticated users; SELECT for commissioners
create policy "audit_insert" on public.audit_log
  for insert with check (auth.uid() is not null);

create policy "audit_commissioner_read" on public.audit_log
  for select using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('commissioner','admin')
    )
  );

-- NO update or delete policies on audit_log — append-only enforced

-- Anomaly flags: commissioners of the relevant election read/dismiss
create policy "anomaly_commissioner" on public.anomaly_flags
  for all using (
    exists (
      select 1 from public.students
      where id = auth.uid() and role in ('commissioner','admin')
    )
  );
