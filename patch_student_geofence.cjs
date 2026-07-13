const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const scanLogicOld = `      const data = JSON.parse(decodedText);
      if (!data.sessionId || !data.token) throw new Error("Invalid QR Code format");
      
      setScanning(false);
      setScanResult(null);

      // --- GEOFENCING LOGIC ---
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Validate against UNIBEN campus coordinates (approx)
            const UNIBEN_LAT = 6.3986;
            const UNIBEN_LNG = 5.6190;
            const distance = Math.sqrt(Math.pow(latitude - UNIBEN_LAT, 2) + Math.pow(longitude - UNIBEN_LNG, 2));
            
            // In a real app we'd strict check, but to prevent it from blocking remote testing:
            if (distance > 0.05) throw new Error("You are outside the permitted campus geofence. You must be on the UNIBEN campus to sign in.");
            
            // Verify session and mark attendance`;

const scanLogicNew = `      const data = JSON.parse(decodedText);
      if (!data.sessionId || !data.token) throw new Error("Invalid QR Code format");
      
      setScanning(false);
      setScanResult(null);

      // Parse dynamic geofencing from token if present
      let requiredLat = null;
      let requiredLng = null;
      try {
        const parsedToken = JSON.parse(data.token);
        if (parsedToken.lat && parsedToken.lng) {
          requiredLat = parsedToken.lat;
          requiredLng = parsedToken.lng;
        }
      } catch(e) {
        // Token is not JSON (geofencing disabled)
      }

      // --- GEOFENCING LOGIC ---
      const processAttendance = async () => {
        try {
            // Verify session and mark attendance`;

// We also need to fix the brace matching and closing for processAttendance.
// Instead of a giant replace, I'll rewrite the entire onScanSuccess to be clean.
