const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'KNUSTVOTE_BUILD.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');

const functions = [
  { name: 'generate-otp', pattern: /\/\/ supabase\/functions\/generate-otp\/index\.ts\n([\s\S]*?)```/ },
  { name: 'verify-otp', pattern: /\/\/ supabase\/functions\/verify-otp\/index\.ts\n([\s\S]*?)```/ },
  { name: 'submit-vote', pattern: /\/\/ supabase\/functions\/submit-vote\/index\.ts\n([\s\S]*?)```/ },
  { name: 'close-election', pattern: /\/\/ supabase\/functions\/close-election\/index\.ts\n([\s\S]*?)```/ }
];

functions.forEach(func => {
  const match = mdContent.match(func.pattern);
  if (match) {
    const fnDir = path.join(__dirname, 'supabase', 'functions', func.name);
    if (!fs.existsSync(fnDir)) {
      fs.mkdirSync(fnDir, { recursive: true });
    }
    const content = `// supabase/functions/${func.name}/index.ts\n${match[1]}`;
    fs.writeFileSync(path.join(fnDir, 'index.ts'), content);
    console.log(`Extracted ${func.name}`);
  }
});

