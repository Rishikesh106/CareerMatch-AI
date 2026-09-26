import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Upload, Trash2, Download, Star, CheckCircle2,
  AlertCircle, Sparkles, FileCode, Clock, Eye
} from 'lucide-react';
import { api } from '../api/client';
import { Resume } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const ResumesPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const data = await api.resumes.list();
      setResumes(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.resumes.upload(formData);
      fetchResumes();
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await api.resumes.setPrimary(id);
      fetchResumes();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.resumes.delete(id);
      fetchResumes();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload, parse, and analyze your master and customized resume versions.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Parsing Resume...' : 'Upload PDF or DOCX'}</span>
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200/80 p-8 text-center hover:border-indigo-400 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Upload your resume to extract profile data</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Supports PDF and DOCX files up to 10MB. Text, contact details, work history, and technical skills are extracted automatically.
        </p>
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Uploaded Resumes ({resumes.length})</h2>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">You haven't uploaded a resume yet.</h3>
            <p className="text-xs text-slate-500 mt-1">Upload your first resume to unlock AI matching and keyword optimization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  resume.is_primary ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{resume.file_name}</h4>
                        <p className="text-[11px] text-slate-400">
                          {(resume.file_size / 1024).toFixed(1)} KB • v{resume.version} • {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {resume.is_primary ? (
                      <Badge variant="indigo" size="sm">Primary</Badge>
                    ) : (
                      <button
                        onClick={() => handleSetPrimary(resume.id)}
                        title="Set as Master Resume"
                        className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>

                  {/* Confidence Note */}
                  {resume.confidence_score < 0.7 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>Some information could not be confidently extracted. Please review your profile.</span>
                    </div>
                  )}

                  {/* Parsed Snippet */}
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                    {resume.parsed_text?.slice(0, 150) || 'Text extracted successfully.'}...
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate(`/dashboard/resumes/${resume.id}/analysis`)}
                      variant="primary"
                      size="sm"
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      AI Analysis
                    </Button>
                    <Button
                      onClick={() => { setSelectedResume(resume); setViewModal(true); }}
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View Text
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/resumes/${resume.id}/download`}
                      download
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- VIEW PARSED RESUME MODAL --- */}
      <Modal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        title={selectedResume?.file_name || 'Parsed Resume Details'}
        subtitle={`Extraction Confidence: ${Math.round((selectedResume?.confidence_score || 0.85) * 100)}%`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 max-h-96 overflow-y-auto">
            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {selectedResume?.parsed_text || 'No text extracted.'}
            </pre>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setViewModal(false)} variant="primary" size="sm">
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
