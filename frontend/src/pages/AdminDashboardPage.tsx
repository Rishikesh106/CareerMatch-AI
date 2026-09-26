import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Briefcase, FileText, Cpu, Activity,
  Lock, Plus, Trash2, CheckCircle2, XCircle, Search
} from 'lucide-react';
import { api } from '../api/client';
import { AdminStats, User as UserType } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'skills' | 'audit' | 'ai'>('users');
  const [loading, setLoading] = useState(true);

  // Users tab
  const [users, setUsers] = useState<UserType[]>([]);
  // Jobs tab
  const [jobs, setJobs] = useState<any[]>([]);
  // Skills tab
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillModal, setNewSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Programming', description: '' });

  // Audit tab
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  // AI tab
  const [aiUsage, setAiUsage] = useState<any[]>([]);

  const fetchAdminData = async () => {
    try {
      const s = await api.admin.getStats();
      setStats(s);
      const u = await api.admin.getUsers();
      setUsers(u);
      const j = await api.jobs.list();
      setJobs(j);
      const sk = await api.admin.getSkills();
      setSkills(sk);
      const al = await api.admin.getAuditLogs();
      setAuditLogs(al);
      const ai = await api.admin.getAIUsage();
      setAiUsage(ai);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId: string) => {
    try {
      await api.admin.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (e: any) {
      alert(e.message || 'Cannot modify this user');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Permanently remove this job opening?')) return;
    try {
      await api.jobs.delete(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createSkill(newSkill);
      setNewSkillModal(false);
      setNewSkill({ name: '', category: 'Programming', description: '' });
      const sk = await api.admin.getSkills();
      setSkills(sk);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await api.admin.deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Loading administrator controls...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Operations Portal</h1>
            <Badge variant="purple" size="sm">Privileged Access</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System overview, user governance, skills taxonomy, audit logs, and AI resource consumption.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          subtitle={`${stats?.active_users || 0} active accounts`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Catalog Jobs"
          value={stats?.total_jobs || 0}
          subtitle="Indexed openings"
          icon={Briefcase}
          color="emerald"
        />
        <StatCard
          title="AI Executions"
          value={stats?.total_ai_requests || 0}
          subtitle={`${stats?.total_ai_tokens?.toLocaleString() || 0} tokens consumed`}
          icon={Cpu}
          color="sky"
        />
        <StatCard
          title="Audit Events"
          value={stats?.total_audit_events || 0}
          subtitle="Security log records"
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'jobs' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'skills' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Skill Taxonomy ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'audit' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'ai' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          AI Usage & Cost
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">User Governance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4"><Badge variant={u.role === 'admin' ? 'purple' : 'indigo'} size="sm">{u.role}</Badge></td>
                    <td className="py-3 px-4 text-slate-600">{u.target_role || 'Not set'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${u.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {u.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u.id)}
                          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
                        >
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: JOBS */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Job Catalog Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Work Mode</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{j.title}</td>
                    <td className="py-3 px-4 text-indigo-600 font-medium">{j.company}</td>
                    <td className="py-3 px-4"><Badge variant="slate" size="sm">{j.work_type}</Badge></td>
                    <td className="py-3 px-4 text-slate-600">${j.salary_min?.toLocaleString()} - ${j.salary_max?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteJob(j.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="Remove Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Global Skill Taxonomy</h2>
            <Button onClick={() => setNewSkillModal(true)} variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Catalog Skill
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {skills.map((s) => (
              <div key={s.id} className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{s.name}</span>
                  <span className="text-[10px] text-slate-500">{s.category}</span>
                </div>
                <button
                  onClick={() => handleDeleteSkill(s.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Security Audit Trail</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 font-sans">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-500">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-700">{l.action}</td>
                    <td className="py-2.5 px-4 text-slate-700">{l.entity_type || 'system'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{l.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AI USAGE */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">AI Model Usage & Estimated Cost</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Tokens</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Est. Cost</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aiUsage.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.endpoint}</td>
                    <td className="py-3 px-4"><Badge variant="indigo" size="sm">{u.provider}</Badge></td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{u.total_tokens} tokens</td>
                    <td className="py-3 px-4 text-slate-500">{u.latency_ms} ms</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">${u.estimated_cost?.toFixed(6)}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(u.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD SKILL MODAL --- */}
      <Modal isOpen={newSkillModal} onClose={() => setNewSkillModal(false)} title="Add Global Catalog Skill">
        <form onSubmit={handleAddSkill} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name</label>
            <input
              type="text"
              required
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="e.g. Terraform"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            >
              <option value="Programming">Programming</option>
              <option value="Cloud">Cloud</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Databases">Databases</option>
              <option value="DevOps">DevOps</option>
              <option value="Data/AI">Data / AI</option>
              <option value="Tools">Tools</option>
              <option value="Soft Skills">Soft Skills</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              placeholder="Infrastructure as Code tool"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
            Create Skill
          </Button>
        </form>
      </Modal>
    </div>
  );
};
