const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const updatedInsert = `
      let insertData = {
        course_code: newCourseCode.toUpperCase(),
        course_title: newCourseTitle,
        lecturer_id: selectedLecturer || null,
        faculty: newCourseFaculty,
        department: newCourseDepartment
      };
      
      let { error } = await supabase.from('courses').insert(insertData);
      
      if (error && error.code === 'PGRST204') {
        // Fallback if columns not added to supabase yet
        delete insertData.faculty;
        delete insertData.department;
        const fallback = await supabase.from('courses').insert(insertData);
        error = fallback.error;
        if (!error) {
           alert("Course created, but faculty/department were ignored because columns are missing in Supabase. Please add 'faculty' and 'department' columns to the 'courses' table.");
        }
      }
`;

content = content.replace(
  /const \{ error \} = await supabase\.from\('courses'\)\.insert\(\{[\s\S]*?\}\);/,
  updatedInsert
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
