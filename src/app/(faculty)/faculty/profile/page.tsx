'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, BookOpen, GraduationCap, Building2 } from 'lucide-react';

export default function FacultyProfilePage() {
  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex items-center gap-2">
        <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-purple-600" />
            Faculty Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">Instructor credentials, assigned department, and mentee cohort details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 border-slate-200 bg-white text-center flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            SK
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-3">Prof. Sandeep Kulkarni</h2>
          <p className="text-xs text-purple-700 font-medium">Associate Professor</p>
          <span className="mt-2 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-0.5 rounded-full">
            Computer Engineering
          </span>
        </Card>

        <Card className="p-5 border-slate-200 bg-white md:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Academic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Employee ID</span>
              <span className="font-semibold text-slate-800 font-mono">FAC-CE-01</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Email Address</span>
              <span className="font-semibold text-slate-800">faculty@prismedu.com</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Department</span>
              <span className="font-semibold text-slate-800">Computer Engineering</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Mentee Batch</span>
              <span className="font-semibold text-slate-800">Second Year (SE) - 54 Students</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Specialization</span>
              <span className="font-semibold text-slate-800">Data Structures & Distributed Systems</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Current Semester</span>
              <span className="font-semibold text-slate-800">Semester 1 (AY 2025-26)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
