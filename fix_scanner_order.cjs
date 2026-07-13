const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

// The block to move
const effectBlock = `  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
      scanner.render(onScanSuccess, onScanFailure);
      
      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [scanning]);`;

content = content.replace(effectBlock, '');

// Insert it right before the return statement or after onScanFailure
content = content.replace(
  '  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);',
  effectBlock + '\n\n  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);'
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
