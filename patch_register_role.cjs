const fs = require('fs');

let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Replace state setup
code = code.replace("const [role, setRole] = useState<UserRole>('student');", "const role: UserRole = 'student';");

// Remove the Role select div
code = code.replace(/<div className="col-span-2 sm:col-span-1">\s*<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">\s*Role\s*<\/label>[\s\S]*?<\/select>\s*<\/div>/, '');

// The next div is `<div className="col-span-2 sm:col-span-1">` which wraps `{role === 'student' ? (...) : (...)}`.
// We should replace that whole block with just the student fields. 
// It's probably easier to just replace the whole form manually.

