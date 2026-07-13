const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('OfflineIndicator')) {
  content = content.replace(
    "import NotificationSubscriber from './components/NotificationSubscriber';",
    "import NotificationSubscriber from './components/NotificationSubscriber';\nimport OfflineIndicator from './components/OfflineIndicator';"
  );
  
  content = content.replace(
    "<NotificationSubscriber />",
    "<NotificationSubscriber />\n        <OfflineIndicator />"
  );
  
  fs.writeFileSync('src/App.tsx', content);
}
