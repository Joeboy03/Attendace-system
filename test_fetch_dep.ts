import { fetchFaculties, fetchDepartments } from './src/lib/departments.ts';
console.log('faculties', await fetchFaculties());
console.log('departments', await fetchDepartments());
