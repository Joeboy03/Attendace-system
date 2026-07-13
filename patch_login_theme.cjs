const fs = require('fs');

const files = [
  'src/pages/Login.tsx',
  'src/pages/Register.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('ThemeSwitcher')) {
    content = content.replace(
      "import { Link, useNavigate } from 'react-router-dom';",
      "import { Link, useNavigate } from 'react-router-dom';\nimport ThemeSwitcher from '../components/ThemeSwitcher';"
    );
  }
  
  // They usually have <div className="min-h-screen ...">
  // We can insert a ThemeSwitcher container right after this
  content = content.replace(
    /(<div className="min-h-screen[^>]*>)/,
    "$1\n      <div className=\"absolute top-4 right-4 z-50\">\n        <ThemeSwitcher />\n      </div>"
  );
  
  fs.writeFileSync(file, content);
});
