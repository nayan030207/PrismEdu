import * as XLSX from 'xlsx';
import { z } from 'zod';
import type {
  StudentImportRow,
  ImportValidationResult,
  ImportError,
  ImportDuplicate,
  HeaderTagMapping,
  ParseFileResult,
} from '@/types';

const FIELD_ALIASES: Record<string, string[]> = {
  role: ['role', 'user_role', 'account_type', 'user_type', 'type'],
  employee_id: ['employee_id', 'employee id', 'emp_id', 'empid', 'faculty_id', 'staff_id', 'emp_no', 'employee_no'],
  designation: ['designation', 'job_title', 'post', 'position', 'title'],
  specialization: ['specialization', 'specialisation', 'domain', 'field', 'area'],
  student_id: [
    'student_id', 'student id', 'studentid', 'prn', 'prn_number', 'prn_no',
    'roll_no', 'roll_number', 'rollno', 'enrollment_no', 'enrollment_number',
    'reg_no', 'registration_number', 'id', 'student_code', 'user_id', 'urn'
  ],
  full_name: [
    'full_name', 'full name', 'fullname', 'name', 'student_name', 'candidate_name',
    'user_name', 'faculty_name', 'name_of_student', 'name_of_candidate',
    'first_name', 'display_name', 'student_full_name'
  ],
  email: [
    'email', 'email_id', 'email id', 'email_address', 'emailaddress', 'mail',
    'official_email', 'student_email', 'email_id_official'
  ],
  mobile: [
    'mobile', 'mobile_no', 'mobile no', 'mobile_number', 'phone', 'phone_no',
    'phone no', 'phone_number', 'contact', 'contact_no', 'contact_number',
    'telephone', 'whatsapp', 'cell_no', 'student_mobile'
  ],
  date_of_birth: [
    'date_of_birth', 'date of birth', 'dob', 'birth_date', 'birthdate',
    'd_o_b', 'd.o.b', 'd.o.b.', 'date_of_birth_dd_mm_yyyy', 'date_of_birth_yyyy_mm_dd',
    'bday', 'birthday', 'dateofbirth', 'birth_day', 'date', 'student_dob',
    'applicant_dob', 'dob_dd_mm_yyyy', 'birth_dt', 'dob_date', 'date_birth', 'birth'
  ],
  gender: ['gender', 'sex', 'gender_m_f'],
  course_code: ['course_code', 'course code', 'course', 'branch', 'program', 'programme', 'degree', 'stream', 'course_name'],
  department_code: ['department_code', 'department code', 'department', 'dept', 'dept_code', 'branch_code', 'dept_name'],
  academic_year: ['academic_year', 'academic year', 'current_year', 'year', 'year_of_study', 'class_year', 'curr_year', 'sem_year'],
  admission_year: ['admission_year', 'admission year', 'year_of_admission', 'joining_year', 'batch', 'admit_year'],
  tenth_school_name: ['tenth_school_name', '10th_school_name', '10th_school', 'tenth_school', 'ssc_school', '10th_school_college', 'ssc_school_name'],
  tenth_board: ['tenth_board', '10th_board', 'tenth_board_name', 'ssc_board', '10th_board_name', 'ssc_board_name'],
  tenth_passing_year: ['tenth_passing_year', '10th_passing_year', '10th_pass_year', 'tenth_pass_year', 'ssc_year', '10th_year', 'ssc_pass_year'],
  tenth_percentage: [
    'tenth_percentage', '10th_percentage', '10th_%', '10th_percent', 'tenth_percent',
    '10th_marks_%', 'ssc_%', 'ssc_percentage', '10th_marks', '10th_score', '10th_aggregate_%', 'ssc_marks'
  ],
  twelfth_school_name: ['twelfth_school_name', '12th_school_name', '12th_school', 'twelfth_school', 'hsc_college', '12th_college', 'jr_college', 'hsc_school_name'],
  twelfth_board: ['twelfth_board', '12th_board', 'twelfth_board_name', 'hsc_board', '12th_board_name', 'hsc_board_name'],
  twelfth_passing_year: ['twelfth_passing_year', '12th_passing_year', '12th_pass_year', 'twelfth_pass_year', 'hsc_year', '12th_year', 'hsc_pass_year'],
  physics_marks: ['physics_marks', 'physics', 'phy_marks', 'physics_score'],
  chemistry_marks: ['chemistry_marks', 'chemistry', 'chem_marks', 'chemistry_score'],
  maths_marks: ['maths_marks', 'maths', 'mathematics', 'math_marks', 'mathematics_marks', 'math_score'],
  twelfth_percentage: [
    'twelfth_percentage', '12th_percentage', '12th_%', '12th_percent', 'twelfth_percent',
    '12th_marks_%', 'hsc_%', 'hsc_percentage', '12th_marks', '12th_score', '12th_aggregate_%', 'hsc_marks'
  ],
  jee_main_percentile: ['jee_main_percentile', 'jee_percentile', 'jee_main_score', 'jee_%ile', 'jee_score', 'jee_percent', 'jee_main_percent'],
  jee_main_rank: ['jee_main_rank', 'jee_rank', 'jee_main_air', 'jee_air', 'jee_all_india_rank'],
  mht_cet_percentile: ['mht_cet_percentile', 'mht_cet_score', 'cet_percentile', 'cet_score', 'cet_%ile', 'mht_cet_%ile', 'cet_percent'],
  mht_cet_rank: ['mht_cet_rank', 'cet_rank', 'state_rank', 'mht_cet_state_rank'],
  category_rank: ['category_rank', 'cat_rank', 'caste_rank', 'reservation_rank'],
  cap_round_allotment: ['cap_round_allotment', 'cap_round', 'allotment', 'cap_allotment', 'admission_seat_type', 'cap_seat_allotment'],
  previous_gpa: ['previous_gpa', 'gpa', 'cgpa', 'sgpa', 'current_gpa', 'latest_gpa', 'last_gpa'],
  previous_backlogs: ['previous_backlogs', 'backlogs', 'active_backlogs', 'live_backlogs', 'kt', 'kts', 'total_backlogs'],
  family_income: ['family_income', 'annual_income', 'income', 'parent_income', 'family_annual_income'],
  financial_assistance: ['financial_assistance', 'scholarship', 'need_scholarship', 'financial_aid', 'assistance_required'],
  guardian_name: ['guardian_name', 'father_name', 'parent_name', 'mother_name', 'father_s_name', 'guardian', 'parent_guardian_name'],
  guardian_mobile: ['guardian_mobile', 'parent_mobile', 'father_mobile', 'parent_contact', 'guardian_phone', 'parent_phone']
};

export function resolveHeaderTag(rawTag: string): { resolvedField: string | null; matched: boolean; normalizedTag: string } {
  if (!rawTag || typeof rawTag !== 'string') {
    return { resolvedField: null, matched: false, normalizedTag: '' };
  }

  const trimmed = rawTag.trim();
  const normalizedTag = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, '_');
  const cleanNoUnderscore = normalizedTag.replace(/_/g, ' ');

  // 1. Direct match with FIELD_ALIASES
  for (const [targetField, aliases] of Object.entries(FIELD_ALIASES)) {
    if (targetField === normalizedTag || targetField === cleanNoUnderscore) {
      return { resolvedField: targetField, matched: true, normalizedTag };
    }
    for (const alias of aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (cleanAlias === normalizedTag || alias === cleanNoUnderscore || alias === trimmed.toLowerCase()) {
        return { resolvedField: targetField, matched: true, normalizedTag };
      }
    }
  }

  // 2. Fallback heuristic rule-based mapping
  if (normalizedTag.includes('10th') || normalizedTag.includes('ssc') || normalizedTag.includes('tenth')) {
    if (normalizedTag.includes('percent') || normalizedTag.includes('marks') || normalizedTag.includes('score')) return { resolvedField: 'tenth_percentage', matched: true, normalizedTag };
    if (normalizedTag.includes('school') || normalizedTag.includes('college') || normalizedTag.includes('inst')) return { resolvedField: 'tenth_school_name', matched: true, normalizedTag };
    if (normalizedTag.includes('board')) return { resolvedField: 'tenth_board', matched: true, normalizedTag };
    if (normalizedTag.includes('year') || normalizedTag.includes('pass')) return { resolvedField: 'tenth_passing_year', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('12th') || normalizedTag.includes('hsc') || normalizedTag.includes('twelfth')) {
    if (normalizedTag.includes('percent') || normalizedTag.includes('marks') || normalizedTag.includes('score')) return { resolvedField: 'twelfth_percentage', matched: true, normalizedTag };
    if (normalizedTag.includes('school') || normalizedTag.includes('college') || normalizedTag.includes('inst')) return { resolvedField: 'twelfth_school_name', matched: true, normalizedTag };
    if (normalizedTag.includes('board')) return { resolvedField: 'twelfth_board', matched: true, normalizedTag };
    if (normalizedTag.includes('year') || normalizedTag.includes('pass')) return { resolvedField: 'twelfth_passing_year', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('jee')) {
    if (normalizedTag.includes('rank') || normalizedTag.includes('air')) return { resolvedField: 'jee_main_rank', matched: true, normalizedTag };
    return { resolvedField: 'jee_main_percentile', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('cet')) {
    if (normalizedTag.includes('rank') || normalizedTag.includes('state')) return { resolvedField: 'mht_cet_rank', matched: true, normalizedTag };
    return { resolvedField: 'mht_cet_percentile', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('father') || normalizedTag.includes('parent') || normalizedTag.includes('guardian')) {
    if (normalizedTag.includes('mobile') || normalizedTag.includes('phone') || normalizedTag.includes('contact') || normalizedTag.includes('no')) return { resolvedField: 'guardian_mobile', matched: true, normalizedTag };
    return { resolvedField: 'guardian_name', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('name') && !normalizedTag.includes('school') && !normalizedTag.includes('board')) {
    return { resolvedField: 'full_name', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('mail')) {
    return { resolvedField: 'email', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('mobile') || normalizedTag.includes('phone') || normalizedTag.includes('contact')) {
    return { resolvedField: 'mobile', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('dob') || normalizedTag.includes('birth')) {
    return { resolvedField: 'date_of_birth', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('prn') || (normalizedTag.includes('student') && normalizedTag.includes('id'))) {
    return { resolvedField: 'student_id', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('emp') || (normalizedTag.includes('faculty') && normalizedTag.includes('id'))) {
    return { resolvedField: 'employee_id', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('gpa') || normalizedTag.includes('cgpa')) {
    return { resolvedField: 'previous_gpa', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('backlog') || normalizedTag.includes('kt')) {
    return { resolvedField: 'previous_backlogs', matched: true, normalizedTag };
  }

  if (normalizedTag.includes('income')) {
    return { resolvedField: 'family_income', matched: true, normalizedTag };
  }

  return { resolvedField: normalizedTag, matched: false, normalizedTag };
}

// Validation Schema for an imported row with resilient defaults
const StudentRowSchema = z.object({
  role: z.enum(['admin', 'faculty', 'student']).optional().default('student'),
  employee_id: z.string().optional().default(''),
  designation: z.string().optional().default(''),
  specialization: z.string().optional().default(''),
  student_id: z.string().optional().default(''),
  full_name: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  mobile: z.string().optional().default(''),
  date_of_birth: z
    .any()
    .transform((val) => {
      if (!val) return '';
      if (val instanceof Date) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return String(val).trim();
    })
    .optional()
    .default(''),
  gender: z.string().optional().default(''),
  course_code: z.string().optional().default(''),
  department_code: z.string().optional().default(''),
  academic_year: z.coerce.number().optional().default(1),
  admission_year: z.coerce.number().optional().default(2024),
  tenth_school_name: z.string().optional().default(''),
  tenth_board: z.string().optional().default(''),
  tenth_passing_year: z.coerce.number().optional().default(0),
  tenth_percentage: z.coerce.number().min(0, '10th percentage must be between 0 and 100').max(100, '10th percentage must be between 0 and 100').optional().default(0),
  twelfth_school_name: z.string().optional().default(''),
  twelfth_board: z.string().optional().default(''),
  twelfth_passing_year: z.coerce.number().optional().default(0),
  physics_marks: z.coerce.number().optional().default(0),
  chemistry_marks: z.coerce.number().optional().default(0),
  maths_marks: z.coerce.number().optional().default(0),
  twelfth_percentage: z.coerce.number().min(0, '12th percentage must be between 0 and 100').max(100, '12th percentage must be between 0 and 100').optional().default(0),
  jee_main_percentile: z.coerce.number().optional().default(0),
  jee_main_rank: z.coerce.number().optional().default(0),
  mht_cet_percentile: z.coerce.number().optional().default(0),
  mht_cet_rank: z.coerce.number().optional().default(0),
  category_rank: z.coerce.number().optional().default(0),
  cap_round_allotment: z.string().optional().default(''),
  previous_gpa: z.coerce.number().min(0, 'GPA must be between 0 and 10').max(10, 'GPA must be between 0 and 10').optional().default(0),
  previous_backlogs: z.coerce.number().optional().default(0),
  family_income: z.coerce.number().optional().default(0),
  financial_assistance: z.string().optional().default('not_required'),
  guardian_name: z.string().optional().default(''),
  guardian_mobile: z.string().optional().default(''),
});

export class ImportService {
  /**
   * Reads header tags first, matches column headers to schema fields, and transforms row data
   */
  parseFileWithTags(buffer: Buffer): ParseFileResult {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, cellNF: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('The uploaded file contains no sheets.');
    }
    const worksheet = workbook.Sheets[firstSheetName];

    // Extract raw 2D array of grid cells to locate header tag row
    const rawMatrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '' });
    if (rawMatrix.length === 0) {
      return { rows: [], tagMappings: [], headerRowIndex: 0 };
    }

    // Find header tag row (scan first 10 rows for recognizable field tags)
    let headerRowIndex = 0;
    for (let r = 0; r < Math.min(rawMatrix.length, 10); r++) {
      const rowCells = rawMatrix[r] || [];
      const matchCount = rowCells.filter((cell) => {
        const str = String(cell || '').trim();
        if (!str) return false;
        const res = resolveHeaderTag(str);
        return res.matched;
      }).length;

      if (matchCount >= 1) {
        headerRowIndex = r;
        break;
      }
    }

    const headerCells = (rawMatrix[headerRowIndex] || []).map((cell) => String(cell || '').trim());

    // Build tag mappings array
    const tagMappings: HeaderTagMapping[] = headerCells
      .filter((tag) => tag.length > 0)
      .map((rawTag) => {
        const resolved = resolveHeaderTag(rawTag);
        return {
          rawTag,
          normalizedTag: resolved.normalizedTag,
          resolvedField: resolved.resolvedField,
          matched: resolved.matched,
        };
      });

    // Parse sheet to json using header row
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      range: headerRowIndex,
      defval: '',
    });

    // Map each data row using tag mappings
    const mappedRows = rawRows.map((row) => {
      const normalized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        const rawKey = key.trim();
        const mapping = tagMappings.find((m) => m.rawTag.toLowerCase() === rawKey.toLowerCase());
        const fieldKey = mapping?.resolvedField || resolveHeaderTag(rawKey).resolvedField || rawKey;

        normalized[fieldKey] = typeof value === 'string' ? value.trim() : value;
      }
      return normalized;
    });

    return {
      rows: mappedRows,
      tagMappings,
      headerRowIndex,
    };
  }

  /**
   * Parse uploaded Excel (.xlsx, .xls) or CSV buffer into raw row objects
   */
  parseFile(buffer: Buffer): Record<string, unknown>[] {
    return this.parseFileWithTags(buffer).rows;
  }


  /**
   * Validate rows against rules, check column presence, and detect duplicates
   */
  validateRows(rows: Record<string, unknown>[], existingStudentIds: Set<string> = new Set()): ImportValidationResult {
    const valid: StudentImportRow[] = [];
    const errors: ImportError[] = [];
    const duplicates: ImportDuplicate[] = [];
    const seenIdsInFile = new Map<string, number>();

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +1 for 1-based index, +1 for header row

      // Resolve effective identifier (student_id or employee_id)
      let rawId = String(row['student_id'] || row['employee_id'] || '').trim().toUpperCase();
      if (!rawId) {
        rawId = `IMP_${Date.now()}_${index + 1}`;
        row['student_id'] = rawId;
      }

      if (rawId) {
        if (seenIdsInFile.has(rawId)) {
          duplicates.push({
            row: rowNumber,
            student_id: rawId,
          });
          errors.push({
            row: rowNumber,
            field: 'student_id',
            message: `Duplicate ID '${rawId}' (first seen on row ${seenIdsInFile.get(rawId)})`,
          });
        } else if (existingStudentIds.has(rawId)) {
          duplicates.push({
            row: rowNumber,
            student_id: rawId,
          });
          errors.push({
            row: rowNumber,
            field: 'student_id',
            message: `ID '${rawId}' already exists in institutional records`,
          });
        } else {
          seenIdsInFile.set(rawId, rowNumber);
        }
      }

      // 2. Validate row schema with Zod
      const parseResult = StudentRowSchema.safeParse(row);

      if (!parseResult.success) {
        parseResult.error.errors.forEach((err) => {
          errors.push({
            row: rowNumber,
            field: String(err.path[0] || 'unknown'),
            message: err.message,
          });
        });
      } else {
        const parsedData = parseResult.data as StudentImportRow;
        if (!parsedData.student_id) {
          parsedData.student_id = rawId;
        }

        // If no duplicates on this row, add to valid collection
        if (!duplicates.some((d) => d.row === rowNumber)) {
          valid.push(parsedData);
        }
      }
    });

    return { valid, errors, duplicates };
  }

  /**
   * Generate downloadable standard Excel template for user batch imports
   */
  generateSampleTemplateBuffer(): Buffer {
    const sampleHeaders = [
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
      'family_income',
      'financial_assistance',
      'guardian_name',
      'guardian_mobile'
    ];

    const sampleStudentRow = [
      'student',
      '',
      '',
      '',
      'STU1080',
      'Kavya Narang',
      'kavya.narang@student.prismedu.com',
      '+91 9876501234',
      '2004-03-15',
      'female',
      'BTECH-CSE',
      'CSE',
      2,
      2023,
      'St. Xavier School',
      'CBSE',
      2020,
      88.5,
      'DPS Junior College',
      'CBSE',
      2022,
      92,
      88,
      95,
      86.0,
      94.5,
      12450,
      96.2,
      4500,
      1200,
      'CAP Round 1 - Computer Engineering',
      450000,
      'not_required',
      'Suresh Narang',
      '+91 9876509999'
    ];

    const sampleFacultyRow = [
      'faculty',
      'EMP205',
      'Associate Professor',
      'Data Science & AI',
      '',
      'Dr. Rajesh Verma',
      'rajesh.verma@prismedu.com',
      '+91 9876543210',
      '1982-05-03',
      'male',
      '',
      'CSE',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ];

    const ws = XLSX.utils.aoa_to_sheet([sampleHeaders, sampleStudentRow, sampleFacultyRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'User_Import_Template');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

