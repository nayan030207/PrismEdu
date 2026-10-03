const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 1. Curated realistic student profiles pool
const firstNamesMale = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharva', 'Kabir', 'Rohan', 'Dhruv', 'Pranav', 'Om', 'Vedant', 'Samarth', 'Aryan',
  'Yash', 'Siddharth', 'Varun', 'Tejas', 'Aniket', 'Harsh', 'Manish', 'Kunal', 'Nikhil', 'Gaurav'
];

const firstNamesFemale = [
  'Saanvi', 'Aanya', 'Aadhya', 'Aarohi', 'Ananya', 'Diya', 'Gauri', 'Isha', 'Kavya', 'Khushi',
  'Myra', 'Navya', 'Pari', 'Prisha', 'Riya', 'Sneha', 'Tanvi', 'Vaidehi', 'Pooja', 'Shruti',
  'Neha', 'Meera', 'Rutuja', 'Sayali', 'Pallavi', 'Divya', 'Shreya', 'Anjali', 'Akanksha', 'Swati'
];

const lastNames = [
  'Sharma', 'Patel', 'Gupta', 'Verma', 'Kulkarni', 'Jadhav', 'Pawar', 'More', 'Deshmukh', 'Patil',
  'Shinde', 'Bhosale', 'Desai', 'Chavan', 'Gaikwad', 'Mane', 'Joshi', 'Bhat', 'Rao', 'Reddy',
  'Mehta', 'Shah', 'Nair', 'Menon', 'Chopra', 'Malhotra', 'Bansal', 'Agrawal', 'Singhania', 'Kapoor'
];

const departments = [
  { code: 'CSE', name: 'Computer Science and Engineering', courseCode: 'BTECH-CSE', courseName: 'B.Tech in Computer Science' },
  { code: 'IT', name: 'Information Technology', courseCode: 'BTECH-IT', courseName: 'B.Tech in Information Technology' },
  { code: 'MECH', name: 'Mechanical Engineering', courseCode: 'BTECH-MECH', courseName: 'B.Tech in Mechanical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering', courseCode: 'BTECH-CIVIL', courseName: 'B.Tech in Civil Engineering' },
  { code: 'ECE', name: 'Electronics and Communication', courseCode: 'BTECH-ECE', courseName: 'B.Tech in Electronics & Communication' },
  { code: 'AIDS', name: 'Artificial Intelligence and Data Science', courseCode: 'BTECH-AIDS', courseName: 'B.Tech in AI & Data Science' },
];

const schools = [
  'Delhi Public School', 'St. Xavier High School', 'Kendriya Vidyalaya No. 1', 'Bhavan Vidya Mandir',
  'Ryan International School', 'Podar International School', 'Army Public School', 'DAV Public School',
  'The Bishop School', 'Loyola High School', 'National Public School', 'Singhania High School'
];

const juniorColleges = [
  'Fergusson Junior College', 'St. Vincent High & Jr College', 'Modern Junior College of Science',
  'Garware College of Science', 'N.M. Junior College', 'Ruparel College of Arts & Science',
  'K.J. Somaiya Jr College', 'Mithibai Junior College', 'Nowrosjee Wadia College', 'BMCC Junior Wing'
];

const boards = ['CBSE', 'Maharashtra State Board', 'ICSE'];

// Function to generate standard password formula: Name@ddmm
function computeDefaultPassword(fullName, dobStr) {
  const cleanName = fullName.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
  const firstName = cleanName.split(/\s+/)[0];
  const capName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  
  const parts = dobStr.split('-'); // YYYY-MM-DD
  const dd = parts[2] ? parts[2].padStart(2, '0') : '01';
  const mm = parts[1] ? parts[1].padStart(2, '0') : '01';
  return `${capName}@${dd}${mm}`;
}

function generate100Students() {
  const students = [];
  const usedEmails = new Set();
  const usedStudentIds = new Set();

  for (let i = 1; i <= 100; i++) {
    const isFemale = i % 2 === 0;
    const firstList = isFemale ? firstNamesFemale : firstNamesMale;
    const firstName = firstList[(i - 1) % firstList.length];
    const lastName = lastNames[(i * 3 + 5) % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const gender = isFemale ? 'female' : 'male';

    const stuIdNum = 2000 + i;
    const studentId = `STU${stuIdNum}`;
    usedStudentIds.add(studentId);

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${stuIdNum}@student.prismedu.com`;
    usedEmails.add(email);

    // Realistic Date of Birth between 2003-2005
    const birthYear = 2003 + (i % 3); // 2003, 2004, 2005
    const birthMonth = String(1 + (i % 12)).padStart(2, '0');
    const birthDay = String(1 + ((i * 7) % 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const dept = departments[(i - 1) % departments.length];
    const academicYear = 1 + (i % 4); // 1st, 2nd, 3rd, or 4th year
    const admissionYear = 2025 - academicYear;

    const school10 = schools[(i * 2) % schools.length];
    const board10 = boards[i % boards.length];
    const passingYear10 = admissionYear - 2;

    const college12 = juniorColleges[(i * 3) % juniorColleges.length];
    const board12 = boards[(i + 1) % boards.length];
    const passingYear12 = admissionYear;

    // Academic risk profile stratification for diverse ML & Analytics distribution:
    // ~12% High/Critical risk, ~20% Emerging/Moderate risk, ~68% Low/Healthy risk
    let gpa, backlogs, tenthPct, twelfthPct, phy, chem, math, income, finAssist;
    let attendanceRate;

    if (i <= 6) {
      // Critical Risk Profile (Very low attendance, backlogs, low gpa)
      attendanceRate = 48 + (i % 10);
      backlogs = 2 + (i % 3);
      gpa = Number((4.6 + (i * 0.15)).toFixed(2));
      tenthPct = Number((62.0 + (i * 1.5)).toFixed(1));
      twelfthPct = Number((58.0 + (i * 1.8)).toFixed(1));
      phy = Math.round(52 + (i % 8));
      chem = Math.round(54 + (i % 8));
      math = Math.round(48 + (i % 6));
      income = 35000 + (i * 2000); // Low income (< 50,000)
      finAssist = 'required';
    } else if (i <= 14) {
      // High Risk Profile (Low attendance, backlogs)
      attendanceRate = 58 + (i % 10);
      backlogs = 1 + (i % 2);
      gpa = Number((5.8 + (i * 0.1)).toFixed(2));
      tenthPct = Number((68.0 + (i * 1.2)).toFixed(1));
      twelfthPct = Number((64.0 + (i * 1.4)).toFixed(1));
      phy = Math.round(62 + (i % 10));
      chem = Math.round(60 + (i % 10));
      math = Math.round(58 + (i % 10));
      income = 48000 + (i * 3000);
      finAssist = i % 2 === 0 ? 'required' : 'partial';
    } else if (i <= 32) {
      // Moderate / Emerging Risk Profile (Moderate attendance 68-76%, backlogs 0-1)
      attendanceRate = 68 + (i % 9);
      backlogs = i % 3 === 0 ? 1 : 0;
      gpa = Number((6.5 + ((i % 10) * 0.12)).toFixed(2));
      tenthPct = Number((74.0 + (i % 8)).toFixed(1));
      twelfthPct = Number((71.0 + (i % 7)).toFixed(1));
      phy = Math.round(72 + (i % 10));
      chem = Math.round(70 + (i % 10));
      math = Math.round(68 + (i % 10));
      income = 75000 + ((i % 10) * 15000);
      finAssist = i % 3 === 0 ? 'partial' : 'not_required';
    } else {
      // Low Risk / Good Standing Profile (Attendance 82-96%, 0 backlogs, high GPA)
      attendanceRate = 82 + ((i * 3) % 16);
      backlogs = 0;
      gpa = Number((7.4 + ((i % 25) * 0.1)).toFixed(2));
      tenthPct = Number((82.0 + (i % 14)).toFixed(1));
      twelfthPct = Number((79.0 + (i % 15)).toFixed(1));
      phy = Math.round(80 + (i % 16));
      chem = Math.round(82 + (i % 15));
      math = Math.round(85 + (i % 14));
      income = 180000 + ((i % 20) * 45000);
      finAssist = 'not_required';
    }

    const jeePercentile = Number(Math.min(99.4, Math.max(55.0, twelfthPct + (i % 12) - 4)).toFixed(2));
    const jeeRank = Math.round((100 - jeePercentile) * 11500);
    const mhtCetPercentile = Number(Math.min(99.6, Math.max(58.0, twelfthPct + 2 + (i % 10))).toFixed(2));
    const mhtCetRank = Math.round((100 - mhtCetPercentile) * 2100);
    const categoryRank = Math.round(mhtCetRank * 0.35);

    const guardianFirst = isFemale ? firstNamesMale[(i + 4) % firstNamesMale.length] : firstNamesMale[(i + 7) % firstNamesMale.length];
    const guardianName = `${guardianFirst} ${lastName}`;
    const guardianMobile = `+91 ${9800000000 + i * 187654}`;
    const studentMobile = `+91 ${9100000000 + i * 298765}`;
    const password = computeDefaultPassword(fullName, dob);

    students.push({
      role: 'student',
      employee_id: '',
      designation: '',
      specialization: '',
      student_id: studentId,
      full_name: fullName,
      email: email,
      mobile: studentMobile,
      date_of_birth: dob,
      gender: gender,
      course_code: dept.courseCode,
      department_code: dept.code,
      academic_year: academicYear,
      admission_year: admissionYear,
      tenth_school_name: school10,
      tenth_board: board10,
      tenth_passing_year: passingYear10,
      tenth_percentage: tenthPct,
      twelfth_school_name: college12,
      twelfth_board: board12,
      twelfth_passing_year: passingYear12,
      physics_marks: phy,
      chemistry_marks: chem,
      maths_marks: math,
      twelfth_percentage: twelfthPct,
      jee_main_percentile: jeePercentile,
      jee_main_rank: jeeRank,
      mht_cet_percentile: mhtCetPercentile,
      mht_cet_rank: mhtCetRank,
      category_rank: categoryRank,
      cap_round_allotment: `CAP Round ${(i % 3) + 1} - ${dept.name}`,
      previous_gpa: gpa,
      previous_backlogs: backlogs,
      family_income: income,
      financial_assistance: finAssist,
      guardian_name: guardianName,
      guardian_mobile: guardianMobile,
      // Metadata fields for verification & algorithm testing
      attendance_percentage: attendanceRate,
      initialPassword: password
    });
  }

  return students;
}

function buildExcelFile(studentsList, outputPath) {
  const headers = [
    'role',
    'employee_id',
    'designation',
    'specialization',
    'student_id',
    'full_name',
    'email',
    'mobile',
    'date_of_birth',
    'gender',
    'course_code',
    'department_code',
    'academic_year',
    'admission_year',
    'tenth_school_name',
    'tenth_board',
    'tenth_passing_year',
    'tenth_percentage',
    'twelfth_school_name',
    'twelfth_board',
    'twelfth_passing_year',
    'physics_marks',
    'chemistry_marks',
    'maths_marks',
    'twelfth_percentage',
    'jee_main_percentile',
    'jee_main_rank',
    'mht_cet_percentile',
    'mht_cet_rank',
    'category_rank',
    'cap_round_allotment',
    'previous_gpa',
    'previous_backlogs',
    'family_income',
    'financial_assistance',
    'guardian_name',
    'guardian_mobile',
    'attendance_percentage'
  ];

  const rows = [headers];

  for (const s of studentsList) {
    rows.push([
      s.role,
      s.employee_id,
      s.designation,
      s.specialization,
      s.student_id,
      s.full_name,
      s.email,
      s.mobile,
      s.date_of_birth,
      s.gender,
      s.course_code,
      s.department_code,
      s.academic_year,
      s.admission_year,
      s.tenth_school_name,
      s.tenth_board,
      s.tenth_passing_year,
      s.tenth_percentage,
      s.twelfth_school_name,
      s.twelfth_board,
      s.twelfth_passing_year,
      s.physics_marks,
      s.chemistry_marks,
      s.maths_marks,
      s.twelfth_percentage,
      s.jee_main_percentile,
      s.jee_main_rank,
      s.mht_cet_percentile,
      s.mht_cet_rank,
      s.category_rank,
      s.cap_round_allotment,
      s.previous_gpa,
      s.previous_backlogs,
      s.family_income,
      s.financial_assistance,
      s.guardian_name,
      s.guardian_mobile,
      s.attendance_percentage
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Cohort');
  XLSX.writeFile(workbook, outputPath);

  console.log(`[Excel Generation] Successfully written ${studentsList.length} students to: ${outputPath}`);
}

module.exports = {
  generate100Students,
  buildExcelFile
};

if (require.main === module) {
  const students = generate100Students();
  const outputPath = path.join(__dirname, '..', 'PRISM_Students_100_Cohort.xlsx');
  buildExcelFile(students, outputPath);
}
