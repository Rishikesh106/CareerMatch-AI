import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Briefcase, MapPin, DollarSign, Sparkles,
  Bookmark, CheckCircle2, Filter, ExternalLink, Calendar
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (workType !== 'All') params.work_type = workType;
      if (employmentType !== 'All') params.employment_type = employmentType;
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
  }, [searchQuery, workType, employmentType]);

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
    // Navigate to Match Analysis with preselected job
    navigate('/dashboard/matches', { state: { job_id: job.id, job_title: job.title, company: job.company } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Search & Discovery</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore active openings, check verified skill fit, and save directly to your application tracker.
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/job-analyzer')}
          variant="outline"
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
        >
          Paste Custom Job Description
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, company, or tech keywords (Python, Docker, SIEM...)"
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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

          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Types</option>
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
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search keywords or filter settings.</p>
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
                    <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => { setSelectedJob(job); setDetailsModal(true); }}>
                      {job.title}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{job.company}</p>
                  </div>
                  <Badge variant={job.work_type === 'Remote' ? 'emerald' : job.work_type === 'Hybrid' ? 'indigo' : 'slate'} size="sm">
                    {job.work_type}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.experience_level}</span>
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
                    onClick={() => handleMatchJob(job)}
                    variant="primary"
                    size="sm"
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Match Fit
                  </Button>
                  <Button
                    onClick={() => { setSelectedJob(job); setDetailsModal(true); }}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>

                <Button
                  onClick={() => handleSaveToTracker(job)}
                  variant="ghost"
                  size="sm"
                  disabled={savingJobId === job.id}
                  leftIcon={savedSuccess === job.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                >
                  {savedSuccess === job.id ? 'Saved!' : 'Save'}
                </Button>
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
              <Badge variant="emerald" size="sm">${selectedJob.salary_min?.toLocaleString()} - ${selectedJob.salary_max?.toLocaleString()}</Badge>
              <Badge variant="slate" size="sm">Req Exp: {selectedJob.experience_requirement}</Badge>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button onClick={() => setDetailsModal(false)} variant="outline" size="sm">
                Close
              </Button>
              <Button
                onClick={() => {
                  setDetailsModal(false);
                  handleMatchJob(selectedJob);
                }}
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Match With My Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
