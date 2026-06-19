const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'KNUSTVOTE_BUILD.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');

const regex = /```sql\n([\s\S]*?)```/g;
let match;
let schemaSql = '';
let seedSql = '';

while ((match = regex.exec(mdContent)) !== null) {
  if (match[1].includes('-- Enable UUID generation')) {
    schemaSql = match[1];
  }
  if (match[1].includes('-- Insert demo commissioner')) {
    seedSql = match[1];
  }
}

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

fs.writeFileSync(path.join(migrationsDir, '001_initial_schema.sql'), schemaSql);
fs.writeFileSync(path.join(migrationsDir, '002_seed_data.sql'), seedSql);

console.log('SQL files extracted successfully.');
