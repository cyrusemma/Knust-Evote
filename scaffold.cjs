const fs = require('fs');
const path = require('path');

const files = [
  'src/context/AuthContext.jsx',
  'src/components/auth/ProtectedRoute.jsx',
  'src/pages/Landing.jsx',
  'src/pages/public/Results.jsx',
  'src/pages/public/VerifyReceipt.jsx',
  'src/pages/auth/Login.jsx',
  'src/pages/auth/VerifyOTP.jsx',
  'src/pages/voter/Dashboard.jsx',
  'src/pages/voter/ElectionDetail.jsx',
  'src/pages/voter/MyVotes.jsx',
  'src/pages/commissioner/Dashboard.jsx',
  'src/pages/commissioner/CreateElection.jsx',
  'src/pages/commissioner/ManageCandidates.jsx',
  'src/pages/commissioner/LiveMonitor.jsx',
  'src/pages/commissioner/AuditLog.jsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const componentName = path.basename(file, '.jsx');
  const content = `import React from 'react';\n\nexport default function ${componentName === 'AuthContext' ? 'AuthProvider({ children }) { return <>{children}</>' : componentName + '() {\n  return <div>' + componentName + '</div>;\n}'}\n`;
  
  if (file === 'src/context/AuthContext.jsx') {
    fs.writeFileSync(fullPath, `import React, { createContext, useContext } from 'react';\n\nconst AuthContext = createContext(null);\nexport const useAuth = () => useContext(AuthContext);\n\nexport const AuthProvider = ({ children }) => {\n  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;\n};\n`);
  } else if (file === 'src/components/auth/ProtectedRoute.jsx') {
    fs.writeFileSync(fullPath, `import React from 'react';\nimport { Outlet } from 'react-router-dom';\n\nexport default function ProtectedRoute({ role }) {\n  return <Outlet />;\n}\n`);
  } else {
    fs.writeFileSync(fullPath, content);
  }
});

console.log('Scaffolded files successfully.');
