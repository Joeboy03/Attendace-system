const fs = require('fs');

let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

// Replace imports
content = content.replace("import { facultiesData } from '../data/faculties';", "import { fetchFaculties, fetchDepartments } from '../lib/departments';\nimport { Faculty, Department } from '../types';\nimport { useEffect, useState } from 'react';");

// Check if useState or useEffect is already imported from React, remove duplicates if any (simple approach)
// The file probably already imports React, useState, useEffect.
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");

// Let's add state variables to the component
const stateVars = `
  const [facultiesList, setFacultiesList] = useState<Faculty[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);

  useEffect(() => {
    fetchFaculties().then(setFacultiesList);
  }, []);

  useEffect(() => {
    if (profileForm.faculty) {
      const f = facultiesList.find(fac => fac.name === profileForm.faculty);
      if (f) {
        fetchDepartments(f.id).then(setDepartmentsList);
      } else {
        setDepartmentsList([]);
      }
    } else {
      setDepartmentsList([]);
    }
  }, [profileForm.faculty, facultiesList]);
`;

// Insert the stateVars right after the component declaration (export default function StudentDashboard...)
content = content.replace("export default function StudentDashboard() {", "export default function StudentDashboard() {" + stateVars);

// Replace faculty options
content = content.replace("{Object.keys(facultiesData).map(faculty => (\n                                      <option key={faculty} value={faculty}>{faculty}</option>\n                                    ))}", "{facultiesList.map(faculty => (\n                                      <option key={faculty.id} value={faculty.name}>{faculty.name}</option>\n                                    ))}");

// Replace department options
content = content.replace("{profileForm.faculty && facultiesData[profileForm.faculty as keyof typeof facultiesData]?.map((dept: string) => (\n                                      <option key={dept} value={dept}>{dept}</option>\n                                    ))}", "{departmentsList.map(dept => (\n                                      <option key={dept.id} value={dept.name}>{dept.name}</option>\n                                    ))}");

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
