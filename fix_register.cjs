const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Add imports for createFaculty, createDepartment
code = code.replace(
  "import { fetchFaculties, fetchDepartments } from '../lib/departments';",
  "import { fetchFaculties, fetchDepartments, createFaculty, createDepartment } from '../lib/departments';"
);

// Replace handleRegister body
const oldValidationCode = `
    const selectedFac = facultiesList.find(f => f.name.toLowerCase() === faculty.toLowerCase());
    if (!selectedFac) {
      setError('The entered faculty does not exist.');
      setLoading(false);
      return;
    }
    
    const selectedDept = departmentsList.find(d => d.name.toLowerCase() === department.toLowerCase());
    if (!selectedDept) {
      setError('The entered department does not exist in the selected faculty.');
      setLoading(false);
      return;
    }
`;

const newValidationCode = `
    let selectedFac = facultiesList.find(f => f.name.toLowerCase() === faculty.toLowerCase());
    if (!selectedFac) {
      selectedFac = await createFaculty(faculty);
    }
    
    let selectedDept = departmentsList.find(d => d.name.toLowerCase() === department.toLowerCase());
    if (!selectedDept && selectedFac) {
      selectedDept = await createDepartment(department, selectedFac.id);
    }
`;

code = code.replace(oldValidationCode, newValidationCode);

fs.writeFileSync('src/pages/Register.tsx', code);
