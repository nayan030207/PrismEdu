'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Plus, GraduationCap, UserCheck, UserX, Mail, Phone, BookOpen, Trash2 } from 'lucide-react';

export default function AdminFacultyPage() {
  const [facultyList, setFacultyList] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Form state
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [employeeId, setEmployeeId] = React.useState('');
  const [designation, setDesignation] = React.useState('Assistant Professor');
  const [specialization, setSpecialization] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [newCreatedAlert, setNewCreatedAlert] = React.useState<{ name: string; email: string; pass: string } | null>(null);

  const fetchFaculty = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/faculty');
      const data = await res.json();
      if (data.faculty) setFacultyList(data.faculty);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFaculty();
  }, []);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          employee_id: employeeId,
          designation,
          specialization,
          mobile,
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
        setFullName('');
        setEmail('');
        setEmployeeId('');
        setSpecialization('');
        setMobile('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = (id: string) => {
    setFacultyList((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' } : f
      )
    );
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
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" />
          <span>Add Faculty Member</span>
        </Button>
      </div>

      {newCreatedAlert && (
        <Card className="border-emerald-200 bg-emerald-50/50 p-4 relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-xs">
              ✓
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900">Faculty Registered: {newCreatedAlert.name}</span> ({newCreatedAlert.email})
              <div className="font-mono text-emerald-800 font-semibold mt-0.5">
                Default Login Password: <span className="bg-white px-2 py-0.5 border border-emerald-300 rounded">{newCreatedAlert.pass}</span> (or <span className="bg-white px-2 py-0.5 border border-emerald-300 rounded">faculty123</span>)
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setNewCreatedAlert(null)} className="h-7 text-xs text-slate-500">
            Dismiss
          </Button>
        </Card>
      )}

      {/* Faculty Table */}
      <Card className="border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Faculty Name & Email</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department / Specialization</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  Loading faculty directory...
                </TableCell>
              </TableRow>
            ) : facultyList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  No faculty accounts registered yet.
                </TableCell>
              </TableRow>
            ) : (
              facultyList.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                    {f.employee_id}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-sm">{f.full_name}</div>
                    <div className="text-xs text-slate-400">{f.email}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-medium">
                    {f.designation}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-800 font-medium">
                      {f.department || 'Computer Science & Engineering'}
                    </div>
                    <div className="text-[11px] text-slate-400">{f.specialization}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {f.mobile || '+91 9876543210'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        f.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {f.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleStatus(f.id)}
                      className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                      title={f.status === 'active' ? "Remove Faculty" : "Restore Faculty"}
                    >
                      {f.status === 'active' ? (
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </Button>
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
        onClose={() => setIsCreateOpen(false)}
        title="Register Faculty Member"
        description="Provision a faculty user account with mentor permissions and institutional access."
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          <Input
            label="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. Rajesh Ramanathan"
            required
          />

          <Input
            label="Institutional Email *"
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

          <Select
            label="Academic Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            options={[
              { value: 'Professor', label: 'Professor' },
              { value: 'Associate Professor', label: 'Associate Professor' },
              { value: 'Assistant Professor', label: 'Assistant Professor' },
              { value: 'Head of Department', label: 'Head of Department' },
            ]}
          />

          <Input
            label="Specialization / Primary Research Area"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Distributed Systems & Cloud Computing"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Faculty Account
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
