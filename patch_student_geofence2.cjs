const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const onScanSuccessRegex = /const onScanSuccess = async \([\s\S]*?\} catch \(error: any\) \{\n      console\.error\("Scan error:", error\);\n      setScanResult\(\{ status: 'error', message: error\.message \|\| 'Failed to scan code\.' \}\);\n    \}\n  \};/;

const newScanLogic = `  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
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

      // Parse dynamic geofencing from token if present
      let requiredLat: number | null = null;
      let requiredLng: number | null = null;
      try {
        const parsedToken = JSON.parse(data.token);
        if (parsedToken.lat && parsedToken.lng) {
          requiredLat = parsedToken.lat;
          requiredLng = parsedToken.lng;
        }
      } catch(e) {
        // Geofencing not required for this session
      }

      const processAttendance = async (lat?: number, lng?: number) => {
        try {
            if (requiredLat !== null && requiredLng !== null && lat !== undefined && lng !== undefined) {
              const distance = Math.sqrt(Math.pow(lat - requiredLat, 2) + Math.pow(lng - requiredLng, 2));
              // Allow within approx 50-100 meters (roughly 0.0005 to 0.001 degrees)
              if (distance > 0.001) {
                throw new Error("You are too far from the class location to sign in.");
              }
            }
            
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
            setRefreshKey(prev => prev + 1);
        } catch(err: any) {
            setScanResult({ status: 'error', message: err.message || "Failed to mark attendance" });
        }
      };

      if (requiredLat !== null && requiredLng !== null) {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              processAttendance(position.coords.latitude, position.coords.longitude);
            }, 
            (error) => {
              setScanResult({ status: 'error', message: "Location access is required for this session." });
            }
          );
        } else {
          setScanResult({ status: 'error', message: "Geolocation is not supported by your browser." });
        }
      } else {
        // No geofence required
        processAttendance();
      }

    } catch (error: any) {
      console.error("Scan error:", error);
      setScanResult({ status: 'error', message: error.message || 'Failed to scan code.' });
    }
  };`;

content = content.replace(onScanSuccessRegex, newScanLogic.trim());
fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
