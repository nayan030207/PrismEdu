'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, ArrowLeft, Zap, Play, CheckCircle2 } from 'lucide-react';

export default function PredictionEnginePage() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [lastBatch, setLastBatch] = React.useState('Today at 06:00 AM');

  const handleRunBatch = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLastBatch('Just now');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="h-6 w-6 text-purple-600" />
              Predictive ML Pipeline & Inference Engine
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated feature engineering, model scoring, and batch risk classification engine.
          </p>
        </div>

        <Button
          onClick={handleRunBatch}
          disabled={isRunning}
          size="sm"
          className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          <Play className="h-3.5 w-3.5" />
          {isRunning ? 'Running Inference...' : 'Trigger Batch Inference'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400 font-medium">Model Architecture</div>
          <div className="text-lg font-bold text-slate-900 mt-1">Gradient Boosted Trees (XGBoost)</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Status: Active & Serving</div>
        </Card>
        <Card className="border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400 font-medium">Inference Latency</div>
          <div className="text-lg font-bold text-slate-900 mt-1">42 ms / student</div>
          <div className="text-xs text-slate-500 mt-1">Last Batch Run: {lastBatch}</div>
        </Card>
        <Card className="border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400 font-medium">Cohort Coverage</div>
          <div className="text-lg font-bold text-slate-900 mt-1">1,240 / 1,240 Students</div>
          <div className="text-xs text-purple-600 font-medium mt-1">100% evaluated</div>
        </Card>
      </div>
    </div>
  );
}
