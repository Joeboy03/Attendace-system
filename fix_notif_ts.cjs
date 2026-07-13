const fs = require('fs');
let content = fs.readFileSync('src/components/NotificationSubscriber.tsx', 'utf8');

content = content.replace(
  '{course.course_code}',
  '{(course as any).course_code || (course as any)[0]?.course_code}'
);

fs.writeFileSync('src/components/NotificationSubscriber.tsx', content);
