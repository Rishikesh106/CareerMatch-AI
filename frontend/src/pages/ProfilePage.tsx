import React, { useState, useEffect } from 'react';
import {
  User, Briefcase, GraduationCap, Code2, Award, Plus,
  Trash2, ExternalLink, Download, AlertCircle, Save, CheckCircle2
} from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';

export const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modals for adding items
  const [skillModal, setSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ skill_name: '', category: 'Programming', proficiency: 'Intermediate', years_experience: 1.0 });

  const [expModal, setExpModal] = useState(false);
  const [newExp, setNewExp] = useState({ company: '', role: '', description: '', start_date: '', end_date: '', technologies: '' });

  const [eduModal, setEduModal] = useState(false);
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '' });

  const [projModal, setProjModal] = useState(false);
  const [newProj, setNewProj] = useState({ name: '', description: '', technologies: '', github_url: '', live_url: '' });

  const [certModal, setCertModal] = useState(false);
  const [newCert, setNewCert] = useState({ name: '', issuing_org: '', issue_date: '', credential_url: '' });

  const [deleteModal, setDeleteModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.profile.get();
      setProfileData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.profile.update(profileData.profile);
      setFeedback('Profile successfully updated!');
      setTimeout(() => setFeedback(null), 3000);
      fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.profile.addSkill(newSkill);
      setSkillModal(false);
      setNewSkill({ skill_name: '', category: 'Programming', proficiency: 'Intermediate', years_experience: 1.0 });
      fetchProfile();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    await api.profile.deleteSkill(id);
    fetchProfile();
  };

  const handleAddExp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const techList = newExp.technologies.split(',').map((t) => t.trim()).filter(Boolean);
      await api.profile.addExperience({ ...newExp, technologies: techList });
      setExpModal(false);
      setNewExp({ company: '', role: '', description: '', start_date: '', end_date: '', technologies: '' });
      fetchProfile();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteExp = async (id: string) => {
    await api.profile.deleteExperience(id);
    fetchProfile();
  };

  const handleAddEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.profile.addEducation(newEdu);
      setEduModal(false);
      setNewEdu({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '' });
      fetchProfile();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteEdu = async (id: string) => {
    await api.profile.deleteEducation(id);
    fetchProfile();
  };

  const handleAddProj = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const techList = newProj.technologies.split(',').map((t) => t.trim()).filter(Boolean);
      await api.profile.addProject({ ...newProj, technologies: techList });
      setProjModal(false);
      setNewProj({ name: '', description: '', technologies: '', github_url: '', live_url: '' });
      fetchProfile();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteProj = async (id: string) => {
    await api.profile.deleteProject(id);
    fetchProfile();
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.profile.addCertification(newCert);
      setCertModal(false);
      setNewCert({ name: '', issuing_org: '', issue_date: '', credential_url: '' });
      fetchProfile();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteCert = async (id: string) => {
    await api.profile.deleteCertification(id);
    fetchProfile();
  };

  const handleExportData = async () => {
    try {
      const exportJson = await api.profile.exportData();
      const blob = new Blob([JSON.stringify(exportJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careermatch_data_${profileData.user.email}.json`;
      a.click();
    } catch (e: any) {
      alert('Error exporting data: ' + e.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.profile.deleteAccount();
      window.location.href = '/login';
    } catch (e: any) {
      alert('Error deleting account: ' + e.message);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-500">Loading candidate profile...</div>;
  }

  const { user, profile, skills, educations, experiences, projects, certifications } = profileData;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain verified qualifications, technical competencies, and career preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportData}
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export JSON Data
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Profile Completeness Score */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <ProgressBar
          value={profile?.completeness_score || 85}
          label="Profile Completeness Score (AI Match Reliability)"
          color="auto"
        />
      </div>

      {/* 1. Personal & Career Information Form */}
      <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Personal & Career Preferences
          </h2>
          <Button type="submit" variant="primary" size="sm" isLoading={saving} leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              value={profile?.headline || ''}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, headline: e.target.value } })}
              placeholder="e.g. Full Stack Developer | Python, React, AWS"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
            <input
              type="text"
              value={profile?.target_role || ''}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, target_role: e.target.value } })}
              placeholder="Software Engineer"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={profile?.location || ''}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, location: e.target.value } })}
              placeholder="San Francisco, CA"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={profile?.phone || ''}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, phone: e.target.value } })}
              placeholder="+1 (555) 234-5678"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remote Preference</label>
            <select
              value={profile?.remote_preference || 'Hybrid'}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, remote_preference: e.target.value } })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Salary</label>
            <input
              type="text"
              value={profile?.expected_salary || ''}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, expected_salary: e.target.value } })}
              placeholder="$120,000 - $145,000"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
          <textarea
            rows={3}
            value={profile?.summary || ''}
            onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, summary: e.target.value } })}
            placeholder="Brief overview of your engineering strengths and background..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={profile?.linkedin_url || ''}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, linkedin_url: e.target.value } })}
              placeholder="https://linkedin.com/in/..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
            <input
              type="url"
              value={profile?.github_url || ''}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, github_url: e.target.value } })}
              placeholder="https://github.com/..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio URL</label>
            <input
              type="url"
              value={profile?.portfolio_url || ''}
              onChange={(e) => setProfileData({ ...profileData, profile: { ...profile, portfolio_url: e.target.value } })}
              placeholder="https://..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </form>

      {/* 2. Skills Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" /> Verified Skills ({skills.length})
            </h2>
            <p className="text-xs text-slate-500">Skills extracted from resumes or added manually with proficiency.</p>
          </div>
          <Button onClick={() => setSkillModal(true)} variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Skill
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((s: any) => (
            <div
              key={s.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-900">{s.skill_name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                {s.proficiency} • {s.years_experience}y
              </span>
              <button
                onClick={() => handleDeleteSkill(s.id)}
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Work Experience */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" /> Work Experience ({experiences.length})
            </h2>
          </div>
          <Button onClick={() => setExpModal(true)} variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Position
          </Button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp: any) => (
            <div key={exp.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                  <p className="text-xs text-indigo-600 font-medium">{exp.company} • {exp.start_date || '2022'} - {exp.end_date || 'Present'}</p>
                </div>
                <button
                  onClick={() => handleDeleteExp(exp.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {exp.technologies.map((t: string) => (
                    <Badge key={t} variant="slate" size="sm">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Education & Certifications (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Education
            </h2>
            <Button onClick={() => setEduModal(true)} variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {educations.map((edu: any) => (
              <div key={edu.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{edu.degree} in {edu.field_of_study}</h4>
                  <p className="text-xs text-slate-500">{edu.institution}</p>
                  {edu.gpa && <span className="text-[10px] text-slate-400">GPA: {edu.gpa}</span>}
                </div>
                <button onClick={() => handleDeleteEdu(edu.id)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" /> Certifications
            </h2>
            <Button onClick={() => setCertModal(true)} variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {certifications.map((c: any) => (
              <div key={c.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                  <p className="text-xs text-slate-500">{c.issuing_org} • {c.issue_date || 'Active'}</p>
                </div>
                <button onClick={() => handleDeleteCert(c.id)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Projects Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" /> Technical Projects ({projects.length})
          </h2>
          <Button onClick={() => setProjModal(true)} variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Project
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p: any) => (
            <div key={p.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                  <button onClick={() => handleDeleteProj(p.id)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">{p.description}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.technologies?.map((tech: string) => (
                  <Badge key={tech} variant="indigo" size="sm">{tech}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Account Danger Zone */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-rose-800">Permanently Delete Account</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Purges your candidate profile, uploaded resumes, and application tracking records.
          </p>
        </div>
        <Button onClick={() => setDeleteModal(true)} variant="danger" size="sm">
          Delete Account
        </Button>
      </div>

      {/* --- ADD SKILL MODAL --- */}
      <Modal isOpen={skillModal} onClose={() => setSkillModal(false)} title="Add Technical Skill">
        <form onSubmit={handleAddSkill} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name</label>
            <input
              type="text"
              required
              value={newSkill.skill_name}
              onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
              placeholder="e.g. Kubernetes, Golang, PyTorch"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency</label>
              <select
                value={newSkill.proficiency}
                onChange={(e: any) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Exp</label>
              <input
                type="number"
                step="0.5"
                value={newSkill.years_experience}
                onChange={(e) => setNewSkill({ ...newSkill, years_experience: parseFloat(e.target.value) || 1 })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" size="sm" className="w-full mt-2">Add Skill</Button>
        </form>
      </Modal>

      {/* --- ADD EXPERIENCE MODAL --- */}
      <Modal isOpen={expModal} onClose={() => setExpModal(false)} title="Add Work Experience">
        <form onSubmit={handleAddExp} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Title</label>
            <input
              type="text"
              required
              value={newExp.role}
              onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
              placeholder="Software Engineer"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
            <input
              type="text"
              required
              value={newExp.company}
              onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
              placeholder="Nexora Tech"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Achievements</label>
            <textarea
              rows={3}
              required
              value={newExp.description}
              onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
              placeholder="Engineered microservices, quantified impact..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies (comma separated)</label>
            <input
              type="text"
              value={newExp.technologies}
              onChange={(e) => setNewExp({ ...newExp, technologies: e.target.value })}
              placeholder="Python, FastAPI, Docker, PostgreSQL"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="w-full mt-2">Save Experience</Button>
        </form>
      </Modal>

      {/* --- ADD EDUCATION MODAL --- */}
      <Modal isOpen={eduModal} onClose={() => setEduModal(false)} title="Add Education">
        <form onSubmit={handleAddEdu} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institution</label>
            <input
              type="text"
              required
              value={newEdu.institution}
              onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
              placeholder="University of California, Berkeley"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
              <input
                type="text"
                required
                value={newEdu.degree}
                onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                placeholder="Bachelor of Science"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Field of Study</label>
              <input
                type="text"
                required
                value={newEdu.field_of_study}
                onChange={(e) => setNewEdu({ ...newEdu, field_of_study: e.target.value })}
                placeholder="Computer Science"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" size="sm" className="w-full mt-2">Save Education</Button>
        </form>
      </Modal>

      {/* --- ADD PROJECT MODAL --- */}
      <Modal isOpen={projModal} onClose={() => setProjModal(false)} title="Add Project">
        <form onSubmit={handleAddProj} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={newProj.name}
              onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
              placeholder="Distributed Task Orchestrator"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={newProj.description}
              onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
              placeholder="Built an event-driven task scheduler with Redis and FastAPI..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies (comma separated)</label>
            <input
              type="text"
              value={newProj.technologies}
              onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
              placeholder="Python, React, Redis, Docker"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="w-full mt-2">Save Project</Button>
        </form>
      </Modal>

      {/* --- ADD CERTIFICATION MODAL --- */}
      <Modal isOpen={certModal} onClose={() => setCertModal(false)} title="Add Certification">
        <form onSubmit={handleAddCert} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Certification Name</label>
            <input
              type="text"
              required
              value={newCert.name}
              onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
              placeholder="AWS Certified Solutions Architect"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Organization</label>
            <input
              type="text"
              required
              value={newCert.issuing_org}
              onChange={(e) => setNewCert({ ...newCert, issuing_org: e.target.value })}
              placeholder="Amazon Web Services"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="w-full mt-2">Save Certification</Button>
        </form>
      </Modal>

      {/* --- CONFIRM DELETE MODAL --- */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirm Account Deletion">
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete your account? This action cannot be undone. All your uploaded resumes, parsed history, applications, and match data will be wiped immediately.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setDeleteModal(false)} variant="outline" size="sm">Cancel</Button>
            <Button onClick={handleDeleteAccount} variant="danger" size="sm">Yes, Permanently Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
