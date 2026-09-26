import React, { useState } from 'react';
import { Mail, Sparkles, Copy, Check, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';

export const EmailGeneratorPage: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('Full Stack Developer');
  const [company, setCompany] = useState('Starlight Financial');
  const [emailType, setEmailType] = useState('Application');
  const [contactPerson, setContactPerson] = useState('Sarah Jenkins');
  const [output, setOutput] = useState<{ subject: string; body: string; disclaimer: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.aiTools.generateEmail({
        job_title: jobTitle,
        company,
        email_type: emailType,
        contact_person: contactPerson
      });
      setOutput(data);
    } catch (e: any) {
      alert(e.message || 'Error generating email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(`${output.subject}\n\n${output.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Email Drafter</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate concise, professional recruiter outreach, follow-up, and post-interview thank you messages.
        </p>
      </div>

      {/* Input Options */}
      <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Starlight Financial"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Purpose</label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Application">Initial Application Submission</option>
              <option value="Follow-up">Application Follow-up (1-2 weeks later)</option>
              <option value="Thank You">Post-Interview Thank You Note</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name / Title</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Sarah Jenkins (Engineering Manager)"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={loading} leftIcon={<Sparkles className="w-4 h-4" />}>
            Draft Professional Email
          </Button>
        </div>
      </form>

      {/* Output / Editor */}
      {output && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Suggested Subject</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{output.subject}</p>
            </div>
            <Button onClick={handleCopy} variant="outline" size="sm" leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}>
              {copied ? 'Copied Draft!' : 'Copy to Clipboard'}
            </Button>
          </div>

          <div>
            <textarea
              rows={9}
              value={output.body}
              onChange={(e) => setOutput({ ...output, body: e.target.value })}
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
