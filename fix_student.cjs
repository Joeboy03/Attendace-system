const fs = require('fs');

const fixProfileIcon = (file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/className="w-20 h-20 bg-purple-900 rounded-full flex items-center justify-center text-3xl font-bold text-purple-900 shadow-inner"/g, 'className="w-20 h-20 bg-purple-900 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner"');
    
    // Fix any rogue text-white on buttons that should be white
    // actually they might be correct. Let's look at buttons
    fs.writeFileSync(file, content);
  }
}

fixProfileIcon('src/pages/StudentDashboard.tsx');
