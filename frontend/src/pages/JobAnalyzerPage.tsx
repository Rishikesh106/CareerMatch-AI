import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, FileText, CheckCircle2, ArrowRight, Layers,
  Briefcase, GraduationCap, AlertCircle, Copy
} from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const JobAnalyzerPage: React.FC = () => {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.length < 25) {
      setError('Please paste a comprehensive job description (at least 25 characters).');
      return;
    }
    setError(null);
    setAnalyzing(true);

    try {
      const data = await api.jobs.analyzeJD({
        description,
        title: title || undefined,
        company: company || undefined
      });
      setExtractedData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze job description.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProceedToMatch = () => {
    navigate('/dashboard/matches', {
      state: {
        job_title: extractedData.title,
        company: extractedData.company || 'Target Organization',
        job_description: description
      }
    });
  };

  const handleLoadSample = () => {
    setTitle('Senior Backend Engineer');
    setCompany('FinTech Scaleup');
    setDescription(`About the Role:
We are looking for a Senior Backend Engineer to design and build our core financial ledger and transaction processing APIs. You will work on distributed microservices handling millions of events daily.

Requirements:
- 3+ years of experience with Python, FastAPI, and asynchronous programming
- Deep knowledge of SQL and PostgreSQL schema optimization, indexing, and transactions
- Experience with Docker, Kubernetes, and CI/CD automation pipelines
- Practical familiarity with Redis caching and Celery message queues
- Experience designing and securing RESTful APIs

Preferred Qualifications:
- Familiarity with cloud platforms such as AWS or GCP
- Experience with Kafka or event-driven systems
- Bachelor's degree in Computer Science or equivalent practical experience

Responsibilities:
- Build resilient, fault-tolerant financial microservices
- Collaborate with frontend engineers to integrate GraphQL and REST APIs
- Write unit and end-to-end integration test suites ensuring 90%+ code coverage`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Description Analyzer</h1>
          <p className="text-xs text-slate-500 mt-1">
            Paste any external job description to instantly extract skills, prerequisites, and keywords.
          </p>
        </div>

        <Button
          onClick={handleLoadSample}
          variant="outline"
          size="sm"
          leftIcon={<FileText className="w-3.5 h-3.5" />}
        >
          Load Sample FinTech JD
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, OpenAI, Datadog"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Paste Job Description *</label>
          <textarea
            rows={8}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste raw job description text from LinkedIn, Indeed, or company careers portal..."
            className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={analyzing}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {analyzing ? 'Extracting Entities...' : 'Analyze Job Description'}
          </Button>
        </div>
      </form>

      {/* Extracted Information Display */}
      {extractedData && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Analysis Result</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{extractedData.title}</h2>
              <p className="text-xs text-slate-500">{extractedData.company}</p>
            </div>

            <Button
              onClick={handleProceedToMatch}
              variant="primary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Match With My Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Skills */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Required Skills Extracted</h3>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.required_skills?.map((s: string) => (
                  <Badge key={s} variant="indigo" size="sm">✓ {s}</Badge>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Preferred Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.preferred_skills?.map((s: string) => (
                  <Badge key={s} variant="slate" size="sm">{s}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">Experience Requirement:</span>
              <span className="text-slate-900 font-medium">{extractedData.experience_requirement}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">Education Requirement:</span>
              <span className="text-slate-900 font-medium">{extractedData.education_requirement}</span>
            </div>
          </div>

          {/* Key Responsibilities */}
          {extractedData.responsibilities?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Core Responsibilities</h3>
              <ul className="space-y-1.5">
                {extractedData.responsibilities.map((r: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
