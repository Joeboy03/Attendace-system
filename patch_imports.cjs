const fs = require('fs');

let content = fs.readFileSync('top_part.tsx', 'utf8');
content = content.replace(
  "import { LogOut, Camera, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';",
  "import { LogOut, Camera, CheckCircle, XCircle, Calendar as CalendarIcon, Download, LayoutGrid, List, ArrowUpDown, Filter, ChevronDown, ChevronRight, Target, Award, Clock } from 'lucide-react';"
);

fs.writeFileSync('top_part.tsx', content);
