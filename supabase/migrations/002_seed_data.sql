-- Insert demo commissioner
insert into public.students (index_number, email, full_name, role, is_eligible)
values ('0000001', 'commissioner@knust.edu.gh', 'Electoral Commissioner', 'commissioner', true);

-- Insert demo voters (20 students)
insert into public.students (index_number, email, full_name, year_of_study, department, is_eligible)
values
  ('1000001', 'voter1@st.knust.edu.gh', 'Ama Asante', 3, 'Computer Science', true),
  ('1000002', 'voter2@st.knust.edu.gh', 'Kwame Mensah', 2, 'Computer Science', true),
  ('1000003', 'voter3@st.knust.edu.gh', 'Akua Boateng', 3, 'Electrical Engineering', true),
  ('1000004', 'voter4@st.knust.edu.gh', 'Kofi Amoah', 4, 'Computer Science', true),
  ('1000005', 'voter5@st.knust.edu.gh', 'Abena Osei', 1, 'Mathematics', true);
  -- add more as needed for demo

-- Insert demo election
insert into public.elections (
  title, description, start_time, end_time, status,
  created_by
)
select
  'SRC Presidential Election 2026',
  'Annual Student Representative Council Presidential Election for the 2025/2026 academic year.',
  now() - interval '1 hour',
  now() + interval '23 hours',
  'open',
  id
from public.students where index_number = '0000001';

-- Insert demo candidates
insert into public.candidates (election_id, full_name, position_title, is_approved)
select
  e.id,
  candidate_name,
  'SRC President',
  true
from public.elections e,
  (values
    ('Kofi Bright Asante'),
    ('Akosua Mensah-Bonsu'),
    ('Emmanuel Kwarteng')
  ) as c(candidate_name)
where e.title = 'SRC Presidential Election 2026';
