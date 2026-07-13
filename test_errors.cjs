const fs = require('fs');
const htmlPath = 'index.html';
let content = fs.readFileSync(htmlPath, 'utf8');
if (!content.includes('window.onerror')) {
  content = content.replace('</head>', '<script>window.onerror = function(m, s, l, c, e) { alert(m + " at " + l + ":" + c); };</script></head>');
  fs.writeFileSync(htmlPath, content);
}
