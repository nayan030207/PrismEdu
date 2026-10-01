'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  Sparkles,
  Tag,
} from 'lucide-react';
import type { StudentImportRow, ImportError, ImportDuplicate, HeaderTagMapping } from '@/types';

type ImportStep = 'upload' | 'preview' | 'completed';

export default function StudentImportPage() {
  const router = useRouter();

  const [step, setStep] = React.useState<ImportStep>('upload');
  const [file, setFile] = React.useState<File | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  // Validation output
  const [validRows, setValidRows] = React.useState<StudentImportRow[]>([]);
  const [errors, setErrors] = React.useState<ImportError[]>([]);
  const [duplicates, setDuplicates] = React.useState<ImportDuplicate[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);

  // Header tag mapping output
  const [tagMappings, setTagMappings] = React.useState<HeaderTagMapping[]>([]);
  const [headerRowIndex, setHeaderRowIndex] = React.useState<number>(0);

  // Confirmation state
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [importResult, setImportResult] = React.useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleValidateAndUpload = async () => {
    if (!file) return;
    setIsValidating(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse spreadsheet file');

      setTotalRows(data.totalRows);
      setValidRows(data.validRows || []);
      setErrors(data.errors || []);
      setDuplicates(data.duplicates || []);
      setTagMappings(data.tagMappings || []);
      setHeaderRowIndex(data.headerRowIndex || 0);
      if (data.importResult) {
        setImportResult(data.importResult);
        setStep('completed');
      } else {
        setStep('preview');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing spreadsheet file');
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (validRows.length === 0) return;
    setIsConfirming(true);

    try {
      const res = await fetch('/api/students/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setImportResult(data.result);
      setStep('completed');
    } catch (err: any) {
      alert(err.message || 'Import execution failed');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Batch User & Academic Data Excel/CSV Import
          </h2>
          <p className="text-sm text-slate-500">
            Import Admins, Faculty, or Students along with 10th, 12th, entrance exam percentiles, ranks, and CAP allotment details.
          </p>
        </div>
        <a href="/api/students/import/template" download>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-white">
            <Download className="h-4 w-4 text-indigo-600" />
            <span>Download Master Sample Template</span>
          </Button>
        </a>
      </div>

      {/* Workflow Progress Steps */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            step === 'upload'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Upload File</span>
        </div>
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            step === 'preview'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Validate & Preview</span>
        </div>
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            step === 'completed'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
            3
          </span>
          <span>Accounts Created & Analyzed</span>
        </div>
      </div>

      {/* STEP 1: Upload File */}
      {step === 'upload' && (
        <Card className="border-slate-200 p-8">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select User Excel or CSV File</h3>
              <p className="text-xs text-slate-500 mt-1">
                Supports batch import of Admin, Faculty, and Student records with full academic background. Missing fields automatically default to &quot;Not Provided&quot;.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-indigo-600 hover:underline">
                  Click to select file
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  {file ? file.name : 'No file selected yet'}
                </span>
              </label>
            </div>

            <Button
              onClick={handleValidateAndUpload}
              disabled={!file || isValidating}
              isLoading={isValidating}
              className="w-full gap-2"
            >
              <span>Validate Spreadsheet Rows</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Validation Preview & Error Inspection */}
      {step === 'preview' && (
        <div className="space-y-6">
          {/* Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Card className="p-4 border-slate-200">
              <span className="text-xs text-slate-400">Total Rows Detected</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{totalRows}</p>
            </Card>
            <Card className="p-4 border-emerald-200 bg-emerald-50/30">
              <span className="text-xs text-emerald-700 font-medium">Valid Ready to Import</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">{validRows.length}</p>
            </Card>
            <Card className="p-4 border-amber-200 bg-amber-50/30">
              <span className="text-xs text-amber-700 font-medium">Duplicate User IDs</span>
              <p className="text-xl font-bold text-amber-700 mt-1">{duplicates.length}</p>
            </Card>
            <Card className="p-4 border-red-200 bg-red-50/30">
              <span className="text-xs text-red-700 font-medium">Validation Errors</span>
              <p className="text-xl font-bold text-red-700 mt-1">{errors.length}</p>
            </Card>
          </div>

          {/* Header Column Tag Reader Output Card */}
          {tagMappings.length > 0 && (
            <Card className="border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Header Column Tag Reader Matrix
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                        Read Row #{headerRowIndex + 1}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Read {tagMappings.length} column heading tag(s) first and mapped them to model target attributes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                    ✓ {tagMappings.filter((t) => t.matched).length} Tags Auto-Mapped
                  </span>
                  {tagMappings.some((t) => !t.matched) && (
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                      {tagMappings.filter((t) => !t.matched).length} Custom Tags
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                {tagMappings.map((tag, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-xs flex items-center justify-between gap-2 ${
                      tag.matched
                        ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="truncate flex-1 min-w-0">
                      <span className="font-semibold text-slate-900 block truncate" title={tag.rawTag}>
                        &quot;{tag.rawTag}&quot;
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">Column Heading</span>
                    </div>

                    <ArrowRight className="h-3 w-3 text-indigo-500 shrink-0" />

                    <div className="text-right truncate flex-1 min-w-0">
                      <span
                        className={`font-mono text-[11px] font-bold block truncate ${
                          tag.matched ? 'text-indigo-600' : 'text-slate-500'
                        }`}
                        title={tag.resolvedField || 'Unmapped'}
                      >
                        {tag.resolvedField || 'Unmapped'}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {tag.matched ? '✓ Mapped' : 'Custom'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Error Table */}
          {errors.length > 0 && (
            <Card className="border-red-200 bg-red-50/20">
              <CardHeader className="pb-3 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <CardTitle className="text-sm font-bold text-red-900">
                    Row Validation Lapses Detected
                  </CardTitle>
                </div>
                <p className="text-xs text-slate-500">
                  The following rows will be excluded until corrected in your source spreadsheet:
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Row #</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Identified Issue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-bold text-red-700">
                          Row {err.row}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-700 font-semibold">
                          {err.field}
                        </TableCell>
                        <TableCell className="text-xs text-red-600 font-medium">
                          {err.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Valid Rows Preview Table */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">Validated Records Preview ({validRows.length})</CardTitle>
              <p className="text-xs text-slate-500">
                These user profiles will be created with default passwords formatted as <code className="font-bold text-indigo-600">[Username]@DDMM</code>.
              </p>
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>ID / Emp ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>10th Details</TableHead>
                    <TableHead>12th Marks (%)</TableHead>
                    <TableHead>JEE / MHT-CET</TableHead>
                    <TableHead>CAP Allotment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            row.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : row.role === 'faculty'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {row.role || 'student'}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-indigo-600">
                        {row.student_id || row.employee_id || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-900">
                        {row.full_name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">{row.email}</TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {(() => {
                          const school = row.tenth_school_name && row.tenth_school_name !== 'Not Provided' ? row.tenth_school_name : '';
                          const board = row.tenth_board && row.tenth_board !== 'Not Provided' ? row.tenth_board : '';
                          const name = board || school;
                          const pct = row.tenth_percentage;
                          if (name && pct) return `${name} (${pct}%)`;
                          if (pct) return `${pct}%`;
                          if (name) return name;
                          return 'N/A';
                        })()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {(() => {
                          const school = row.twelfth_school_name && row.twelfth_school_name !== 'Not Provided' ? row.twelfth_school_name : '';
                          const board = row.twelfth_board && row.twelfth_board !== 'Not Provided' ? row.twelfth_board : '';
                          const name = board || school;
                          const pct = row.twelfth_percentage;
                          if (name && pct) return `${name} (${pct}%)`;
                          if (pct) return `${pct}%`;
                          if (name) return name;
                          return 'N/A';
                        })()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {(() => {
                          const formatRank = (r: any) => {
                            const n = typeof r === 'number' ? r : parseInt(String(r), 10);
                            return !isNaN(n) && n > 0 ? ` (#${n})` : '';
                          };
                          if (row.jee_main_percentile) {
                            return `JEE: ${row.jee_main_percentile}%ile${formatRank(row.jee_main_rank)}`;
                          }
                          if (row.mht_cet_percentile) {
                            return `CET: ${row.mht_cet_percentile}%ile${formatRank(row.mht_cet_rank)}`;
                          }
                          return 'N/A';
                        })()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {row.cap_round_allotment && row.cap_round_allotment !== 'Not Provided'
                          ? row.cap_round_allotment
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Confirm Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setStep('upload')} className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Choose Different File</span>
            </Button>

            <Button
              onClick={handleConfirmImport}
              disabled={validRows.length === 0 || isConfirming}
              isLoading={isConfirming}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm & Import {validRows.length} Users</span>
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Completed Outcome */}
      {step === 'completed' && (
        <Card className="border-emerald-200 bg-emerald-50/30 p-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Batch Import Completed Successfully</h3>
              <p className="text-xs text-slate-600 mt-1">
                {importResult?.createdCount || validRows.length} user profile(s) generated. Initial default passwords set to <code className="font-bold text-indigo-600">[Username]@DDMM</code>.
              </p>
            </div>

            {/* Created users preview */}
            {importResult?.createdStudents && importResult.createdStudents.length > 0 && (
              <div className="bg-white border border-emerald-200 rounded-lg p-3 text-left max-h-60 overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Imported Users & Credentials:</h4>
                <div className="space-y-1.5 text-xs font-mono">
                  {importResult.createdStudents.map((st: any, i: number) => (
                    <div key={i} className="flex items-center justify-between border-b pb-1 border-slate-100 text-[11px]">
                      <span><strong className="text-slate-900">{st.full_name}</strong> ({st.email})</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">Pass: {st.tempPassword || 'Set via DOB'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <Button onClick={() => router.push('/faculty/students')}>
                View Assigned Users
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setValidRows([]);
                  setErrors([]);
                }}
              >
                Import More
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
