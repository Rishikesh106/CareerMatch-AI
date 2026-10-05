import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Briefcase, MapPin, DollarSign, Sparkles,
  Bookmark, CheckCircle2, Filter, ExternalLink, Calendar,
  Check, Building, ShieldCheck
} from 'lucide-react';
import { api } from '../api/client';
import { Job } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const JobSearchPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [workType, setWorkType] = useState('All');
  const [employmentType, setEmploymentType] = useState('All');
  const [experienceLevel, setExperienceLevel] = useState('All');
  const [domain, setDomain] = useState('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (workType !== 'All') params.work_type = workType;
      if (employmentType !== 'All') params.employment_type = employmentType;
      if (experienceLevel !== 'All') params.experience_level = experienceLevel;
      if (domain !== 'All') params.domain = domain;
      const data = await api.jobs.list(params);
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, workType, employmentType, experienceLevel, domain]);

  const handleApply = async (job: Job) => {
    setApplyingJobId(job.id);
    try {
      await api.jobs.apply(job.id);
      setAppliedJobs((prev) => ({ ...prev, [job.id]: true }));
      const targetUrl = job.job_url || `https://careers.google.com/jobs/results/?q=${encodeURIComponent(job.title)}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert(err.message || 'Failed to log application');
      if (job.job_url) window.open(job.job_url, '_blank', 'noopener,noreferrer');
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleSaveToTracker = async (job: Job) => {
    setSavingJobId(job.id);
    try {
      await api.applications.create({
        job_id: job.id,
        job_title: job.title,
        company: job.company,
        status: 'Saved',
        notes: `Saved from Job Search. Salary: $${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`,
        match_score: 85
      });
      setSavedSuccess(job.id);
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to save job');
    } finally {
      setSavingJobId(null);
    }
  };

  const handleMatchJob = (job: Job) => {
    navigate('/dashboard/matches', { state: { job_id: job.id, job_title: job.title, company: job.company } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Search & Direct Apply</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore verified openings across Cybersecurity & Engineering, check your resume fit, and apply directly to company career portals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/dashboard/resumes')}
            variant="outline"
            size="sm"
            leftIcon={<Briefcase className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Match from My Resumes
          </Button>

          <Button
            onClick={() => navigate('/dashboard/job-analyzer')}
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Analyze Custom JD
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title, company (CrowdStrike, Palo Alto, Microsoft...), or skill (Wireshark, Python, VAPT...)"
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Domain Filter */}
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Domains</option>
            <option value="Cybersecurity">🛡️ Cybersecurity</option>
            <option value="Software Engineering">💻 Software Engineering</option>
            <option value="Cloud & DevOps">☁️ Cloud & DevOps</option>
            <option value="Data & AI">🤖 Data & AI</option>
          </select>

          {/* Experience Level Filter (Fresher vs Experienced) */}
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Experience Levels</option>
            <option value="Fresher">🎓 Fresher / Entry-Level (0-1 yrs)</option>
            <option value="Mid-level">💼 Mid-level (2-4 yrs)</option>
            <option value="Senior">🚀 Senior (4+ yrs)</option>
          </select>

          {/* Work Mode */}
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          {/* Employment Type */}
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Employment Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Searching openings...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No matching jobs found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{job.company}</span>
                      {job.experience_level.toLowerCase().includes('fresher') || job.experience_level.toLowerCase().includes('entry') ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Fresher Friendly
                        </span>
                      ) : null}
                    </div>
                    <h3
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer mt-0.5"
                      onClick={() => { setSelectedJob(job); setDetailsModal(true); }}
                    >
                      {job.title}
                    </h3>
                  </div>

                  <Badge variant={job.work_type === 'Remote' ? 'emerald' : job.work_type === 'Hybrid' ? 'indigo' : 'slate'} size="sm">
                    {job.work_type}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                  {job.salary_min && (
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}</span>
                  )}
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.experience_level}</span>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.required_skills?.slice(0, 5).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                  {(job.required_skills?.length || 0) > 5 && (
                    <span className="text-[11px] text-slate-400 self-center">
                      +{job.required_skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleApply(job)}
                    disabled={applyingJobId === job.id}
                    variant={appliedJobs[job.id] ? "outline" : "primary"}
                    size="sm"
                    className={appliedJobs[job.id] ? "border-emerald-300 text-emerald-700 bg-emerald-50/50" : ""}
                    leftIcon={appliedJobs[job.id] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  >
                    {appliedJobs[job.id] ? 'Applied & Tracked!' : applyingJobId === job.id ? 'Opening Portal...' : 'Apply on Company Site'}
                  </Button>

                  <Button
                    onClick={() => handleMatchJob(job)}
                    variant="ghost"
                    size="sm"
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                  >
                    Match Fit
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => handleSaveToTracker(job)}
                    variant="ghost"
                    size="sm"
                    disabled={savingJobId === job.id}
                    leftIcon={savedSuccess === job.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-400" />}
                  >
                    {savedSuccess === job.id ? 'Saved!' : 'Save'}
                  </Button>

                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title="Direct company career page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- JOB DETAILS MODAL --- */}
      <Modal
        isOpen={detailsModal}
        onClose={() => setDetailsModal(false)}
        title={selectedJob?.title || 'Job Details'}
        subtitle={`${selectedJob?.company} • ${selectedJob?.location} (${selectedJob?.work_type})`}
        maxWidth="2xl"
      >
        {selectedJob && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
              <Badge variant="indigo" size="sm">{selectedJob.employment_type}</Badge>
              {selectedJob.salary_min && (
                <Badge variant="emerald" size="sm">${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max?.toLocaleString()}</Badge>
              )}
              <Badge variant="slate" size="sm">Level: {selectedJob.experience_level}</Badge>
              {selectedJob.experience_requirement && (
                <Badge variant="slate" size="sm">Req Exp: {selectedJob.experience_requirement}</Badge>
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">About the Role</h4>
              <p className="whitespace-pre-line leading-relaxed">{selectedJob.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.required_skills?.map((s) => (
                  <Badge key={s} variant="indigo" size="sm">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Preferred Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.preferred_skills?.map((s) => (
                  <Badge key={s} variant="slate" size="sm">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Education Prerequisite</h4>
              <p>{selectedJob.education_requirement}</p>
            </div>

            {selectedJob.job_url && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 flex items-center justify-between">
                <span>Official Careers Portal:</span>
                <a
                  href={selectedJob.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>{selectedJob.company} Careers</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button onClick={() => setDetailsModal(false)} variant="outline" size="sm">
                Close
              </Button>

              <Button
                onClick={() => {
                  setDetailsModal(false);
                  handleApply(selectedJob);
                }}
                variant="primary"
                size="sm"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Apply on Official Site
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
