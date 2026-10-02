'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Cpu, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function ModelPerformancePage() {
  const [metrics, setMetrics] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchMetrics = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/model-performance');
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const m = metrics || {};
  const isReady = m.isModelReady;

  const metricBars = [
    { metric: 'Precision', value: Math.round((m.precision || 0) * 100) },
    { metric: 'Recall', value: Math.round((m.recall || 0) * 100) },
    { metric: 'F1 Score', value: Math.round((m.f1Score || 0) * 100) },
    { metric: 'ROC-AUC', value: Math.round((m.rocAuc || 0) * 100) },
    { metric: 'PR-AUC', value: Math.round((m.prAuc || 0) * 100) },
    { metric: 'Calibration', value: Math.round((m.calibrationScore || 0) * 100) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-purple-500" />
            AI / ML Model Performance
          </h2>
          <p className="text-sm text-slate-500">
            Prediction engine metrics and model health monitoring.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Model Status */}
      <div
        className={`rounded-xl border p-4 flex items-start gap-4 ${
          isReady ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
        }`}
      >
        {isReady ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
        )}
        <div>
          <div className={`font-bold text-sm ${isReady ? 'text-emerald-900' : 'text-amber-900'}`}>
            {m.modelName || 'Ensemble Dropout Predictor'} — {m.modelVersion || 'Pending'}
          </div>
          <p className="text-xs text-slate-700 mt-0.5">{m.statusMessage || 'Model status unknown'}</p>
          {!isReady && (
            <p className="text-xs text-amber-700 mt-1.5">
              <strong>Note:</strong> The prediction engine is currently operating in rule-based mode.
              To enable ML-based predictions, upload a validated historical student outcome dataset via
              the Data Import module.
            </p>
          )}
        </div>
      </div>

      {/* Model Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Algorithm', value: m.algorithm || '—' },
          { label: 'Model Version', value: m.modelVersion || '—' },
          { label: 'Last Trained', value: m.lastTrained || '—' },
          { label: 'Data Drift Score', value: m.dataDriftScore !== undefined ? m.dataDriftScore.toFixed(3) : '—' },
        ].map(({ label, value }) => (
          <Card key={label} className="p-3 border-slate-200">
            <div className="text-xs text-slate-500 font-medium">{label}</div>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate">{value}</div>
          </Card>
        ))}
      </div>

      {/* Performance Metrics Bar Chart */}
      {isReady && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold">Model Performance Metrics</CardTitle>
            <p className="text-xs text-slate-500">All values shown as percentage (0–100%)</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricBars} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="metric" fontSize={10} tickLine={false} />
                  <YAxis fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                    formatter={(v: any) => [`${v}%`, 'Score']}
                  />
                  <Bar dataKey="value" name="Score %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fairness Notice */}
      <Card className="border-blue-100 bg-blue-50/30 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-blue-900">Model Fairness Notice</div>
            <p className="text-xs text-blue-700 mt-0.5">
              PRISM-EDU predictions are based on academic and behavioral indicators only.
              Predictions must be used as a <strong>decision-support tool</strong>, not as a deterministic outcome.
              Institutional policies must govern how predictions are acted upon.
              Contact your system administrator to configure protected attribute exclusions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
