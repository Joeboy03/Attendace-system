const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const oldLogic = `      if (existingRecord) {
        return;
      }
      
      // Mark attendance
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          session_id: session.id,
          student_id: profile?.id
        });
        if (insertError) throw insertError;
      
      
    } catch (error: any) {
      console.error("Scan error:", error);
      setScanning(false);
    }`;

const newLogic = `      if (existingRecord) {
        setScanResult({ status: 'success', message: 'Already signed in for this session.' });
        return;
      }
      
      // Mark attendance
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          session_id: session.id,
          student_id: profile?.id
        });
        
      if (insertError) throw insertError;
      
      setScanResult({ status: 'success', message: 'Attendance marked successfully!' });
      
    } catch (error: any) {
      console.error("Scan error:", error);
      setScanning(false);
      setScanResult({ status: 'error', message: error.message || 'Failed to scan QR code' });
    }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
