import { ImportService } from '@/lib/services/import.service';

describe('Student Import Validation Suite', () => {
  const service = new ImportService();

  it('should accept valid student records with numeric date_of_birth', () => {
    const rows = [
      {
        student_id: 'STU2001',
        full_name: 'Aarav Sharma',
        email: 'aarav@example.com',
        date_of_birth: 20040515, // Numeric DOB
        academic_year: 2,
        admission_year: 2023,
        tenth_percentage: 88.5,
        twelfth_percentage: 91.0,
        previous_gpa: 8.5,
        previous_backlogs: 0,
        family_income: 600000,
        financial_assistance: 'not_required',
      },
    ];

    const result = service.validateRows(rows);
    expect(result.valid.length).toBe(1);
    expect(result.errors.length).toBe(0);
    expect(result.valid[0].date_of_birth).toBe('20040515');
  });

  it('should detect invalid email address format', () => {
    const rows = [
      {
        student_id: 'STU2002',
        full_name: 'Jane Doe',
        email: 'invalid-email-address',
      },
    ];

    const result = service.validateRows(rows);
    expect(result.valid.length).toBe(0);
    expect(result.errors.some((e) => e.field === 'email')).toBe(true);
    expect(result.errors[0].row).toBe(2); // Row 2 in spreadsheet (after header)
  });

  it('should detect percentage values outside [0, 100] range', () => {
    const rows = [
      {
        student_id: 'STU2003',
        full_name: 'John Doe',
        email: 'john@example.com',
        twelfth_percentage: 105.0, // Invalid!
      },
    ];

    const result = service.validateRows(rows);
    expect(result.valid.length).toBe(0);
    expect(result.errors.some((e) => e.field === 'twelfth_percentage')).toBe(true);
  });

  it('should detect duplicate student IDs within the same file', () => {
    const rows = [
      {
        student_id: 'STU2010',
        full_name: 'Student One',
        email: 's1@example.com',
      },
      {
        student_id: 'STU2010', // Duplicate!
        full_name: 'Student Two',
        email: 's2@example.com',
      },
    ];

    const result = service.validateRows(rows);
    expect(result.duplicates.length).toBe(1);
    expect(result.duplicates[0].student_id).toBe('STU2010');
    expect(result.duplicates[0].row).toBe(3);
  });

  it('should detect student ID already existing in institutional database', () => {
    const existingIds = new Set(['STU1024', 'STU1021']);
    const rows = [
      {
        student_id: 'STU1024', // Collides with existing database record!
        full_name: 'New Priya',
        email: 'newpriya@example.com',
      },
    ];

    const result = service.validateRows(rows, existingIds);
    expect(result.duplicates.length).toBe(1);
    expect(result.duplicates[0].student_id).toBe('STU1024');
  });

  it('should generate a valid downloadable Excel sample template buffer', () => {
    const buffer = service.generateSampleTemplateBuffer();
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(100);
  });

  it('should read column header tags first and map aliases to schema fields', () => {
    const buffer = service.generateSampleTemplateBuffer();
    const parseResult = service.parseFileWithTags(buffer);

    expect(parseResult.tagMappings.length).toBeGreaterThan(0);
    expect(parseResult.rows.length).toBeGreaterThan(0);

    const studentIdMapping = parseResult.tagMappings.find((m) => m.rawTag === 'student_id');
    expect(studentIdMapping).toBeDefined();
    expect(studentIdMapping?.resolvedField).toBe('student_id');

    const fullNameMapping = parseResult.tagMappings.find((m) => m.rawTag === 'full_name');
    expect(fullNameMapping).toBeDefined();
    expect(fullNameMapping?.resolvedField).toBe('full_name');
  });
});

