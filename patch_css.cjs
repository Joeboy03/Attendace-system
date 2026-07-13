const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');
if (!content.includes('fonts.googleapis.com')) {
  content = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');\n` + content;
  
  if (!content.includes('@theme')) {
    content += `\n\n@theme {\n  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;\n  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;\n}\n`;
  }
}
fs.writeFileSync('src/index.css', content);
