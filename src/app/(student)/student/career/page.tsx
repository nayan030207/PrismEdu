'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Award, GraduationCap, Sparkles, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';

export default function StudentCareerPage() {
  const [data, setData] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'jobs' | 'internships' | 'certifications' | 'skills'>('jobs');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/student/career')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading career opportunities...</div>;
  }

  const jobs = data?.jobs || [];
  const internships = data?.internships || [];
  const certifications = data?.certifications || [];
  const skillRecommendations = data?.skillRecommendations || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Career Opportunities</h2>
        <p className="text-sm text-slate-500">
          Curated full-time engineering roles, technical internships, subsidized certifications, and skill pathways.
        </p>
      </div>

      {/* Navigation Sub-Tabs (Section 14: Jobs, Internships, Certifications, Skill Recommendations) */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
            activeTab === 'jobs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Full-Time Jobs ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('internships')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
            activeTab === 'internships'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Internships ({internships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certifications')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
            activeTab === 'certifications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Certifications ({certifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
            activeTab === 'skills'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Recommended Skills ({skillRecommendations.length})</span>
        </button>
      </div>

      {/* Tab 1: Jobs */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job: any) => (
            <Card key={job.id} className="border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{job.title}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{job.organization}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>
                <div>
                  <span className="text-slate-400 text-[11px] block mb-1.5 font-medium">Required Competencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.map((skill: string, idx: number) => (
                      <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Deadline: {job.deadline}
                  </span>
                  <a href={job.application_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="text-xs gap-1.5">
                      <span>Apply Now</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Internships */}
      {activeTab === 'internships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internships.map((int: any) => (
            <Card key={int.id} className="border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    Paid Internship
                  </span>
                  <h3 className="font-bold text-base text-slate-900 leading-snug mt-1.5">{int.title}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{int.organization}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{int.description}</p>
                <div>
                  <span className="text-slate-400 text-[11px] block mb-1.5 font-medium">Skills Evaluated:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {int.required_skills.map((skill: string, idx: number) => (
                      <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Deadline: {int.deadline}
                  </span>
                  <a href={int.application_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="text-xs gap-1.5">
                      <span>Apply for Internship</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Certifications */}
      {activeTab === 'certifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert: any) => (
            <Card key={cert.id} className="border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{cert.title}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">Offered by {cert.provider}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{cert.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cert.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Institutional track link</span>
                  <a href={cert.application_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                      <span>Enroll / Exam Info</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Skill Recommendations */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-900 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
            <span>
              Skill recommendations are synthesized automatically based on your degree course (B.Tech CSE), current term syllabus, and platform doubt activity.
            </span>
          </div>
          {skillRecommendations.map((rec: any) => (
            <Card key={rec.id} className="border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{rec.skill}</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      High Impact
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{rec.reason}</p>
                  <p className="text-xs text-indigo-700 font-medium">Recommended Resource: {rec.resource}</p>
                </div>
                <a href={rec.link}>
                  <Button size="sm" variant="outline" className="shrink-0 text-xs">
                    Start Learning
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
