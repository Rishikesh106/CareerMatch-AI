import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck,
  Award, TrendingUp, Lightbulb, Info, Download, Copy, Check,
  FileText, Wand2, Eye, Split, Layout, ArrowRight,
  Briefcase, ExternalLink, MapPin, DollarSign, Building, Bookmark
} from 'lucide-react';
import { api } from '../api/client';
import { ResumeAnalysis, ResumeCorrectionsResult, ResumeMatchedJobsResponse, ResumeMatchedJob } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const ResumeAnalysisPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [corrections, setCorrections] = useState<ResumeCorrectionsResult | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<ResumeMatchedJobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'studio' | 'diff' | 'preview' | 'overview'>('jobs');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (resumeId) {
      setLoading(true);
      Promise.all([
        api.resumes.getAnalysis(resumeId),
        api.resumes.getCorrections(resumeId),
        api.resumes.getMatchedJobs(resumeId)
      ])
        .then(([analysisRes, correctionsRes, jobsRes]) => {
          setAnalysis(analysisRes);
          setCorrections(correctionsRes);
          setMatchedJobs(jobsRes);
        })
        .catch((e) => console.error(e))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [resumeId]);

  const handleDownloadDocx = async () => {
    if (!resumeId) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/resumes/${resumeId}/download-corrected`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Corrected_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Failed to download document');
    }
  };

  const handleSaveAsNewVersion = async () => {
    if (!resumeId) return;
    setSaving(true);
    try {
      await api.resumes.saveCorrected(resumeId);
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/resumes');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to save corrected resume');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyText = () => {
    if (!corrections?.corrected_text) return;
    navigator.clipboard.writeText(corrections.corrected_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyJob = async (job: ResumeMatchedJob) => {
    setApplyingJobId(job.job_id);
    try {
      await api.jobs.apply(job.job_id);
      setAppliedJobIds((prev) => ({ ...prev, [job.job_id]: true }));
      // Open the direct application link in a new window/tab
      window.open(job.job_url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert(err.message || 'Failed to log application');
      window.open(job.job_url, '_blank', 'noopener,noreferrer');
    } finally {
      setApplyingJobId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Matching jobs, analyzing resume, and generating clarifications...</div>;
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
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
        <div className="flex items-center gap-2">
          {matchedJobs && (
            <Badge variant="indigo" size="sm">
              🎯 {matchedJobs.detected_domain} • {matchedJobs.detected_experience_tier}
            </Badge>
          )}
          <span className="text-xs text-slate-400">
            Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* --- HERO: AI RESUME AUTO-CORRECTION & CLARIFICATION STUDIO --- */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-8 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Wand2 className="w-3.5 h-3.5" />
              <span>All-In-One AI Resume & Job Matching Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Know Your Fit. Fix Mistakes. Apply Directly.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              We identified unquantified bullet points and weak phrasing, corrected them in your <span className="text-indigo-300 font-semibold">exact template</span>, and matched active roles with direct company application links.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => setActiveTab('jobs')}
                variant="primary"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                leftIcon={<Briefcase className="w-4 h-4" />}
              >
                View Matched Jobs ({matchedJobs?.total_matched_jobs || 0})
              </Button>

              <Button
                onClick={handleDownloadDocx}
                variant="outline"
                size="md"
                className="border-indigo-400/40 text-white hover:bg-white/10"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Corrected DOCX
              </Button>

              <Button
                onClick={handleSaveAsNewVersion}
                disabled={saving || saveSuccess}
                variant="ghost"
                size="md"
                className="text-slate-300 hover:text-white hover:bg-white/10"
                leftIcon={saveSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
              >
                {saveSuccess ? 'Saved to Profile!' : saving ? 'Saving...' : 'Save to Profile'}
              </Button>
            </div>
          </div>

          {/* Score Improvement Card */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Original</div>
              <div className="text-4xl font-extrabold text-slate-300">{analysis.overall_score}</div>
              <div className="text-[11px] text-slate-400 mt-1">Health Score</div>
            </div>

            <div className="flex flex-col items-center justify-center text-indigo-400 px-2">
              <ArrowRight className="w-6 h-6 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 mt-1">
                +{corrections?.score_delta || 12} pts
              </span>
            </div>

            <div className="text-center bg-indigo-500/20 px-4 py-3 rounded-xl border border-indigo-400/30">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Corrected</div>
              <div className="text-4xl font-black text-emerald-400">{corrections?.corrected_score || 97}</div>
              <div className="text-[11px] text-emerald-300 font-semibold mt-1">100% Clarified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>🎯 Matched Jobs for this Resume ({matchedJobs?.total_matched_jobs || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'studio'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Clarified Corrections ({corrections?.corrections_count || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'diff'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Split className="w-4 h-4" />
          <span>Side-by-Side Diff</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Template Preview (.docx)</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Health Breakdown</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* --- TAB: MATCHED COMPANY JOBS ACCORDING TO RESUME --- */}
      {/* ============================================================ */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Domain & Level Alignment Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-indigo-50 to-slate-50 border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Domain: {matchedJobs?.detected_domain}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  Level: {matchedJobs?.detected_experience_tier}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {matchedJobs?.experience_reason} — Roles below are ranked specifically for your uploaded resume with direct company apply links.
              </p>
            </div>

            <Button
              onClick={() => navigate('/dashboard/jobs')}
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Browse All Jobs
            </Button>
          </div>

          {/* Matched Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedJobs?.jobs.map((job) => (
              <div
                key={job.job_id}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  job.match_score >= 90
                    ? 'border-emerald-200 ring-1 ring-emerald-100'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Role & Match Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                          {job.company}
                        </span>
                        {job.is_fresher_friendly && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Fresher Friendly
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
                        {job.title}
                      </h3>
                    </div>

                    <div className={`shrink-0 px-3 py-1.5 rounded-xl text-center font-bold ${
                      job.match_score >= 90
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      <div className="text-sm font-black">{job.match_score}%</div>
                      <div className="text-[9px] uppercase tracking-wider">Match Fit</div>
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-slate-400" /> {job.work_type}</span>
                    {job.salary_min && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills Alignment */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Verified Skills in Your Resume ({job.matched_skills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.matched_skills.slice(0, 5).map((sk) => (
                        <span key={sk} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {sk}
                        </span>
                      ))}
                      {job.missing_skills.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px]">
                          +{job.missing_skills.length} to learn
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: Apply & Direct Link */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handleApplyJob(job)}
                    disabled={applyingJobId === job.job_id}
                    variant={appliedJobIds[job.job_id] ? "outline" : "primary"}
                    size="sm"
                    className={appliedJobIds[job.job_id] ? "border-emerald-300 text-emerald-700 bg-emerald-50/50" : ""}
                    leftIcon={appliedJobIds[job.job_id] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  >
                    {appliedJobIds[job.job_id] ? 'Applied & Tracked!' : applyingJobId === job.job_id ? 'Opening Portal...' : 'Apply on Company Site'}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate('/dashboard/matches', { state: { job_id: job.job_id, job_title: job.title, company: job.company } })}
                      variant="ghost"
                      size="sm"
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                    >
                      Fit Analysis
                    </Button>
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title="Open direct job link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- TAB 1: CLARIFIED CORRECTIONS LIST --- */}
      {/* ============================================================ */}
      {activeTab === 'studio' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>
                <strong>{corrections?.corrections_count || 0} specific mistakes clarified</strong> across Summary, Experience, Projects, and Achievements without altering your template or font.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700">Calibri 10.5pt Standard</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {corrections?.corrections.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {item.section}
                    </h3>
                  </div>
                  <Badge variant="indigo" size="sm">
                    {item.category}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700">AI Clarification Applied: </span>
                  {item.clarification_applied}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Before */}
                  <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
                    <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Original Unclarified</span>
                    </div>
                    <p className="text-xs text-rose-900 leading-relaxed font-mono line-through opacity-80">
                      {item.original}
                    </p>
                  </div>

                  {/* After */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>AI Clarified & Corrected</span>
                    </div>
                    <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
                      {item.corrected}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- TAB 2: SIDE-BY-SIDE DIFF --- */}
      {/* ============================================================ */}
      {activeTab === 'diff' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Split className="w-4 h-4 text-indigo-600" />
              <span>Side-by-Side Comparison</span>
            </h2>
            <span className="text-xs text-slate-400">Green denotes clarified metrics, verbs & standards</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
                <span>Original Resume ({analysis.overall_score}/100)</span>
                <span className="text-[10px] text-slate-400">Uploaded version</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto bg-slate-50/50">
                {corrections?.original_text || 'Loading original text...'}
              </pre>
            </div>

            {/* Corrected */}
            <div className="border border-indigo-200 rounded-xl overflow-hidden ring-1 ring-indigo-100">
              <div className="bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-900 border-b border-indigo-100 flex items-center justify-between">
                <span>Corrected Resume ({corrections?.corrected_score || 97}/100)</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Same Template Preserved</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-slate-900 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto bg-white">
                {corrections?.corrected_text || 'Loading corrected text...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- TAB 3: CLEAN TEMPLATE PREVIEW --- */}
      {/* ============================================================ */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Document Template Preview</h3>
              <p className="text-xs text-slate-500">
                Rendered with standard single-column ATS layout, Calibri typography, and exact margin hierarchy.
              </p>
            </div>
            <Button
              onClick={handleDownloadDocx}
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download as .DOCX
            </Button>
          </div>

          {/* Visual Paper Sheet */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-10 max-w-4xl mx-auto font-sans leading-relaxed text-slate-900">
            <div className="space-y-6">
              {corrections?.corrected_text.split('\n\n').map((block, bIdx) => {
                const lines = block.split('\n').filter(Boolean);
                if (!lines.length) return null;

                const firstLine = lines[0].trim();
                const isSectionHeader = firstLine.toUpperCase() === firstLine && firstLine.length < 35 && !firstLine.includes('@');

                if (bIdx === 0) {
                  // Candidate Header
                  return (
                    <div key={bIdx} className="text-center border-b border-slate-200 pb-4 space-y-1">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{lines[0]}</h1>
                      {lines[1] && <div className="text-xs font-semibold text-indigo-600">{lines[1]}</div>}
                      {lines[2] && <div className="text-[11px] text-slate-500">{lines[2]}</div>}
                    </div>
                  );
                }

                if (isSectionHeader) {
                  return (
                    <div key={bIdx} className="space-y-2 pt-2">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                        {firstLine}
                      </h2>
                      <div className="space-y-1.5 pl-0.5">
                        {lines.slice(1).map((subline, sIdx) => {
                          if (subline.startsWith('●')) {
                            return (
                              <div key={sIdx} className="text-xs text-slate-800 flex items-start gap-2 pl-2">
                                <span className="text-indigo-600 font-bold shrink-0">•</span>
                                <span className="leading-relaxed">{subline.replace(/^●\s*/, '')}</span>
                              </div>
                            );
                          }
                          return (
                            <p key={sIdx} className="text-xs text-slate-700 leading-relaxed font-medium">
                              {subline}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={bIdx} className="space-y-1.5">
                    {lines.map((l, lIdx) => (
                      <p key={lIdx} className="text-xs text-slate-700 leading-relaxed">
                        {l}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- TAB 4: ORIGINAL HEALTH BREAKDOWN --- */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Actionable Suggestions Detected</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      )}
    </div>
  );
};
