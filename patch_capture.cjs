const fs = require('fs');
let content = fs.readFileSync('src/components/AvatarUploader.tsx', 'utf8');

content = content.replace('capture="user"\n        ', '');
fs.writeFileSync('src/components/AvatarUploader.tsx', content);
