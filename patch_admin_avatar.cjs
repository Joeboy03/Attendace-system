const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

if (!content.includes('import AvatarUploader')) {
  content = content.replace("import AdminDepartments from '../components/AdminDepartments';", "import AdminDepartments from '../components/AdminDepartments';\nimport AvatarUploader from '../components/AvatarUploader';");
}

content = content.replace(
  /<div className="flex items-center gap-6">\n\s*<div className="text-right hidden sm:block">\n\s*<p className="text-sm font-semibold text-slate-800">\{profile\?\.full_name\}<\/p>/g,
  `<div className="flex items-center gap-6">
          <AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Admin"} size="sm" />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
