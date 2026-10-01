import type { FeatureSnapshot, RiskFactor, ResourceRecommendation } from '@/lib/types';

export class ResourceRecommendationService {
  /**
   * Recommends catalog resources tailored to a student's specific risk factors and features
   */
  async getRecommendationsForStudent(
    studentId: string,
    snapshot: FeatureSnapshot,
    riskFactors: RiskFactor[]
  ): Promise<ResourceRecommendation[]> {
    const recommendations: ResourceRecommendation[] = [];

    // 1. Attendance & Mentorship Recommendations
    if (snapshot.attendancePercentage < 75) {
      recommendations.push({
        resourceId: 's1',
        title: 'Dr. Aruna Sharma, Ph.D. - Student Wellness & Counseling',
        category: 'support',
        matchedRiskFactor: 'Attendance Decline',
        reason: `Attendance is at ${snapshot.attendancePercentage.toFixed(1)}%. Recommended for attendance counseling and stress management.`,
        priority: 'urgent',
        url: '/faculty/resources',
      });
      recommendations.push({
        resourceId: 's2',
        title: 'Academic Mentoring & Attendance Guidance Program',
        category: 'support',
        matchedRiskFactor: 'Attendance Decline',
        reason: '1-on-1 faculty mentorship for attendance improvement and catch-up plans.',
        priority: 'high',
        url: '/faculty/resources',
      });
    }

    // 2. Academic & Backlog Recommendations
    if (snapshot.backlogCount > 0 || snapshot.currentGpa < 6.5) {
      recommendations.push({
        resourceId: 'l1',
        title: 'DBMS Normalization Complete Notes (1NF to BCNF)',
        category: 'learning',
        matchedRiskFactor: 'GPA Decline / Backlogs',
        reason: 'Remedial study material for core subject improvement.',
        priority: 'high',
        url: '/faculty/resources',
      });
      recommendations.push({
        resourceId: 'l3',
        title: 'Dijkstra & Graph Shortest Path Question Bank',
        category: 'learning',
        matchedRiskFactor: 'Academic Concerns',
        reason: 'Practice problem set with step-by-step solutions for exam prep.',
        priority: 'medium',
        url: '/faculty/resources',
      });
    }

    // 3. Financial Need Recommendations
    if (snapshot.financialStatus === 'required' || snapshot.financialStatus === 'partial') {
      recommendations.push({
        resourceId: 'f1',
        title: 'Merit-cum-Means Post-Matric Scholarship',
        category: 'financial',
        matchedRiskFactor: 'Financial Indicators',
        reason: 'Government scholarship with up to ₹70,000/yr tuition fee waiver.',
        priority: 'urgent',
        url: '/faculty/resources',
      });
      recommendations.push({
        resourceId: 'f2',
        title: 'Vidya Lakshmi Subsidized Education Loan Scheme',
        category: 'financial',
        matchedRiskFactor: 'Financial Support Need',
        reason: 'Subsidized loan assistance scheme for eligible students.',
        priority: 'medium',
        url: '/faculty/resources',
      });
    }

    // 4. Career Motivation Recommendations
    if (snapshot.engagementScore < 50 || snapshot.currentGpa >= 6.0) {
      recommendations.push({
        resourceId: 'c1',
        title: 'Full Stack Software Engineering Internship (ThoughtWorks)',
        category: 'career',
        matchedRiskFactor: 'Career Engagement',
        reason: 'Career opportunity to boost academic motivation and practical skills.',
        priority: 'medium',
        url: '/faculty/resources',
      });
    }

    return recommendations;
  }
}

export const resourceRecommendationService = new ResourceRecommendationService();
