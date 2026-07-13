const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('NotificationSubscriber')) {
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { Toaster } from 'react-hot-toast';\nimport NotificationSubscriber from './components/NotificationSubscriber';"
  );
  
  content = content.replace(
    "<Router>",
    "<Router>\n        <Toaster />\n        <NotificationSubscriber />"
  );
  
  fs.writeFileSync('src/App.tsx', content);
}
