'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Save, Send, UploadCloud } from 'lucide-react';

export default function FacultyAddResourcePage() {
  const router = useRouter();
  
  // Section 1: Basic Info
  const [category, setCategory] = React.useState('learning');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [provider, setProvider] = React.useState('');
  
  // Dynamic fields
  const [learningSubject, setLearningSubject] = React.useState('');
  const [learningTopic, setLearningTopic] = React.useState('');
  const [learningFormat, setLearningFormat] = React.useState('pdf');
  
  const [financialType, setFinancialType] = React.useState('scholarship');
  const [financialBenefit, setFinancialBenefit] = React.useState('');
  const [financialEligibility, setFinancialEligibility] = React.useState('');
  
  const [supportType, setSupportType] = React.useState('counseling');
  const [supportMode, setSupportMode] = React.useState('In-Person');
  const [supportContact, setSupportContact] = React.useState('');
  
  const [careerType, setCareerType] = React.useState('internship');
  const [careerSkills, setCareerSkills] = React.useState('');
  const [careerStipend, setCareerStipend] = React.useState('');

  // Recommendation Rules
  const [targetRisk, setTargetRisk] = React.useState('moderate_high');
  const [ruleCondition, setRuleCondition] = React.useState('');
  const [priority, setPriority] = React.useState('medium');

  // Publishing
  const [status, setStatus] = React.useState('published');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        category,
        title,
        description,
        provider,
        type: category === 'learning' ? learningFormat : category === 'financial' ? financialType : category === 'support' ? supportType : careerType,
        subject: learningSubject,
        topic: learningTopic,
        benefit: financialBenefit,
        eligibility: financialEligibility,
        support_mode: supportMode,
        contact: supportContact,
        skills: careerSkills,
        stipend: careerStipend,
        target_risk: targetRisk,
        rule_condition: ruleCondition,
        priority,
        status: isDraft ? 'draft' : status,
        start_date: startDate,
        end_date: endDate,
      };

      const res = await fetch('/api/faculty/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save resource');
      router.push('/faculty/resources');
    } catch (err: any) {
      alert(err.message || 'Error creating resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Institutional & Faculty Resource</h2>
          <p className="text-sm text-slate-500">
            Publish study materials, video lectures, scholarships, support channels, or career opportunities with target matching rules.
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        
        {/* Section 1: Basic Info */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base">1. Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Resource Category *"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'learning', label: 'Learning Resource' },
                { value: 'financial', label: 'Financial Resource' },
                { value: 'support', label: 'Support & Wellness Resource' },
                { value: 'career', label: 'Career Resource' },
              ]}
            />
            <Input
              label="Resource Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Calculus Remedial Module"
              required
            />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Description *
              </label>
              <textarea
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the resource..."
                required
              />
            </div>
            <Input
              label="Provider / Organization"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. CS Department, Dr. Sarah Mitchell"
            />
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input label="External URL (Optional)" placeholder="https://" />
              </div>
              <div className="flex-1">
                <Button type="button" variant="outline" className="w-full gap-2 text-xs h-[38px]">
                  <UploadCloud className="h-4 w-4 text-slate-500" />
                  Upload File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Dynamic Category Fields */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base">
              2. {category === 'learning' ? 'Learning Specific Details' : category === 'financial' ? 'Financial Aid Details' : category === 'support' ? 'Support Service Details' : 'Career Opportunity Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {category === 'learning' && (
              <>
                <Input label="Subject *" value={learningSubject} onChange={e => setLearningSubject(e.target.value)} required />
                <Input label="Topic" value={learningTopic} onChange={e => setLearningTopic(e.target.value)} />
                <Select
                  label="Resource Format"
                  value={learningFormat}
                  onChange={e => setLearningFormat(e.target.value)}
                  options={[{ value: 'pdf', label: 'PDF Document' }, { value: 'video', label: 'Video Lecture' }, { value: 'course', label: 'Online Course' }, { value: 'quiz', label: 'Practice Quiz' }]}
                />
                <Select
                  label="Difficulty Level"
                  value=""
                  onChange={() => {}}
                  options={[{ value: 'beginner', label: 'Beginner / Remedial' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]}
                />
                <Input label="Duration (e.g. 2 hours, 4 weeks)" />
                <Input label="Prerequisites" />
              </>
            )}

            {category === 'financial' && (
              <>
                <Select
                  label="Financial Resource Type *"
                  value={financialType}
                  onChange={e => setFinancialType(e.target.value)}
                  options={[{ value: 'scholarship', label: 'Scholarship' }, { value: 'loan', label: 'Education Loan' }, { value: 'fee_assist', label: 'Fee Assistance' }, { value: 'aid', label: 'Financial Aid' }]}
                />
                <Input label="Benefit / Amount (e.g. ₹50,000/yr)" value={financialBenefit} onChange={e => setFinancialBenefit(e.target.value)} required />
                <Input label="Income Requirement (Max ₹)" type="number" />
                <Input label="Academic Requirement (Min CGPA)" type="number" step="0.1" />
                <div className="sm:col-span-2">
                  <Input label="Eligibility Criteria *" value={financialEligibility} onChange={e => setFinancialEligibility(e.target.value)} required />
                </div>
                <Input label="Application Deadline" type="date" />
                <Input label="Contact Person / Email" />
              </>
            )}

            {category === 'support' && (
              <>
                <Select
                  label="Support Type *"
                  value={supportType}
                  onChange={e => setSupportType(e.target.value)}
                  options={[{ value: 'counseling', label: 'Counseling' }, { value: 'mentoring', label: 'Mentoring' }, { value: 'accessibility', label: 'Accessibility Support' }]}
                />
                <Select
                  label="Mode *"
                  value={supportMode}
                  onChange={e => setSupportMode(e.target.value)}
                  options={[{ value: 'In-Person', label: 'In-Person' }, { value: 'Online', label: 'Online' }, { value: 'Hybrid', label: 'Hybrid' }]}
                />
                <Input label="Operating Hours" placeholder="Mon-Fri, 10 AM - 4 PM" />
                <Input label="Location (Room/Link)" />
                <Select
                  label="Privacy Classification"
                  value=""
                  onChange={() => {}}
                  options={[{ value: 'standard', label: 'Standard' }, { value: 'confidential', label: 'Confidential (Hidden from normal logs)' }]}
                />
                <Select
                  label="Appointment Required"
                  value="yes"
                  onChange={() => {}}
                  options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                />
              </>
            )}

            {category === 'career' && (
              <>
                <Select
                  label="Career Resource Type *"
                  value={careerType}
                  onChange={e => setCareerType(e.target.value)}
                  options={[{ value: 'internship', label: 'Internship' }, { value: 'placement', label: 'Placement/Job' }, { value: 'certification', label: 'Certification' }, { value: 'workshop', label: 'Workshop' }]}
                />
                <Input label="Company / Provider *" required />
                <Input label="Required Skills" value={careerSkills} onChange={e => setCareerSkills(e.target.value)} placeholder="e.g. React, Node.js" />
                <Input label="Stipend / Compensation" value={careerStipend} onChange={e => setCareerStipend(e.target.value)} />
                <Input label="Minimum CGPA" type="number" step="0.1" />
                <Input label="Number of Openings" type="number" />
                <Input label="Application Deadline" type="date" />
                <Input label="Location / Mode" placeholder="e.g. Remote, Bangalore" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Dropout Prediction & Recommendations */}
        <Card className="border-indigo-100 bg-indigo-50/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <CardHeader className="pb-3 border-b border-indigo-100/50">
            <CardTitle className="text-base text-indigo-900">3. Target Audience & Recommendation Rules</CardTitle>
            <p className="text-xs text-indigo-700 mt-1">Configure automated recommendation matching for at-risk students.</p>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Target Student Risk Level"
              value={targetRisk}
              onChange={e => setTargetRisk(e.target.value)}
              options={[
                { value: 'all', label: 'All Students (No specific targeting)' },
                { value: 'low', label: 'Low Risk Only' },
                { value: 'moderate', label: 'Moderate Risk Only' },
                { value: 'high', label: 'High Risk Only' },
                { value: 'critical', label: 'Critical Risk Only' },
                { value: 'moderate_high', label: 'Moderate, High, & Critical' },
              ]}
            />
            <Select
              label="Recommendation Priority"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'critical', label: 'Critical / Urgent' },
              ]}
            />
            
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Automated Recommendation Rule Conditions
              </label>
              <div className="flex gap-2">
                <Select
                  value="AND"
                  onChange={() => {}}
                  options={[{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }]}
                />
                <Input
                  className="flex-1"
                  value={ruleCondition}
                  onChange={e => setRuleCondition(e.target.value)}
                  placeholder="e.g. Attendance < 75% OR Backlogs >= 2"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Example: IF (Risk = HIGH) AND (Attendance &lt; 75%) THEN Recommend.</p>
            </div>
            
            <Input label="Target Department(s)" placeholder="e.g. CSE, IT (Leave blank for all)" />
            <Input label="Target Semester(s)" placeholder="e.g. 1, 2, 3 (Leave blank for all)" />
          </CardContent>
        </Card>

        {/* Section 4: Publishing */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base">4. Availability & Publishing</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Select
              label="Status Workflow *"
              value={status}
              onChange={e => setStatus(e.target.value)}
              options={[
                { value: 'draft', label: 'Save as Draft' },
                { value: 'pending', label: 'Pending Review' },
                { value: 'published', label: 'Published / Active' },
              ]}
            />
            <Input
              label="Start Date (Optional)"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <Input
              label="End Date / Expiry (Optional)"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="gap-2">
            <Send className="h-4 w-4" />
            Publish Resource
          </Button>
        </div>

      </form>
    </div>
  );
}
