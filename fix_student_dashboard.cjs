const fs = require('fs');
let text = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf-8');

text = text.replace(
  "    department: profile?.department || ''\n  const [facultiesList",
  "    department: profile?.department || ''\n  });\n  const [facultiesList"
);

text = text.replace(
  "        department: profile.department || ''\n    }\n  }, [profile]);",
  "        department: profile.department || ''\n      });\n    }\n  }, [profile]);"
);

text = text.replace(
  "      if (error) throw error;            await refreshProfile();",
  "      if (error) throw error;\n      setProfileUpdateMsg({ type: 'success', text: 'Profile updated successfully!' });\n      await refreshProfile();"
);
text = text.replace(
  "      setTimeout(() => setIsEditingProfile(false), 1500);\n    } catch (error: any) {\n      console.error('Error updating profile:', error);",
  "      setTimeout(() => setIsEditingProfile(false), 1500);\n    } catch (error: any) {\n      setProfileUpdateMsg({ type: 'error', text: error.message || 'Failed to update profile' });\n      console.error('Error updating profile:', error);"
);

text = text.replace(
  "        const courseIds = data.map(e => e.course_id);\n        setSchedules(scheduleData);",
  "        const courseIds = data.map(e => e.course_id);\n        const scheduleData = await fetchSchedules({ course_ids: courseIds });\n        setSchedules(scheduleData);"
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', text);
