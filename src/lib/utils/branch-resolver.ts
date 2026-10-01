export interface BranchInfo {
  course: string;
  department: string;
}

export function resolveBranchCourseDepartment(
  rawBranch?: string,
  rawCourse?: string,
  rawDept?: string
): BranchInfo {
  const inputStr = [rawBranch, rawCourse, rawDept].filter(Boolean).join(' ').trim().toLowerCase();

  if (inputStr.includes('info') || inputStr.includes('it')) {
    return {
      course: 'B.Tech in Information Technology',
      department: 'Information Technology',
    };
  }
  if (inputStr.includes('ai') || inputStr.includes('ds') || inputStr.includes('data')) {
    return {
      course: 'B.Tech in Artificial Intelligence & Data Science',
      department: 'Artificial Intelligence and Data Science',
    };
  }
  if (inputStr.includes('civil')) {
    return {
      course: 'B.Tech in Civil Engineering',
      department: 'Civil Engineering',
    };
  }
  if (inputStr.includes('mech') || inputStr.includes('mechanical')) {
    return {
      course: 'B.Tech in Mechanical Engineering',
      department: 'Mechanical Engineering',
    };
  }
  if (inputStr.includes('entc') || inputStr.includes('telecom') || inputStr.includes('electronics')) {
    return {
      course: 'B.Tech in Electronics & Telecommunication',
      department: 'Electronics and Telecommunication',
    };
  }
  if (inputStr.includes('electr') || inputStr.includes('ee')) {
    return {
      course: 'B.Tech in Electrical Engineering',
      department: 'Electrical Engineering',
    };
  }
  if (inputStr.includes('cse') || inputStr.includes('computer') || inputStr.includes('cs')) {
    return {
      course: 'B.Tech in Computer Science',
      department: 'Computer Science and Engineering',
    };
  }

  // Fallback if not matched
  const fallbackDept = rawDept || rawBranch || 'Computer Science and Engineering';
  const fallbackCourse = rawCourse || (rawBranch ? `B.Tech in ${rawBranch}` : 'B.Tech in Computer Science');
  return {
    course: fallbackCourse,
    department: fallbackDept,
  };
}

export function matchesBranch(s: { department?: string; course?: string }, selectedBranch: string): boolean {
  if (!selectedBranch || selectedBranch === 'all') return true;

  const dept = (s.department || '').toLowerCase();
  const course = (s.course || '').toLowerCase();
  const search = selectedBranch.toLowerCase();

  if (search.includes('info') || search.includes('it')) {
    return dept.includes('info') || dept.includes('it') || course.includes('info') || course.includes('it');
  }
  if (search.includes('comp') || search.includes('cse') || search.includes('cs')) {
    return dept.includes('comp') || dept.includes('cse') || dept.includes('cs') || course.includes('comp') || course.includes('cse');
  }
  if (search.includes('ai') || search.includes('ds') || search.includes('data')) {
    return dept.includes('ai') || dept.includes('ds') || dept.includes('data') || course.includes('ai') || course.includes('ds');
  }
  if (search.includes('civil')) {
    return dept.includes('civil') || course.includes('civil');
  }
  if (search.includes('mech')) {
    return dept.includes('mech') || course.includes('mech');
  }
  if (search.includes('entc') || search.includes('telecom') || search.includes('electronics')) {
    return dept.includes('entc') || dept.includes('telecom') || course.includes('entc') || course.includes('telecom');
  }
  if (search.includes('electr') || search.includes('ee')) {
    return dept.includes('electr') || dept.includes('ee') || course.includes('electr') || course.includes('ee');
  }

  return dept.includes(search) || course.includes(search);
}
