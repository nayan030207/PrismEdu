/**
 * In-memory interventions store for demo mode & dynamic calculation engine.
 * In production, this maps to the `interventions` Supabase table.
 */

export interface DemoIntervention {
  id: string;
  studentId: string;
  studentName: string;
  facultyId?: string;
  facultyName?: string;
  type: 'academic' | 'attendance_engagement' | 'financial' | 'personal_support' | 'career';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'escalated' | 'cancelled';
  riskBefore?: number;
  riskAfter?: number;
  outcome?: 'improved' | 'no_change' | 'increased_risk' | 'unable_to_assess' | string;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const INITIAL_INTERVENTIONS: DemoIntervention[] = [];

declare global {
  // eslint-disable-next-line no-var
  var __PRISM_INTERVENTIONS_DB: DemoIntervention[] | undefined;
}

if (!globalThis.__PRISM_INTERVENTIONS_DB) {
  globalThis.__PRISM_INTERVENTIONS_DB = [];
}

export function clearDemoInterventions(): void {
  globalThis.__PRISM_INTERVENTIONS_DB = [];
}

export function getDemoInterventions(): DemoIntervention[] {
  if (!globalThis.__PRISM_INTERVENTIONS_DB) {
    globalThis.__PRISM_INTERVENTIONS_DB = [];
  }
  return globalThis.__PRISM_INTERVENTIONS_DB;
}

export function addDemoIntervention(
  intervention: Omit<DemoIntervention, 'id' | 'createdAt' | 'updatedAt'>
): DemoIntervention {
  const now = new Date().toISOString();
  const newIntervention: DemoIntervention = {
    ...intervention,
    id: `int-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
  };
  getDemoInterventions().unshift(newIntervention);
  return newIntervention;
}

export function updateDemoIntervention(
  id: string,
  updates: Partial<DemoIntervention>
): DemoIntervention | null {
  const interventions = getDemoInterventions();
  const index = interventions.findIndex((i) => i.id === id);
  if (index === -1) return null;

  interventions[index] = {
    ...interventions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return interventions[index];
}
