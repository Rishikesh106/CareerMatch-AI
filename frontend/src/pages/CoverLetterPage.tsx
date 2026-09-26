import React, { useState } from 'react';
import {
  FileText, Sparkles, Copy, Check, Download, AlertCircle,
  Briefcase, ShieldAlert
} from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';

export const CoverLetterPage: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('Full Stack Developer');
  const [company, setCompany] = useState('Starlight Financial');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [output, setOutput] = useState<{ subject: string; content: string; disclaimer: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.aiTools.generateCoverLetter({
        job_title: jobTitle,
        company,
        job_description: description,
        tone
      });
      setOutput(data);
    } catch (e: any) {
      alert(e.message || 'Error generating cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(`${output.subject}\n\n${output.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([`${output.subject}\n\n${output.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${company.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Cover Letter Generator</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tailored, truthful outreach letters synthesizing your verified resume skills with company requirements.
        </p>
      </div>

      {/* Warning Banner (Section 21 & 46) */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Human Verification Reminder: </span>
          Review AI-generated content before sending. CareerMatch AI anchors content purely in your verified profile and never invents unpossessed qualifications.
        </div>
      </div>

      {/* Input Configuration */}
      <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title *</label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Full Stack Developer"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company *</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Starlight Financial"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Professional">Professional</option>
              <option value="Enthusiastic">Enthusiastic</option>
              <option value="Confident">Confident</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Key Requirements / Notes (Optional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fintech platform scaling, microservices in Python, React frontend..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={loading} leftIcon={<Sparkles className="w-4 h-4" />}>
            Generate Tailored Cover Letter
          </Button>
        </div>
      </form>

      {/* Output / Editor */}
      {output && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Subject</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{output.subject}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm" leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download .txt
              </Button>
            </div>
          </div>

          <div>
            <textarea
              rows={14}
              value={output.content}
              onChange={(e) => setOutput({ ...output, content: e.target.value })}
              className="w-full text-xs p-4 border border-slate-200 rounded-xl leading-relaxed font-sans text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            {output.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};
