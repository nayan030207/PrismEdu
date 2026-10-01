'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const studentIdParam = params.id;

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Form State
  const [studentId, setStudentId] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('female');

  const [course, setCourse] = React.useState('B.Tech in Computer Science');
  const [department, setDepartment] = React.useState('Computer Science and Engineering');
  const [academicYear, setAcademicYear] = React.useState(1);
  const [attendancePct, setAttendancePct] = React.useState('85');

  const [tenthPct, setTenthPct] = React.useState('');
  const [twelfthPct, setTwelfthPct] = React.useState('');
  const [previousGpa, setPreviousGpa] = React.useState('');
  const [previousBacklogs, setPreviousBacklogs] = React.useState('0');

  const [familyIncome, setFamilyIncome] = React.useState('');
  const [finAssist, setFinAssist] = React.useState('not_required');
  const [guardianName, setGuardianName] = React.useState('');
  const [guardianRelationship, setGuardianRelationship] = React.useState('Father');
  const [guardianMobile, setGuardianMobile] = React.useState('');

  // Income rule calculation
  const getIncomeStatusText = (incomeVal: string) => {
    const inc = parseFloat(incomeVal);
    if (isNaN(inc)) return 'Enter annual family income to calculate assistance tier.';
    if (inc < 50000) return 'Income < ₹50,000/yr: High Financial Need (Assistance Required)';
    if (inc >= 50000 && inc <= 90000) return 'Income ₹50,000 – ₹90,000/yr: Moderately Stable (Partial Assistance / Under Review)';
    return 'Income > ₹90,000/yr: Financially Stable (No Financial Assistance Required)';
  };

  React.useEffect(() => {
    fetch(`/api/students/${studentIdParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.student) {
          const s = data.student;
          setStudentId(s.student_id || '');
          setFullName(s.full_name || '');
          setEmail(s.email || '');
          setMobile(s.mobile || '');
          setDob(s.date_of_birth || '');
          setGender(s.gender || 'female');
          setCourse(s.course || 'B.Tech in Computer Science');
          setDepartment(s.department || 'Computer Science and Engineering');
          setAcademicYear(s.academic_year || 1);
          setAttendancePct(s.attendance_percentage ? String(s.attendance_percentage) : '85');
          setTenthPct(s.tenth_percentage ? String(s.tenth_percentage) : '');
          setTwelfthPct(s.twelfth_percentage ? String(s.twelfth_percentage) : '');
          setPreviousGpa(s.previous_gpa ? String(s.previous_gpa) : '');
          setPreviousBacklogs(s.previous_backlogs ? String(s.previous_backlogs) : '0');
          setFamilyIncome(s.family_income ? String(s.family_income) : '');
          setFinAssist(s.financial_assistance || 'not_required');
          setGuardianName(s.guardian_name || '');
          setGuardianRelationship(s.guardian_relationship || 'Father');
          setGuardianMobile(s.guardian_mobile || '');
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [studentIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/students/${studentIdParam}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          mobile,
          date_of_birth: dob,
          gender,
          course,
          department,
          academic_year: Number(academicYear),
          attendance_percentage: attendancePct ? parseFloat(attendancePct) : undefined,
          tenth_percentage: tenthPct ? parseFloat(tenthPct) : undefined,
          twelfth_percentage: twelfthPct ? parseFloat(twelfthPct) : undefined,
          previous_gpa: previousGpa ? parseFloat(previousGpa) : undefined,
          previous_backlogs: parseInt(previousBacklogs || '0'),
          family_income: familyIncome ? parseFloat(familyIncome) : undefined,
          guardian_name: guardianName,
          guardian_relationship: guardianRelationship,
          guardian_mobile: guardianMobile,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student profile');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading student profile details...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Student Profile & Academic Indicators
          </h2>
          <p className="text-sm text-slate-500">
            Modify student record, academic performance history, attendance %, and financial assistance rules.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Student profile updated successfully! Real-time predictive metrics recalculated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Identification */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base">1. Personal & Identity Information</CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student ID (Permanent)"
              value={studentId}
              disabled
              className="bg-slate-100 font-mono"
            />
            <Input
              label="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Institutional Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Section 2: Expanded Branches & Course */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base">2. Department & Branch Enrollment</CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Engineering Branch / Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              options={[
                { value: 'B.Tech in Computer Science', label: 'B.Tech in Computer Science (CSE)' },
                { value: 'B.Tech in Information Technology', label: 'B.Tech in Information Technology (IT)' },
                { value: 'B.Tech in Civil Engineering', label: 'B.Tech in Civil Engineering (CIVIL)' },
                { value: 'B.Tech in Mechanical Engineering', label: 'B.Tech in Mechanical Engineering (MECH)' },
                { value: 'B.Tech in Electrical Engineering', label: 'B.Tech in Electrical Engineering (EE)' },
                { value: 'B.Tech in Electronics & Telecommunication', label: 'B.Tech in Electronics & Telecommunication (ENTC)' },
                { value: 'B.Tech in AI & Data Science', label: 'B.Tech in AI & Data Science (AI-DS)' },
              ]}
            />
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering' },
                { value: 'Information Technology', label: 'Information Technology' },
                { value: 'Civil Engineering', label: 'Civil Engineering' },
                { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
                { value: 'Electrical Engineering', label: 'Electrical Engineering' },
                { value: 'Electronics & Telecommunication', label: 'Electronics & Telecommunication' },
                { value: 'Artificial Intelligence & Data Science', label: 'Artificial Intelligence & Data Science' },
              ]}
            />
            <Input
              label="Academic Year (1 - 4)"
              type="number"
              min={1}
              max={4}
              value={academicYear}
              onChange={(e) => setAcademicYear(parseInt(e.target.value))}
            />
            <Input
              label="Current Attendance Percentage (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={attendancePct}
              onChange={(e) => setAttendancePct(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Section 3: Academic History & GPA */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base">3. Academic Performance Records</CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="10th Percentage (%)"
              type="number"
              step="0.1"
              value={tenthPct}
              onChange={(e) => setTenthPct(e.target.value)}
            />
            <Input
              label="12th Percentage (%)"
              type="number"
              step="0.1"
              value={twelfthPct}
              onChange={(e) => setTwelfthPct(e.target.value)}
            />
            <Input
              label="Cumulative GPA (0 - 10)"
              type="number"
              step="0.01"
              value={previousGpa}
              onChange={(e) => setPreviousGpa(e.target.value)}
            />
            <Input
              label="Active Backlogs Count"
              type="number"
              min="0"
              value={previousBacklogs}
              onChange={(e) => setPreviousBacklogs(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Section 4: Income Rule & Financial Assistance */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base">4. Financial & Guardian Details</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Annual Family Income (₹/year) *"
                  type="number"
                  value={familyIncome}
                  onChange={(e) => setFamilyIncome(e.target.value)}
                  placeholder="e.g. 45000"
                  required
                />
                <p className="text-[11px] text-indigo-600 font-medium mt-1">
                  {getIncomeStatusText(familyIncome)}
                </p>
              </div>

              <Input
                label="Parent / Guardian Name"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
              <Input
                label="Guardian Contact Number"
                value={guardianMobile}
                onChange={(e) => setGuardianMobile(e.target.value)}
              />
              <Input
                label="Guardian Relationship"
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="gap-1.5">
            <Save className="h-4 w-4" />
            <span>Save Student Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
