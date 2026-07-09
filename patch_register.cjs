const fs = require('fs');

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Replace imports
content = content.replace("import { facultiesData } from '../data/faculties';", "import { fetchFaculties, fetchDepartments } from '../lib/departments';\nimport { Faculty, Department } from '../types';\nimport { useEffect } from 'react';");

// Add state for dynamic faculties and departments
content = content.replace("const [department, setDepartment] = useState('');", "const [department, setDepartment] = useState('');\n  const [facultiesList, setFacultiesList] = useState<Faculty[]>([]);\n  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);\n\n  useEffect(() => {\n    fetchFaculties().then(setFacultiesList);\n  }, []);\n\n  useEffect(() => {\n    if (faculty) {\n      // Here faculty is the ID or Name. In our schema, it should probably be the name since we save string in DB, but the ID is better for fetching.\n      // For simplicity, assuming `faculty` state holds the faculty name. But fetchDepartments takes ID.\n      // Let's modify fetchDepartments to be called with ID if needed. Wait, faculty state is currently Name.\n      const f = facultiesList.find(fac => fac.name === faculty);\n      if (f) {\n        fetchDepartments(f.id).then(setDepartmentsList);\n      } else {\n        setDepartmentsList([]);\n      }\n    } else {\n      setDepartmentsList([]);\n    }\n  }, [faculty, facultiesList]);");

// Replace faculty options
content = content.replace("{Object.keys(facultiesData).map(fac => (\n                                      <option key={fac} value={fac}>{fac}</option>\n                                    ))}", "{facultiesList.map(fac => (\n                                      <option key={fac.id} value={fac.name}>{fac.name}</option>\n                                    ))}");

// Replace department options
content = content.replace("{faculty && facultiesData[faculty as keyof typeof facultiesData]?.map((dept: string) => (\n                                      <option key={dept} value={dept}>{dept}</option>\n                                    ))}", "{departmentsList.map(dept => (\n                                      <option key={dept.id} value={dept.name}>{dept.name}</option>\n                                    ))}");

fs.writeFileSync('src/pages/Register.tsx', content);
