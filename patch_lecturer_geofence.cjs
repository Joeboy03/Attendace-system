const fs = require('fs');
let content = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

// Add requireGeofencing state
if (!content.includes('requireGeofencing')) {
  content = content.replace(
    'const [schedules, setSchedules] = useState<ClassSchedule[]>([]);',
    'const [schedules, setSchedules] = useState<ClassSchedule[]>([]);\n  const [requireGeofencing, setRequireGeofencing] = useState(false);'
  );
}

// Modify handleStartSession
const startSessionOld = `  const handleStartSession = async () => {
    if (!selectedCourse || !profile) return;
    
    // Generate a secure random token for the QR code
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration
    
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          course_id: selectedCourse,
          lecturer_id: profile.id,
          session_token: sessionToken,
          is_active: true,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();`;

const startSessionNew = `  const handleStartSession = async () => {
    if (!selectedCourse || !profile) return;
    
    const uuid = crypto.randomUUID();
    let sessionToken = uuid;

    if (requireGeofencing) {
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          sessionToken = JSON.stringify({
            token: uuid,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        } catch (err) {
          alert("Could not get location. Please ensure location services are enabled to use geofencing.");
          return;
        }
      } else {
        alert("Geolocation is not supported by your browser.");
        return;
      }
    }
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration
    
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          course_id: selectedCourse,
          lecturer_id: profile.id,
          session_token: sessionToken,
          is_active: true,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();`;

content = content.replace(startSessionOld, startSessionNew);

// Add the checkbox in the UI
const toggleOld = `<button
                onClick={handleStartSession}
                disabled={!selectedCourse}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors mt-4"
              >`;
const toggleNew = `<div className="flex items-center gap-2 mt-4 mb-2">
                <input 
                  type="checkbox" 
                  id="geofenceToggle"
                  checked={requireGeofencing}
                  onChange={(e) => setRequireGeofencing(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <label htmlFor="geofenceToggle" className="text-sm font-medium text-slate-700">
                  Require Dynamic Geofencing
                </label>
              </div>
              <button
                onClick={handleStartSession}
                disabled={!selectedCourse}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >`;
content = content.replace(toggleOld, toggleNew);

fs.writeFileSync('src/pages/LecturerDashboard.tsx', content);
