'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Shield,
  GraduationCap,
  Users,
  LineChart,
  BrainCircuit,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { PrismLogo } from '@/components/ui/logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#8B5CF6] selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[400px] bg-slate-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Official Brand Logo */}
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <PrismLogo size="sm" showSubtitle={false} variant="color" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-[#8B5CF6] transition-colors">
              Overview
            </a>
            <a href="#how-it-works" className="hover:text-[#8B5CF6] transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-[#8B5CF6] transition-colors">
              Features
            </a>
            <a href="#portals" className="hover:text-[#8B5CF6] transition-colors">
              Role Portals
            </a>
          </nav>

          {/* Upper Right Login Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Login to Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section id="overview" className="pt-12 pb-20 md:pt-16 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
          {/* Main Official Brand Logo Card */}
          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/60 max-w-xl w-full flex justify-center">
            <PrismLogo size="xl" showSubtitle={true} variant="color" stacked={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#7C3AED] text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
            <span>AI-Driven Early Dropout Warning & Mentorship Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0C182B] tracking-tight leading-tight max-w-4xl mx-auto">
            Predict Student Risk <br />
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
              Before It Impacts Graduation.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            PRISM-EDU processes academic scores, attendance trends, financial indicators, and personal background factors to detect vulnerable students early and guide faculty mentors through targeted 1-on-1 interventions.
          </p>

          {/* Hero Action CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
            >
              <Lock className="h-4 w-4" />
              <span>Login to Institutional Portal</span>
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100/80 text-slate-700 font-semibold text-sm transition-all shadow-xs"
            >
              <span>Explore How It Works</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Platform Preview Matrix */}
          <div className="mt-14 relative max-w-5xl mx-auto w-full">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-4 sm:p-6 text-left space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <PrismLogo size="sm" showSubtitle={false} variant="color" />
                  <span className="text-xs font-bold text-[#0C182B] uppercase tracking-wider">Cohort Health Matrix</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#7C3AED] font-semibold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Operational Roster
                </div>
              </div>

              {/* Sample Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Retention Rate</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">94.8%</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">↑ +3.2% vs last semester</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">At-Risk Students</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">Early Warning</p>
                  <p className="text-[10px] text-amber-600 font-medium mt-1">Multi-factor detection</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Active Interventions</p>
                  <p className="text-2xl font-black text-[#8B5CF6] mt-1">Tracked Live</p>
                  <p className="text-[10px] text-purple-600 font-medium mt-1">Academic & Financial Aid</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Data Resolution</p>
                  <p className="text-2xl font-black text-[#0C182B] mt-1">Tag Aliasing</p>
                  <p className="text-[10px] text-slate-600 font-medium mt-1">Excel & CSV resilient parsing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#8B5CF6]">
                End-to-End Workflow Architecture
              </h2>
              <h3 className="text-3xl sm:text-4xl font-black text-[#0C182B] tracking-tight">
                How PRISM-EDU Works Step-by-Step
              </h3>
              <p className="text-sm text-slate-600 font-normal">
                From raw institutional spreadsheets to faculty mentorship action—explore the complete 4-stage pipeline.
              </p>
            </div>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 relative group hover:border-[#8B5CF6]/50 transition-colors shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-black text-lg border border-purple-200">
                  1
                </div>
                <h4 className="text-base font-bold text-[#0C182B]">Data Ingestion & Excel Parsing</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Upload raw student datasets (`.xlsx`, `.xls`, `.csv`). The system automatically matches custom column tags (PRN, Roll No, DOB as string or number) using flexible alias mapping.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#7C3AED]">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Resilient Schema Normalization</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 relative group hover:border-[#8B5CF6]/50 transition-colors shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-black text-lg border border-purple-200">
                  2
                </div>
                <h4 className="text-base font-bold text-[#0C182B]">Multi-Vector Risk Analysis</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Calculates predictive risk scores across 4 key vectors: Academic Performance, Attendance Trends, Financial Support Requirements, and Personal Support Factors.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#7C3AED]">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>Early Warning Indicators</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 relative group hover:border-[#8B5CF6]/50 transition-colors shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-black text-lg border border-purple-200">
                  3
                </div>
                <h4 className="text-base font-bold text-[#0C182B]">Faculty Mentorship Hub</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Mentors receive prioritized attention lists, schedule 1-on-1 academic tutoring sessions, assist with scholarship applications, and monitor progress.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#7C3AED]">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Personalized Interventions</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 relative group hover:border-[#8B5CF6]/50 transition-colors shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-black text-lg border border-purple-200">
                  4
                </div>
                <h4 className="text-base font-bold text-[#0C182B]">Institutional Oversight</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Administrators track macro cohort retention trends, review mentor efficiency, and make data-backed institutional policy decisions.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#7C3AED]">
                  <LineChart className="h-3.5 w-3.5" />
                  <span>Executive Cohort Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#8B5CF6]">
              Platform Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0C182B] tracking-tight">
              Built for Institutional Excellence
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-[#0C182B]">Smart Excel Import</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supports numeric and string dates of birth, custom PRN header tags, and automated column alias matching out-of-the-box.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-[#0C182B]">Actionable Attention Roster</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filters students who require immediate attention due to declining attendance, academic drop-offs, or financial hardship.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-[#0C182B]">Role-Based Security (RBAC)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict separation of roles between Administrators, Faculty Mentors, and Students with JWT authentication and middleware protection.
              </p>
            </div>
          </div>
        </section>

        {/* Role Portals Overview Section */}
        <section id="portals" className="py-20 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#8B5CF6]">
                Tailored Access Portals
              </h2>
              <h3 className="text-3xl sm:text-4xl font-black text-[#0C182B] tracking-tight">
                Designed for Every Institutional Stakeholder
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Admin Portal Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-left shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0C182B]">Admin Portal</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Institutional Governance</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>Upload & validate cohort datasets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>Institutional retention dashboards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>Manage faculty allocations</span>
                  </li>
                </ul>
              </div>

              {/* Faculty Portal Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-left shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0C182B]">Faculty Portal</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Mentorship & Interventions</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>View assigned student roster</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>Track attendance & grade drop alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>Log 1-on-1 intervention notes</span>
                  </li>
                </ul>
              </div>

              {/* Student Portal Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-left shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0C182B]">Student Portal</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Academic & Resource Hub</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>View course progress & attendance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>Access recommended learning materials</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7C3AED] shrink-0" />
                    <span>Request mentorship support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="pt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm shadow-xl shadow-purple-500/25 transition-all hover:scale-105"
              >
                <Lock className="h-4 w-4" />
                <span>Go to Portal Login Screen</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <PrismLogo size="sm" showSubtitle={true} variant="color" />
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <Link href="/login" className="hover:text-[#8B5CF6] transition-colors">
              Portal Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
