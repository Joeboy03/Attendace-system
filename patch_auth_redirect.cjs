const fs = require('fs');

// Fix Login.tsx
let login = fs.readFileSync('src/pages/Login.tsx', 'utf8');
if (!login.includes('useAuth')) {
  login = login.replace("import { useNavigate, Link } from 'react-router-dom';", "import { useNavigate, Link } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\nimport { useEffect } from 'react';");
  login = login.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n  const { user, profile } = useAuth();\n\n  useEffect(() => {\n    if (user && profile) {\n      navigate('/dashboard');\n    }\n  }, [user, profile, navigate]);");
  fs.writeFileSync('src/pages/Login.tsx', login);
}

// Fix Register.tsx
let register = fs.readFileSync('src/pages/Register.tsx', 'utf8');
if (!register.includes('useAuth')) {
  register = register.replace("import { useNavigate, Link } from 'react-router-dom';", "import { useNavigate, Link } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';");
  register = register.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n  const { user, profile, refreshProfile } = useAuth();\n\n  useEffect(() => {\n    if (user && profile) {\n      navigate('/dashboard');\n    }\n  }, [user, profile, navigate]);");
  
  register = register.replace("if (dbError) throw dbError;", "if (dbError) throw dbError;\n        await refreshProfile();");
  fs.writeFileSync('src/pages/Register.tsx', register);
}

