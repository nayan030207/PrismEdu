'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, UserPlus, CheckCircle2, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AddStudentPage() {
  const router = useRouter();

  const [studentId, setStudentId] = React.useState(`STU${Math.floor(1000 + Math.random() * 9000)}`);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [dob, setDob] = React.useState('2004-05-15');
  const [gender, setGender] = React.useState('female');

  const [course, setCourse] = React.useState('B.Tech in Computer Science');
  const [department, setDepartment] = React.useState('Computer Science and Engineering');
  const [academicYear, setAcademicYear] = React.useState(1);
  const [admissionYear, setAdmissionYear] = React.useState(2024);

  const [tenthPct, setTenthPct] = React.useState('');
  const [twelfthPct, setTwelfthPct] = React.useState('');
  const [previousGpa, setPreviousGpa] = React.useState('');
  const [previousBacklogs, setPreviousBacklogs] = React.useState('0');

  const [familyIncome, setFamilyIncome] = React.useState('');
  const [finAssist, setFinAssist] = React.useState<'required' | 'not_required' | 'partial'>('not_required');

  const [guardianName, setGuardianName] = React.useState('');
  const [guardianRelationship, setGuardianRelationship] = React.useState('Father');
  const [guardianMobile, setGuardianMobile] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdResult, setCreatedResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Income Rule Logic Helper
  const getIncomeRuleHelp = (incomeVal: string) => {
    const inc = parseFloat(incomeVal);
    if (isNaN(inc)) return 'Income rule: <₹50k (High Need), ₹50k–₹90k (Moderate), >₹90k (Stable)';
    if (inc < 50000) return 'Income < ₹50,000/yr: High Need (Assistance Required)';
    if (inc >= 50000 && inc <= 90000) return 'Income ₹50,000 – ₹90,000/yr: Moderately Stable (Partial Assistance)';
    return 'Income > ₹90,000/yr: Financially Stable (Not Required)';
  };

  const handleIncomeChange = (val: string) => {
    setFamilyIncome(val);
    const inc = parseFloat(val);
    if (!isNaN(inc)) {
      if (inc < 50000) {
        setFinAssist('required');
      } else if (inc >= 50000 && inc <= 90000) {
        setFinAssist('partial');
      } else {
        setFinAssist('not_required');
      }
    }
  };

  const handleDownloadExcel = () => {
    if (!createdResult?.student) return;
    const s = createdResult.student;
    const data = [
      {
        'Student ID': s.student_id,
        'Full Name': s.full_name,
        'Email': s.email,
        'Course / Branch': course,
        'Department': department,
        'Academic Year': academicYear,
        '10th %': tenthPct || 'N/A',
        '12th %': twelfthPct || 'N/A',
        'Previous GPA': previousGpa || 'N/A',
        'Backlogs': previousBacklogs,
        'Annual Family Income (INR)': familyIncome || 'N/A',
        'Financial Need Status': finAssist === 'required' ? 'High Need (Assistance Required)' : finAssist === 'partial' ? 'Moderately Stable (Partial)' : 'Financially Stable',
        'Guardian Name': guardianName || 'N/A',
        'Default Password': createdResult.initialPassword,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Profile');
    XLSX.writeFile(workbook, `${s.student_id}_${s.full_name.replace(/\s+/g, '_')}_data.xlsx`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          full_name: fullName,
          email,
          mobile,
          date_of_birth: dob,
          gender,
          course,
          department,
          academic_year: Number(academicYear),
          admission_year: Number(admissionYear),
          tenth_percentage: tenthPct ? parseFloat(tenthPct) : undefined,
          twelfth_percentage: twelfthPct ? parseFloat(twelfthPct) : undefined,
          previous_gpa: previousGpa ? parseFloat(previousGpa) : undefined,
          previous_backlogs: parseInt(previousBacklogs || '0'),
          family_income: familyIncome ? parseFloat(familyIncome) : undefined,
          financial_assistance: finAssist,
          guardian_name: guardianName,
          guardian_relationship: guardianRelationship,
          guardian_mobile: guardianMobile,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register student');

      setCreatedResult({
        student: data.student,
        initialPassword: data.initialPassword || 'password123',
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manual Student Registration
          </h2>
          <p className="text-sm text-slate-500">
            Provision a student profile, assigned branch, login credentials, and initial predictive risk score.
          </p>
        </div>
      </div>

      {createdResult ? (
        <Card className="border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-bold text-slate-900">Student Account Created Successfully</h3>
              <p className="text-sm text-slate-600">
                The student profile has been registered and baseline predictive risk indicators have been generated.
              </p>
              <div className="p-3 bg-white border border-emerald-200 rounded-lg text-xs space-y-1 font-mono">
                <div>Student ID: <strong>{createdResult.student.student_id}</strong></div>
                <div>Login Email: <strong>{createdResult.student.email}</strong></div>
                <div>Default Password: <strong>{createdResult.initialPassword}</strong></div>
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <Button onClick={handleDownloadExcel} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Download className="h-4 w-4" />
                  <span>Download Student Data (Excel)</span>
                </Button>
                <Button onClick={() => router.push('/faculty/students')}>
                  View Students Cohort
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatedResult(null);
                    setFullName('');
                    setEmail('');
                    setStudentId(`STU${Math.floor(1000 + Math.random() * 9000)}`);
                  }}
                >
                  Register Another Student
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Section 1: Personal Information */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">1. Personal & Identity Information</CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student ID *"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
              <Input
                label="Full Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Patel"
                required
              />
              <Input
                label="Institutional Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@prismedu.com"
                required
              />
              <Input
                label="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9123456789"
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

          {/* Section 2: Expanded Branches (Civil, Mechanical, Electrical, ENTC, CSE, IT, AI-DS) */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">2. Branch & Department Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Engineering Branch / Course *"
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  setDepartment(e.target.value.replace('B.Tech in ', ''));
                }}
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
                label="Department *"
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
                label="Academic Year"
                type="number"
                min={1}
                max={4}
                value={academicYear}
                onChange={(e) => setAcademicYear(parseInt(e.target.value))}
              />
              <Input
                label="Admission Year"
                type="number"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(parseInt(e.target.value))}
              />
            </CardContent>
          </Card>

          {/* Section 3: Academic History */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">3. Academic Performance History</CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="10th Percentage (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={tenthPct}
                onChange={(e) => setTenthPct(e.target.value)}
                placeholder="75.5"
              />
              <Input
                label="12th Percentage (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={twelfthPct}
                onChange={(e) => setTwelfthPct(e.target.value)}
                placeholder="70.0"
              />
              <Input
                label="Previous Cumulative GPA (0 - 10)"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={previousGpa}
                onChange={(e) => setPreviousGpa(e.target.value)}
                placeholder="6.50"
              />
              <Input
                label="Active / Previous Backlogs"
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
              <CardTitle className="text-base">4. Financial & Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Annual Family Income (₹/year) *"
                  type="number"
                  value={familyIncome}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  placeholder="e.g. 45000"
                  required
                />
                <p className="text-[11px] text-indigo-600 font-medium mt-1">
                  {getIncomeRuleHelp(familyIncome)}
                </p>
              </div>

              <Select
                label="Financial Assistance Tier (Auto-calculated)"
                value={finAssist}
                onChange={(e) => setFinAssist(e.target.value as any)}
                options={[
                  { value: 'required', label: 'High Need (< ₹50k/yr - Assistance Required)' },
                  { value: 'partial', label: 'Moderately Stable (₹50k - ₹90k/yr - Partial Assistance)' },
                  { value: 'not_required', label: 'Financially Stable (> ₹90k/yr - Not Required)' },
                ]}
              />

              <Input
                label="Parent / Guardian Name"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Kamlesh Patel"
              />
              <Input
                label="Guardian Mobile Contact"
                value={guardianMobile}
                onChange={(e) => setGuardianMobile(e.target.value)}
                placeholder="+91 9811122234"
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              <span>Register Student Profile</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
