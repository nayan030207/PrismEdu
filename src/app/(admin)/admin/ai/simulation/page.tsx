'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, ArrowLeft, Sliders, Play, RotateCcw } from 'lucide-react';

export default function WhatIfSimulationPage() {
  const [attShift, setAttShift] = React.useState(10);
  const [mentoringRate, setMentoringRate] = React.useState(25);
  const [remedialSupport, setRemedialSupport] = React.useState(15);

  const baselineRisk = 84;
  const simulatedRisk = Math.max(
    18,
    Math.round(baselineRisk - (attShift * 1.8 + mentoringRate * 0.9 + remedialSupport * 0.7))
  );
  const preventedCount = baselineRisk - simulatedRisk;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-purple-600" />
              What-If Intervention Simulation
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate the institutional impact of attendance recovery, mentor allocation, and financial relief.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 bg-white p-5 lg:col-span-2 space-y-6">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-purple-600" /> Policy Simulation Parameters
          </CardTitle>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Attendance Improvement Goal</span>
                <span className="text-purple-600">+{attShift}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={attShift}
                onChange={(e) => setAttShift(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Faculty Mentorship Expansion</span>
                <span className="text-purple-600">+{mentoringRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={mentoringRate}
                onChange={(e) => setMentoringRate(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Remedial Academic Support Adoption</span>
                <span className="text-purple-600">+{remedialSupport}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={remedialSupport}
                onChange={(e) => setRemedialSupport(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-purple-50/50 p-5 flex flex-col justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Projected Institutional Impact</CardTitle>
            <div className="mt-4 space-y-3">
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-[11px] text-slate-400">Baseline High-Risk Population</div>
                <div className="text-xl font-bold text-slate-900">{baselineRisk} Students</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-[11px] text-slate-400">Simulated High-Risk Population</div>
                <div className="text-xl font-bold text-emerald-600">{simulatedRisk} Students</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="text-[11px] text-slate-400">Potential Dropouts Prevented</div>
                <div className="text-xl font-bold text-purple-600">~{preventedCount} Students</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
