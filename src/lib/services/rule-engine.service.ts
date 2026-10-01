import type { FeatureSnapshot, RuleWarning } from '@/lib/types';

export interface RuleConfig {
  minAttendanceThreshold: number; // e.g. 75%
  maxBacklogThreshold: number; // e.g. 2
  maxGpaDropThreshold: number; // e.g. 0.8
  minEngagementDropThreshold: number; // e.g. -20%
}

const DEFAULT_CONFIG: RuleConfig = {
  minAttendanceThreshold: 75.0,
  maxBacklogThreshold: 2,
  maxGpaDropThreshold: 0.8,
  minEngagementDropThreshold: -20.0,
};

export class RuleEngineService {
  private config: RuleConfig;

  constructor(customConfig?: Partial<RuleConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  /**
   * Evaluate early warning rule conditions on a feature snapshot
   */
  evaluateRules(snapshot: FeatureSnapshot): RuleWarning[] {
    const warnings: RuleWarning[] = [];
    const now = new Date().toISOString();

    // 1. Attendance Rule
    if (snapshot.attendancePercentage < this.config.minAttendanceThreshold) {
      const isCritical = snapshot.attendancePercentage < 60;
      warnings.push({
        id: `warn-att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        studentId: snapshot.studentId,
        ruleType: 'attendance',
        severity: isCritical ? 'critical' : 'high',
        message: `Attendance level is at ${snapshot.attendancePercentage.toFixed(1)}%, which is below the required ${this.config.minAttendanceThreshold}% threshold.`,
        triggeredAt: now,
      });
    }

    // 2. Academic Backlog Rule
    if (snapshot.backlogCount >= this.config.maxBacklogThreshold) {
      warnings.push({
        id: `warn-backlog-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        studentId: snapshot.studentId,
        ruleType: 'backlog',
        severity: snapshot.backlogCount >= 3 ? 'critical' : 'high',
        message: `Student currently has ${snapshot.backlogCount} active academic backlogs (Threshold >= ${this.config.maxBacklogThreshold}).`,
        triggeredAt: now,
      });
    }

    // 3. GPA Decline Rule
    if (snapshot.gpaChange <= -this.config.maxGpaDropThreshold) {
      warnings.push({
        id: `warn-gpa-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        studentId: snapshot.studentId,
        ruleType: 'gpa',
        severity: Math.abs(snapshot.gpaChange) > 1.5 ? 'critical' : 'high',
        message: `GPA dropped by ${Math.abs(snapshot.gpaChange).toFixed(2)} points from previous semester (Current: ${snapshot.currentGpa}, Previous: ${snapshot.previousGpa}).`,
        triggeredAt: now,
      });
    }

    // 4. Engagement Decline Rule
    if (snapshot.engagementChange <= this.config.minEngagementDropThreshold) {
      warnings.push({
        id: `warn-eng-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        studentId: snapshot.studentId,
        ruleType: 'engagement',
        severity: snapshot.engagementChange <= -40 ? 'critical' : 'warning',
        message: `Platform engagement score declined by ${Math.abs(snapshot.engagementChange).toFixed(1)}% in the last 30 days.`,
        triggeredAt: now,
      });
    }

    return warnings;
  }
}

export const ruleEngineService = new RuleEngineService();
