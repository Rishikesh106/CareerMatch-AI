import React, { useState, useEffect } from 'react';
import {
  Kanban, Plus, Calendar, User, ExternalLink, Trash2,
  Edit2, ChevronRight, ChevronLeft, CheckCircle2, Bookmark
} from 'lucide-react';
import { api } from '../api/client';
import { Application } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

const COLUMNS: { id: Application['status']; label: string; color: string }[] = [
  { id: 'Saved', label: 'Saved', color: 'bg-slate-100 text-slate-700' },
  { id: 'Applied', label: 'Applied', color: 'bg-indigo-50 text-indigo-700' },
  { id: 'Screening', label: 'Screening', color: 'bg-sky-50 text-sky-700' },
  { id: 'Interview', label: 'Interview', color: 'bg-amber-50 text-amber-700' },
  { id: 'Offer', label: 'Offer', color: 'bg-emerald-50 text-emerald-700' },
  { id: 'Rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700' }
];

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const [formData, setFormData] = useState({
    job_title: '',
    company: '',
    status: 'Applied' as Application['status'],
    application_date: new Date().toISOString().split('T')[0],
    follow_up_date: '',
    interview_date: '',
    contact_person: '',
    job_url: '',
    notes: '',
    match_score: 85
  });

  const fetchApps = async () => {
    try {
      const data = await api.applications.list();
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleOpenAdd = () => {
    setEditingApp(null);
    setFormData({
      job_title: '',
      company: '',
      status: 'Applied',
      application_date: new Date().toISOString().split('T')[0],
      follow_up_date: '',
      interview_date: '',
      contact_person: '',
      job_url: '',
      notes: '',
      match_score: 85
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (app: Application) => {
    setEditingApp(app);
    setFormData({
      job_title: app.job_title,
      company: app.company,
      status: app.status,
      application_date: app.application_date || '',
      follow_up_date: app.follow_up_date || '',
      interview_date: app.interview_date || '',
      contact_person: app.contact_person || '',
      job_url: app.job_url || '',
      notes: app.notes || '',
      match_score: app.match_score || 85
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingApp) {
        await api.applications.update(editingApp.id, formData);
      } else {
        await api.applications.create(formData);
      }
      setModalOpen(false);
      fetchApps();
    } catch (err: any) {
      alert(err.message || 'Error saving application');
    }
  };

  const handleMoveStatus = async (app: Application, direction: 'forward' | 'backward') => {
    const currentIndex = COLUMNS.findIndex((c) => c.id === app.status);
    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      await api.applications.update(app.id, { status: newStatus });
      fetchApps();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application entry?')) return;
    await api.applications.delete(id);
    fetchApps();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Tracker (Kanban)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your full job application lifecycle from Saved to Offer.
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Track New Application
        </Button>
      </div>

      {/* Kanban Board Grid (Section 18) */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading Kanban pipeline...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
          {COLUMNS.map((column) => {
            const columnApps = applications.filter(
              (a) => a.status.toLowerCase() === column.id.toLowerCase()
            );

            return (
              <div
                key={column.id}
                className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/60 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{column.label}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
                      {columnApps.length}
                    </span>
                  </div>
                </div>

                {/* Applications list */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnApps.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400">
                      Empty column
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{app.job_title}</h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 shrink-0">
                              {app.match_score}%
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-indigo-600 line-clamp-1">{app.company}</p>

                          {app.notes && (
                            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              {app.notes}
                            </p>
                          )}

                          <div className="mt-2.5 space-y-1 text-[10px] text-slate-400">
                            {app.application_date && <div>Applied: {app.application_date}</div>}
                            {app.interview_date && <div className="text-amber-600 font-semibold">Interview: {app.interview_date}</div>}
                            {app.contact_person && <div>Contact: {app.contact_person}</div>}
                          </div>
                        </div>

                        {/* Card Controls */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveStatus(app, 'backward')}
                              title="Move back"
                              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveStatus(app, 'forward')}
                              title="Move forward"
                              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(app)}
                              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD / EDIT APPLICATION MODAL --- */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingApp ? 'Edit Application' : 'Track New Application'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="Software Engineer"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Google, Stripe, etc."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stage</label>
              <select
                value={formData.status}
                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Match Fit Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.match_score}
                onChange={(e) => setFormData({ ...formData, match_score: parseInt(e.target.value) || 80 })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Date</label>
              <input
                type="date"
                value={formData.application_date}
                onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Date (if set)</label>
              <input
                type="text"
                value={formData.interview_date}
                onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                placeholder="2026-09-28 14:00"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person / Recruiter</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Sarah Jenkins (Recruiter)"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Post URL</label>
              <input
                type="url"
                value={formData.job_url}
                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Follow-ups</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Referral notes, compensation discussed, next steps..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
            {editingApp ? 'Update Application' : 'Save Application'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
