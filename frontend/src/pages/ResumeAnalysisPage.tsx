import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck,
  Award, TrendingUp, Lightbulb, Info
} from 'lucide-react';
import { api } from '../api/client';
import { ResumeAnalysis } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const ResumeAnalysisPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resumeId) {
      api.resumes.getAnalysis(resumeId)
        .then((res) => setAnalysis(res))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [resumeId]);

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Running AI Resume Analysis...</div>;
  }

  if (!analysis) {
    return (
      <div className="text-center py-20">
        <p className="text-xs text-slate-500">Analysis could not be loaded.</p>
        <Button onClick={() => navigate('/dashboard/resumes')} variant="outline" size="sm" className="mt-3">
          Back to Resumes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/dashboard/resumes')}
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Resumes
        </Button>
        <span className="text-xs text-slate-400">
          Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Safety & Quality Rule Banner (Section 11 & 46) */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <span className="font-bold">AI Safety Notice:</span> Suggestions provided below are advisory recommendations to help you highlight truthful accomplishments. CareerMatch AI never recommends adding skills or credentials you do not genuinely possess.
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <Badge variant="indigo" size="md">Quality Assessment</Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Resume Health & Impact</h1>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Evaluates technical density, measurable outcomes, action verbs, and structure against tech industry hiring benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-5xl font-black text-indigo-600">{analysis.overall_score}</span>
            <span className="text-slate-400 font-bold text-lg">/100</span>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              Overall Health
            </span>
          </div>
        </div>
      </div>

      {/* Component Level Metric Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider text-slate-400">
          Component Health Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Skills Coverage</span>
              <span className="text-slate-900">{analysis.skills_score}%</span>
            </div>
            <ProgressBar value={analysis.skills_score} color="auto" showValue={false} />
            <p className="text-[11px] text-slate-400 mt-1">Industry tech taxonomy alignment</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Experience Clarity</span>
              <span className="text-slate-900">{analysis.experience_score}%</span>
            </div>
            <ProgressBar value={analysis.experience_score} color="auto" showValue={false} />
            <p className="text-[11px] text-slate-400 mt-1">Action verbs & role progression</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Projects Quality</span>
              <span className="text-slate-900">{analysis.projects_score}%</span>
            </div>
            <ProgressBar value={analysis.projects_score} color="auto" showValue={false} />
            <p className="text-[11px] text-slate-400 mt-1">Hands-on architecture evidence</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Keyword Coverage</span>
              <span className="text-slate-900">{analysis.keywords_score}%</span>
            </div>
            <ProgressBar value={analysis.keywords_score} color="auto" showValue={false} />
            <p className="text-[11px] text-slate-400 mt-1">Role keyword discoverability</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Quantification</span>
              <span className="text-slate-900">{analysis.achievement_score}%</span>
            </div>
            <ProgressBar value={analysis.achievement_score} color="auto" showValue={false} />
            <p className="text-[11px] text-slate-400 mt-1">Metrics, %, latency, scale</p>
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">Actionable Suggestions</h2>
        </div>

        <div className="space-y-2.5">
          {analysis.suggestions.map((sug, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{sug}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <h3>Identified Strengths</h3>
          </div>
          <div className="space-y-2">
            {analysis.strengths.map((str, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 text-xs text-emerald-900 leading-relaxed">
                ✓ {str}
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <h3>Areas for Improvement</h3>
          </div>
          <div className="space-y-2">
            {analysis.weaknesses.map((w, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-amber-50/50 text-xs text-amber-900 leading-relaxed">
                ! {w}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
