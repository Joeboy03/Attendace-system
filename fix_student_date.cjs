const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

content = content.replace(
  /const date = new Date\(record\.signed_at\);\n\s*const formattedDate = !isNaN\(date\.getTime\(\)\) \? format\(date, 'MMM d, yyyy'\) : 'N\/A';\n\s*const formattedTime = !isNaN\(date\.getTime\(\)\) \? format\(date, 'h:mm a'\) : 'N\/A';/g,
  ""
); // wait, it already has isNaN protection!
console.log("Checking if isNaN is already there...");
if (content.includes("!isNaN(date.getTime())")) {
  console.log("Yes, it is.");
} else {
  content = content.replace(
    /const date = new Date\(record\.signed_at\);\n\s*const formattedDate = format\(date, 'MMM d, yyyy'\);\n\s*const formattedTime = format\(date, 'h:mm a'\);/g,
    "const date = new Date(record.signed_at);\n                const formattedDate = (record.signed_at && !isNaN(date.getTime())) ? format(date, 'MMM d, yyyy') : 'N/A';\n                const formattedTime = (record.signed_at && !isNaN(date.getTime())) ? format(date, 'h:mm a') : 'N/A';"
  );
  fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
}
