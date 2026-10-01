import { calculateAttendanceRate, getRiskLevel, getInsightColor } from '@/lib/utils';

describe('Analytics & Derived Features Suite', () => {
  describe('Attendance Rate Calculations', () => {
    it('should compute exact attendance percentages', () => {
      expect(calculateAttendanceRate(31, 45)).toBe(68.89);
      expect(calculateAttendanceRate(45, 45)).toBe(100);
      expect(calculateAttendanceRate(0, 30)).toBe(0);
    });

    it('should handle zero total classes safely without division by zero', () => {
      expect(calculateAttendanceRate(0, 0)).toBe(0);
    });
  });

  describe('Risk Level Classification', () => {
    it('should categorize probability thresholds accurately', () => {
      expect(getRiskLevel(0.12)).toBe('low');
      expect(getRiskLevel(0.44)).toBe('medium');
      expect(getRiskLevel(0.68)).toBe('high');
      expect(getRiskLevel(0.85)).toBe('high');
    });
  });

  describe('Status Indicator Design Tokens', () => {
    it('should map insight levels to appropriate semantic tokens', () => {
      expect(getInsightColor('good')).toContain('emerald');
      expect(getInsightColor('attention_required')).toContain('amber');
      expect(getInsightColor('declining')).toContain('orange');
      expect(getInsightColor('critical')).toContain('red');
    });
  });
});
