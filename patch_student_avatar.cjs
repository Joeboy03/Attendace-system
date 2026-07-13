const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

if (!content.includes('import AvatarUploader')) {
  content = content.replace("import Calendar from '../components/Calendar';", "import Calendar from '../components/Calendar';\nimport AvatarUploader from '../components/AvatarUploader';");
}

content = content.replace(
  /<div className="w-20 h-20 bg-purple-900 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner">\s*\{profile\?\.full_name\?\.charAt\(0\) \|\| 'U'\}\s*<\/div>/g,
  '<AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Student"} size="lg" />'
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
