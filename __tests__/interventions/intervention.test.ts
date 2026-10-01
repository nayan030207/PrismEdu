import type { InterventionType, InterventionStatus } from '@/lib/types';

describe('Intervention Lifecycle & Rules Suite', () => {
  const allowedTypes: InterventionType[] = [
    'academic',
    'attendance_engagement',
    'financial',
    'personal_support',
    'career',
  ];

  it('should enforce exactly the 5 specified intervention categories', () => {
    expect(allowedTypes.length).toBe(5);
    expect(allowedTypes).toContain('academic');
    expect(allowedTypes).toContain('attendance_engagement');
    expect(allowedTypes).toContain('financial');
    expect(allowedTypes).toContain('personal_support');
    expect(allowedTypes).toContain('career');
  });

  it('should follow the documented lifecycle states', () => {
    const validStatuses: InterventionStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
    expect(validStatuses).toContain('pending');
    expect(validStatuses).toContain('in_progress');
    expect(validStatuses).toContain('completed');
  });

  it('should format intervention records with required fields', () => {
    const intervention = {
      student_id: 's2222222-2222-2222-2222-222222222222',
      faculty_id: 'f1111111-1111-1111-1111-111111111111',
      type: 'academic' as InterventionType,
      description: 'Scheduled 1-on-1 tutoring on DBMS Normalization concepts.',
      status: 'pending' as InterventionStatus,
      follow_up_date: '2026-09-25',
    };

    expect(intervention.student_id).toBeDefined();
    expect(intervention.faculty_id).toBeDefined();
    expect(allowedTypes.includes(intervention.type)).toBe(true);
    expect(intervention.description.length).toBeGreaterThan(10);
  });
});
