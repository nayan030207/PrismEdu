'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Plus, GraduationCap, UserCheck, Trash2, Eye, EyeOff, Copy, CheckCheck, Search, Edit2, UserX } from 'lucide-react';

export default function AdminFacultyPage() {
  const [facultyList, setFacultyList] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  // Form state
  const [currentId, setCurrentId] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [employeeId, setEmployeeId] = React.useState('');
  const [department, setDepartment] = React.useState('Computer Science and Engineering');
  const [designation, setDesignation] = React.useState('Assistant Professor');
  const [specialization, setSpecialization] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [copiedPass, setCopiedPass] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [newCreatedAlert, setNewCreatedAlert] = React.useState<{
    name: string;
    email: string;
    pass: string;
  } | null>(null);

  const fetchFaculty = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/faculty?${params.toString()}`);
      const data = await res.json();
      if (data.faculty) setFacultyList(data.faculty);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  React.useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          employee_id: employeeId,
          department,
          designation,
          specialization,
          mobile,
          date_of_birth: dateOfBirth,
          password: password.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.faculty) {
        setFacultyList((prev) => [data.faculty, ...prev.filter((f) => f.id !== data.faculty.id)]);
        setNewCreatedAlert({
          name: data.faculty.full_name,
          email: data.faculty.email,
          pass: data.initialPassword || 'password123',
        });
        setIsCreateOpen(false);
        resetForm();
      } else {
        setFormError(data.error || 'Failed to create faculty');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/faculty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentId,
          department,
          designation,
          specialization,
          mobile,
        }),
      });
      const data = await res.json();
      if (res.ok && data.faculty) {
        setFacultyList((prev) =>
          prev.map((f) => (f.id === currentId ? { ...f, ...data.faculty } : f))
        );
        setIsEditOpen(false);
        resetForm();
      } else {
        setFormError(data.error || 'Failed to update faculty');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentId('');
    setFullName('');
    setEmail('');
    setEmployeeId('');
    setDepartment('Computer Science and Engineering');
    setDesignation('Assistant Professor');
    setSpecialization('');
    setMobile('');
    setDateOfBirth('');
    setPassword('');
    setShowPassword(false);
    setFormError(null);
  };

  const openEditModal = (faculty: any) => {
    setCurrentId(faculty.id);
    setFullName(faculty.full_name || '');
    setEmail(faculty.email || '');
    setEmployeeId(faculty.employee_id || '');
    setDepartment(faculty.department || 'Computer Science and Engineering');
    setDesignation(faculty.designation || 'Assistant Professor');
    setSpecialization(faculty.specialization || '');
    setMobile(faculty.mobile || '');
    setDateOfBirth(faculty.date_of_birth || '');
    setIsEditOpen(true);
  };

  const copyPassword = (pass: string) => {
    navigator.clipboard.writeText(pass).then(() => {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    });
  };

  const toggleStatus = async (faculty: any) => {
    const newStatus = faculty.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch('/api/admin/faculty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: faculty.id, status: newStatus }),
      });
      if (res.ok) {
        setFacultyList((prev) =>
          prev.map((f) => (f.id === faculty.id ? { ...f, status: newStatus } : f))
        );
      }
    } catch {
      // ignore
    }
  };

  const deleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to completely delete this faculty record? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/faculty', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setFacultyList((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Directory</h2>
          <p className="text-sm text-slate-500">
            Create and manage faculty accounts, mentorship assignments, and departmental roles.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" />
          <span>Add Faculty Member</span>
        </Button>
      </div>

      {/* Success Alert — shows credentials after creating a faculty */}
      {newCreatedAlert && (
        <Card className="border-emerald-200 bg-emerald-50/50 p-4 relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-xs mt-0.5">
                ✓
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  Faculty Account Created: {newCreatedAlert.name}
                </p>
                <p className="text-slate-500">Login ID: <span className="font-mono font-semibold text-slate-800">{newCreatedAlert.email}</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-500">Password:</span>
                  <span className="bg-white px-2 py-0.5 border border-emerald-300 rounded font-mono font-bold text-emerald-800 text-sm">
                    {newCreatedAlert.pass}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyPassword(newCreatedAlert.pass)}
                    className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                    title="Copy password"
                  >
                    {copiedPass ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-amber-700 font-medium text-[11px]">
                  ⚠ Share these credentials securely with the faculty member. They can change their password after first login.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setNewCreatedAlert(null)}
              className="h-7 text-xs text-slate-500 shrink-0 hover:bg-emerald-100/50"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="border-slate-200 p-3 bg-slate-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              placeholder="Search faculty by name, ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active Faculty' },
              { value: 'inactive', label: 'Inactive Faculty' },
            ]}
          />
        </div>
      </Card>

      {/* Faculty Table */}
      <Card className="border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs">Employee ID</TableHead>
              <TableHead className="text-xs">Faculty Name & Email</TableHead>
              <TableHead className="text-xs">Designation</TableHead>
              <TableHead className="text-xs">Department / Specialization</TableHead>
              <TableHead className="text-xs">Contact</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                  <div className="flex justify-center items-center gap-2">
                    <span className="animate-pulse">Loading faculty directory...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : facultyList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <GraduationCap className="h-10 w-10 text-slate-200 mb-2" />
                    <p className="text-sm font-medium">No faculty members found.</p>
                    {searchQuery ? (
                      <Button variant="link" size="sm" onClick={() => setSearchQuery('')}>Clear search</Button>
                    ) : (
                      <p className="text-xs mt-1">Add a new faculty member to get started.</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              facultyList.map((f) => (
                <TableRow key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                    {f.employee_id}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-sm">{f.full_name}</div>
                    <div className="text-[11px] text-slate-500">{f.email}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-medium">
                    {f.designation}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-800 font-medium max-w-[200px] truncate">
                      {f.department || 'Computer Science and Engineering'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{f.specialization || 'General'}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {f.mobile || 'Not set'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        f.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {f.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(f)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit Faculty Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(f)}
                        className={`h-7 w-7 p-0 ${
                          f.status === 'active' 
                            ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50' 
                            : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={f.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {f.status === 'active' ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteFaculty(f.id)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete Faculty"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Faculty Modal */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); resetForm(); }}
        title="Register Faculty Member"
        description="Create a faculty account. You set the Login ID (email) and initial password."
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {formError}
            </div>
          )}
          
          <Input
            label="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. Rajesh Ramanathan"
            required
          />

          <Input
            label="Institutional Email (Login ID) *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rajesh.r@prismedu.com"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="FAC-CSE-03"
            />
            <Input
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 9876543212"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department *"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'Computer Science and Engineering', label: 'Computer Science' },
                { value: 'Information Technology', label: 'Information Technology' },
                { value: 'Electronics and Communication', label: 'Electronics & Comm.' },
                { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
                { value: 'Civil Engineering', label: 'Civil Engineering' },
              ]}
            />
            <Select
              label="Academic Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              options={[
                { value: 'Professor', label: 'Professor' },
                { value: 'Associate Professor', label: 'Associate Professor' },
                { value: 'Assistant Professor', label: 'Assistant Professor' },
                { value: 'Head of Department', label: 'Head of Department' },
                { value: 'Lecturer', label: 'Lecturer' },
              ]}
            />
          </div>

          <Input
            label="Specialization / Primary Research Area"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Distributed Systems & Cloud Computing"
          />

          {/* Admin-set Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Set Initial Password{' '}
              <span className="text-slate-400 font-normal">(leave blank to auto-generate)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. Faculty@2024 (min. 6 characters)"
                minLength={password.length > 0 ? 6 : undefined}
                className="w-full pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              If blank, the system will auto-generate: <span className="font-mono font-semibold bg-slate-100 px-1 py-0.5 rounded">FirstName@DDMM</span>
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsCreateOpen(false); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              Create Faculty Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Faculty Modal */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); resetForm(); }}
        title="Edit Faculty Member"
        description="Update departmental assignments and contact information."
      >
        <form onSubmit={handleEditFaculty} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {formError}
            </div>
          )}
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-sm font-bold text-slate-900">{fullName}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">{email}</div>
            <div className="text-[11px] text-slate-400 mt-1">ID: {employeeId}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'Computer Science and Engineering', label: 'Computer Science' },
                { value: 'Information Technology', label: 'Information Technology' },
                { value: 'Electronics and Communication', label: 'Electronics & Comm.' },
                { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
                { value: 'Civil Engineering', label: 'Civil Engineering' },
              ]}
            />
            <Select
              label="Academic Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              options={[
                { value: 'Professor', label: 'Professor' },
                { value: 'Associate Professor', label: 'Associate Professor' },
                { value: 'Assistant Professor', label: 'Assistant Professor' },
                { value: 'Head of Department', label: 'Head of Department' },
                { value: 'Lecturer', label: 'Lecturer' },
              ]}
            />
          </div>

          <Input
            label="Specialization / Primary Research Area"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Distributed Systems & Cloud Computing"
          />

          <Input
            label="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+91 9876543212"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsEditOpen(false); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
