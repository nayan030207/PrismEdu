import { generateDefaultPassword } from '@/lib/auth/password';

export interface DemoFaculty {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  date_of_birth?: string;
  initialPassword?: string;
  department: string;
  designation: string;
  specialization: string;
  status: 'active' | 'inactive';
}

export const INITIAL_DEMO_FACULTY: DemoFaculty[] = [];

declare global {
  // eslint-disable-next-line no-var
  var __PRISM_DEMO_FACULTY: DemoFaculty[] | undefined;
}

export function getDemoFaculty(): DemoFaculty[] {
  if (!globalThis.__PRISM_DEMO_FACULTY) {
    globalThis.__PRISM_DEMO_FACULTY = [...INITIAL_DEMO_FACULTY];
  }
  return globalThis.__PRISM_DEMO_FACULTY;
}

export function addDemoFaculty(faculty: Partial<DemoFaculty> & { full_name: string; email: string }): DemoFaculty {
  const generatedPass = generateDefaultPassword(faculty.email, faculty.date_of_birth, faculty.full_name);

  const newFaculty: DemoFaculty = {
    id: faculty.id || `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    employee_id: faculty.employee_id || `FAC-${Math.floor(100 + Math.random() * 900)}`,
    full_name: faculty.full_name,
    email: faculty.email,
    mobile: faculty.mobile || '+91 9876543210',
    date_of_birth: faculty.date_of_birth || '1982-05-03',
    initialPassword: faculty.initialPassword || generatedPass,
    department: faculty.department || 'Computer Science and Engineering',
    designation: faculty.designation || 'Assistant Professor',
    specialization: faculty.specialization || 'Computer Science',
    status: faculty.status || 'active',
  };

  const list = getDemoFaculty();
  const existingIdx = list.findIndex((f) => f.email === newFaculty.email || f.employee_id === newFaculty.employee_id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...newFaculty };
    return list[existingIdx];
  }

  list.push(newFaculty);
  return newFaculty;
}
