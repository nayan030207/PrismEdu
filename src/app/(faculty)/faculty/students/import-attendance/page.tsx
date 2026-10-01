'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseAttendanceRow } from '@/lib/utils/attendance-parser';

export default function ImportAttendancePage() {
  const router = useRouter();

  const [file, setFile] = React.useState<File | null>(null);
  const [parsedRows, setParsedRows] = React.useState<any[]>([]);
  const [cohortStudents, setCohortStudents] = React.useState<any[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setCohortStudents(data.students);
      })
      .catch(() => {});
  }, []);

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Student ID': 'STU1024',
        'Name': 'Rahul Sharma',
        'Email': 'rahul.sharma@prismedu.com',
        'Total Classes': 65,
        'Classes Attended': 48,
        'Attendance': '73.85%',
      },
      {
        'Student ID': 'STU2048',
        'Name': 'Neha Sharma',
        'Email': 'neha.sharma@prismedu.com',
        'Total Classes': 65,
        'Classes Attended': 57,
        'Attendance': '87.69%',
      },
      {
        'Student ID': 'STU3096',
        'Name': 'Arjun More',
        'Email': 'arjun.more@prismedu.com',
        'Total Classes': 90,
        'Classes Attended': 74,
        'Attendance': '82.22%',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Template');
    XLSX.writeFile(workbook, 'Student_Attendance_Import_Template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        const normalized = rawData.map((row: any) => parseAttendanceRow(row, cohortStudents));
        setParsedRows(normalized);
      } catch {
        setError('Failed to parse Excel file format. Please check your file headers.');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleUploadAttendance = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/students/attendance/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import attendance');

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Import Student Attendance (Excel / CSV)
          </h2>
          <p className="text-sm text-slate-500">
            Batch update monthly student attendance percentages and automatically recalculate dropout risk indicators.
          </p>
        </div>
      </div>

      {result ? (
        <Card className="border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-bold text-slate-900">Attendance Import Completed</h3>
              <p className="text-sm text-slate-600">
                Successfully processed attendance records for <strong>{result.updatedCount}</strong> students. Cohort risk indicators have been updated.
              </p>

              {result.errors && result.errors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-800">
                  <div className="font-bold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Unmatched Student Records ({result.errors.length}):</span>
                  </div>
                  {result.errors.map((errItem: any, idx: number) => (
                    <div key={idx}>• {errItem.student_id} - {errItem.error}</div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <Button onClick={() => router.push('/faculty/students')}>
                  View Updated Cohort
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setParsedRows([]);
                  }}
                >
                  Import Another File
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Template Download Card */}
          <Card className="border-indigo-100 bg-indigo-50/30 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                  <span>Flexible Excel Header Parsing</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Supports columns by <strong>Name</strong>, <strong>Email</strong>, <strong>Student ID</strong>, <strong>Total Classes</strong>, <strong>Classes Attended</strong>, and <strong>Attendance %</strong>.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-1.5 shrink-0 text-indigo-700 border-indigo-200">
                <Download className="h-4 w-4" />
                <span>Download Sample Excel (.xlsx)</span>
              </Button>
            </div>
          </Card>

          {/* Drag and Drop Upload Card */}
          <Card className="border-slate-200 p-8 text-center border-dashed">
            <input
              type="file"
              id="attendance-file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="attendance-file" className="cursor-pointer space-y-3 flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">
                  {file ? file.name : 'Click or Drag & Drop Attendance Spreadsheet Here'}
                </h5>
                <p className="text-xs text-slate-400 mt-1">
                  Supports .xlsx, .xls, or .csv format
                </p>
              </div>
            </label>
          </Card>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Attendance Records Preview ({parsedRows.length} rows)</CardTitle>
                <Button size="sm" onClick={handleUploadAttendance} isLoading={isProcessing} className="gap-1.5">
                  <Upload className="h-4 w-4" />
                  <span>Confirm & Import Attendance</span>
                </Button>
              </CardHeader>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                    <tr>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Total Classes</th>
                      <th className="p-3">Attended</th>
                      <th className="p-3">Attendance %</th>
                      <th className="p-3">Risk Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => {
                      const pct = row.attendance_percentage;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-medium text-indigo-600">
                            {row.student_id !== 'N/A' ? row.student_id : <span className="text-slate-400">N/A</span>}
                          </td>
                          <td className="p-3 font-semibold text-slate-900">{row.student_name}</td>
                          <td className="p-3 text-slate-500">{row.email}</td>
                          <td className="p-3 font-medium">{row.total_classes}</td>
                          <td className="p-3 font-medium">{row.attended_classes}</td>
                          <td className="p-3 font-bold text-slate-900">{pct}%</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pct < 75 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {pct < 75 ? 'Declining (<75%)' : 'Good Standing'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

