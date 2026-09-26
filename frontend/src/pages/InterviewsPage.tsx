import React, { useState, useEffect } from 'react';
import {
  Calendar, Sparkles, Plus, CheckCircle2, Clock, Trash2,
  BookOpen, HelpCircle, ShieldAlert, Award, User
} from 'lucide-react';
import { api } from '../api/client';
import { Interview } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const InterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [prepModal, setPrepModal] = useState(false);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepData, setPrepData] = useState<any>(null);

  // Add interview modal
  const [addModal, setAddModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    company: '',
    position: '',
    interview_date: '',
    interview_type: 'Technical' as Interview['interview_type'],
    interviewer: '',
    notes: '',
    checklist: ['Review system architecture trade-offs', 'Practice STAR behavioral answers', 'Prepare questions for the engineering team']
  });

  const fetchInterviews = async () => {
    try {
      const data = await api.interviews.list();
      setInterviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleGeneratePrep = async (company: string, position: string, type = 'Technical') => {
    setPrepLoading(true);
    setPrepModal(true);
    try {
      const data = await api.interviews.generatePrep(position, company, type);
      setPrepData(data);
    } catch (e: any) {
      alert(e.message || 'Error generating interview prep');
    } finally {
      setPrepLoading(false);
    }
  };

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.interviews.create(newInterview);
      setAddModal(false);
      setNewInterview({
        company: '',
        position: '',
        interview_date: '',
        interview_type: 'Technical',
        interviewer: '',
        notes: '',
        checklist: ['Review system architecture trade-offs', 'Practice STAR behavioral answers', 'Prepare questions for the engineering team']
      });
      fetchInterviews();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this interview entry?')) return;
    await api.interviews.delete(id);
    fetchInterviews();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Pipeline & AI Prep</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track interview milestones and generate practice questions tailored to your target openings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleGeneratePrep('Target Organization', 'Full Stack Developer', 'Technical')}
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Practice Simulation
          </Button>
          <Button onClick={() => setAddModal(true)} variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Scheduled Interviews ({interviews.length})</h2>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading interview schedule...</div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No interviews scheduled yet</h3>
            <p className="text-xs text-slate-400 mt-1">Keep applying and record interview rounds here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.position}</h3>
                      <p className="text-xs font-semibold text-indigo-600">{item.company}</p>
                    </div>
                    <Badge variant={item.interview_type === 'Technical' ? 'indigo' : item.interview_type === 'Coding' ? 'sky' : 'amber'} size="sm">
                      {item.interview_type} Round
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{item.interview_date}</span>
                    </div>
                    {item.interviewer && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{item.interviewer}</span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-600 mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 leading-relaxed">
                      {item.notes}
                    </p>
                  )}

                  {/* Checklist */}
                  {item.checklist?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Preparation Checklist:</span>
                      {item.checklist.map((chk, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{chk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    onClick={() => handleGeneratePrep(item.company, item.position, item.interview_type)}
                    variant="primary"
                    size="sm"
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Generate AI Prep
                  </Button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- ADD INTERVIEW MODAL --- */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Schedule Interview Milestone">
        <form onSubmit={handleAddInterview} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
              <input
                type="text"
                required
                value={newInterview.company}
                onChange={(e) => setNewInterview({ ...newInterview, company: e.target.value })}
                placeholder="Starlight Financial"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Position</label>
              <input
                type="text"
                required
                value={newInterview.position}
                onChange={(e) => setNewInterview({ ...newInterview, position: e.target.value })}
                placeholder="Full Stack Developer"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Date & Time</label>
              <input
                type="text"
                required
                value={newInterview.interview_date}
                onChange={(e) => setNewInterview({ ...newInterview, interview_date: e.target.value })}
                placeholder="2026-09-28 14:00"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Type</label>
              <select
                value={newInterview.interview_type}
                onChange={(e: any) => setNewInterview({ ...newInterview, interview_type: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="HR">HR Screen</option>
                <option value="Technical">Technical Discussion</option>
                <option value="Coding">Live Coding / Pair</option>
                <option value="Managerial">Managerial / Leadership</option>
                <option value="Final">Final Round</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Interviewer Name / Title</label>
            <input
              type="text"
              value={newInterview.interviewer}
              onChange={(e) => setNewInterview({ ...newInterview, interviewer: e.target.value })}
              placeholder="Marcus Cole (Staff Architect)"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Topics</label>
            <textarea
              rows={2}
              value={newInterview.notes}
              onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })}
              placeholder="System design, microservices, database transactions..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
            Schedule Interview
          </Button>
        </form>
      </Modal>

      {/* --- AI INTERVIEW PREPARATION MODAL (Section 20) --- */}
      <Modal
        isOpen={prepModal}
        onClose={() => setPrepModal(false)}
        title={prepData ? `${prepData.job_title} — AI Interview Preparation` : 'Interview Prep'}
        subtitle={`Tailored for ${prepData?.company || 'Target Company'}`}
        maxWidth="3xl"
      >
        {prepLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Generating role-specific technical and behavioral questions...</p>
          </div>
        ) : prepData ? (
          <div className="space-y-6">
            {/* Safety Disclaimer (Section 20 & 46) */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{prepData.disclaimer}</span>
            </div>

            {/* Preparation Tips */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Strategic Recommendations</h4>
              <ul className="space-y-1 text-xs text-slate-600">
                {prepData.preparation_tips?.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Questions */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Practice Question Guidance</h4>
              {prepData.questions?.map((q: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Q{idx + 1}: {q.question}</span>
                    <Badge variant={q.category === 'Technical' ? 'indigo' : q.category === 'Behavioral' ? 'amber' : 'emerald'} size="sm">
                      {q.category}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    <span className="font-semibold text-slate-700">Why Interviewers Ask: </span>
                    {q.why_asked}
                  </p>

                  <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700">
                    <span className="font-semibold text-indigo-900 block mb-0.5">Recommended Framework:</span>
                    <span>{q.recommended_approach}</span>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">Key Talking Points:</span>
                    <ul className="space-y-0.5 text-[11px] text-slate-600">
                      {q.key_points?.map((pt: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setPrepModal(false)} variant="primary" size="sm">
                Done Practicing
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
