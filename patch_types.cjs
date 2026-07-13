const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace('department?: string;', 'department?: string;\n  avatar_url?: string;');
fs.writeFileSync('src/types.ts', content);
