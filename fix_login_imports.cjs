const fs = require('fs');

['src/pages/Login.tsx', 'src/pages/Register.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import ThemeSwitcher')) {
    content = content.replace(
      "import { useNavigate, Link } from 'react-router-dom';",
      "import ThemeSwitcher from '../components/ThemeSwitcher';\nimport { useNavigate, Link } from 'react-router-dom';"
    );
    fs.writeFileSync(file, content);
  }
});
