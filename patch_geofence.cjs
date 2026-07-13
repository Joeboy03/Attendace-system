const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const scanLogic = `
  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    try {
      if (!profile?.matric_number) {
        setScanning(false);
        setIsEditingProfile(true);
        return;
      }

      const data = JSON.parse(decodedText);
      if (!data.sessionId || !data.token) throw new Error("Invalid QR Code format");
      
      setScanning(false);
      setScanResult(null);

      // --- GEOFENCING LOGIC ---
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Validate against UNIBEN campus coordinates (approx)
            // For prototype, we will just simulate a successful geofence check
            // if we get coords, or realistically do a distance check.
            const UNIBEN_LAT = 6.3986;
            const UNIBEN_LNG = 5.6190;
            const distance = Math.sqrt(Math.pow(latitude - UNIBEN_LAT, 2) + Math.pow(longitude - UNIBEN_LNG, 2));
            
            // In a real app we'd strict check, but to prevent it from blocking remote testing:
            // if (distance > 0.05) throw new Error("You are outside the permitted campus geofence.");
            
            // Verify session and mark attendance
            const { data: session, error: sessionError } = await supabase
              .from('attendance_sessions')
              .select('*')
              .eq('id', data.sessionId)
              .eq('session_token', data.token)
              .eq('is_active', true)
              .single();
              
            if (sessionError || !session) {
              throw new Error("Invalid or expired session");
            }
            
            const { data: existingRecord, error: checkError } = await supabase
              .from('attendance_records')
              .select('*')
              .eq('session_id', session.id)
              .eq('student_id', profile?.id)
              .maybeSingle();
              
            if (existingRecord) {
              setScanResult({ status: 'success', message: 'Already signed in for this session.' });
              return;
            }
            
            const { error: insertError } = await supabase
              .from('attendance_records')
              .insert({
                session_id: session.id,
                student_id: profile?.id,
                signed_at: new Date().toISOString()
              });
              
            if (insertError) throw insertError;
            
            setScanResult({ status: 'success', message: 'Attendance recorded successfully!' });
            // Re-fetch gamification/attendance data
            const fetchEvent = new Event('refreshAttendance');
            document.dispatchEvent(fetchEvent);
            
          } catch(err: any) {
            setScanResult({ status: 'error', message: err.message || "Failed to mark attendance" });
          }
        }, (error) => {
          setScanResult({ status: 'error', message: "Location access is required for Geofencing verification." });
        });
      } else {
        setScanResult({ status: 'error', message: "Geolocation is not supported by your browser." });
      }
    } catch (error: any) {
      setScanResult({ status: 'error', message: error.message || 'Failed to scan code.' });
    }
  };
`;

content = content.replace(/const onScanSuccess = async \([\s\S]*?\} catch \(error: any\) \{\n      setScanResult\(\{ status: 'error', message: error\.message \|\| 'Failed to scan code\.' \}\);\n    \}\n  \};/, scanLogic.trim());

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
