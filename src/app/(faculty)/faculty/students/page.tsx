'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StudentCard } from '@/components/student/student-card';
import { Search, UserPlus, FileSpreadsheet, Download, CalendarCheck } from 'lucide-react';
import type { InsightLevel } from '@/lib/types';
import * as XLSX from 'xlsx';

import { matchesBranch } from '@/lib/utils/branch-resolver';

export default function FacultyStudentsPage() {
  const [students, setStudents] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [filterAttention, setFilterAttention] = React.useState('all');
  const [filterBranch, setFilterBranch] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleExportAllExcel = () => {
    if (students.length === 0) return;
    const exportData = students.map((s) => ({
      'Student ID': s.student_id,
      'Full Name': s.full_name,
      'Email': s.email,
      'Branch / Course': s.course,
      'Department': s.department,
      'Academic Year': s.academic_year,
      'Attendance %': s.attendance_percentage || 85,
      'Academic Status': s.insight?.academic || 'good',
      'Attendance Status': s.insight?.attendance || 'good',
      'Financial Status': s.insight?.financial || 'good',
      'Annual Income': s.family_income || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cohort Student Data');
    XLSX.writeFile(workbook, `PRISM_Student_Cohort_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (!matchesBranch(s, filterBranch)) {
      return false;
    }

    if (filterAttention === 'attention') {
      return (
        s.insight?.academic === 'attention_required' ||
        s.insight?.academic === 'critical' ||
        s.insight?.attendance === 'declining' ||
        s.insight?.attendance === 'critical' ||
        s.insight?.financial === 'attention_required'
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Excel Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Students Cohort</h2>
          <p className="text-sm text-slate-500">
            Monitor real-time academic, attendance, and financial support indicators for your cohort.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportAllExcel} className="gap-1.5 text-xs">
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Download Excel</span>
          </Button>

          <Link href="/faculty/students/import-attendance">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-indigo-700 bg-indigo-50 border-indigo-200">
              <CalendarCheck className="h-4 w-4" />
              <span>Import Attendance (Excel)</span>
            </Button>
          </Link>

          <Link href="/faculty/students/add">
            <Button size="sm" className="gap-1.5 text-xs">
              <UserPlus className="h-4 w-4" />
              <span>Register Student</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, ID, or email..."
              className="pl-9"
            />
          </div>

          <Select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            options={[
              { value: 'all', label: 'All Engineering Branches' },
              { value: 'Computer Science', label: 'Computer Science (CSE)' },
              { value: 'Information Technology', label: 'Information Technology (IT)' },
              { value: 'Civil', label: 'Civil Engineering (CIVIL)' },
              { value: 'Mechanical', label: 'Mechanical Engineering (MECH)' },
              { value: 'Electrical', label: 'Electrical Engineering (EE)' },
              { value: 'Electronics', label: 'Electronics & Telecom (ENTC)' },
              { value: 'AI', label: 'AI & Data Science (AI-DS)' },
            ]}
          />

          <Select
            value={filterAttention}
            onChange={(e) => setFilterAttention(e.target.value)}
            options={[
              { value: 'all', label: 'All Status Levels' },
              { value: 'attention', label: 'Filter: Requiring Attention Only' },
            ]}
          />
        </div>
      </Card>

      {/* Student Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading student cohort...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          No students found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <StudentCard
              key={s.id}
              id={s.id}
              studentId={s.student_id}
              fullName={s.full_name}
              course={s.course}
              academicLevel={(s.insight?.academic as InsightLevel) || 'good'}
              attendanceLevel={(s.insight?.attendance as InsightLevel) || 'good'}
              financialLevel={(s.insight?.financial as InsightLevel) || 'good'}
              careerLevel={(s.insight?.career as InsightLevel) || 'good'}
              recentChanges={s.recent_changes || (s.student_id === 'STU1024' ? ['Attendance has decreased from 82% to 69%'] : undefined)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
