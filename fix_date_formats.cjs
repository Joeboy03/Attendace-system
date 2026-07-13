const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/format\(new Date\((result|record)\.signed_at\),\n?\s*'(.*?)'\)/g, "(($1.signed_at && !isNaN(new Date($1.signed_at).getTime())) ? format(new Date($1.signed_at), '$2') : 'N/A')");
  fs.writeFileSync(filePath, content);
}

fixFile('src/components/AdminSearch.tsx');
fixFile('src/pages/LecturerDashboard.tsx');
