import {
  User, Profile, UserSkill, Education, Experience, Project, Certification,
  Resume, ResumeAnalysis, Job, MatchResponse, Application, Interview,
  Notification, AdminStats
} from '../types';

const rawBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
export const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

class ApiClient {
  private getHeaders(isFormData = false): HeadersInit {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const headers = { ...this.getHeaders(isFormData), ...options.headers };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      // Try refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('access_token', data.access_token);
            // Retry original request
            return this.request<T>(endpoint, options);
          }
        } catch (e) {
          // Token expired or invalid
        }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.detail || 'An unexpected error occurred';
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // --- Auth ---
  auth = {
    login: (body: any) => this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => this.request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => this.request<User>('/auth/me'),
    forgotPassword: (email: string) => this.request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (body: any) => this.request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  };

  // --- Profile ---
  profile = {
    get: () => this.request<{
      user: User;
      profile: Profile;
      skills: UserSkill[];
      educations: Education[];
      experiences: Experience[];
      projects: Project[];
      certifications: Certification[];
    }>('/profile'),
    update: (body: Partial<Profile>) => this.request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(body) }),
    addSkill: (body: any) => this.request<UserSkill>('/profile/skills', { method: 'POST', body: JSON.stringify(body) }),
    deleteSkill: (id: string) => this.request<any>(`/profile/skills/${id}`, { method: 'DELETE' }),
    addEducation: (body: any) => this.request<Education>('/profile/education', { method: 'POST', body: JSON.stringify(body) }),
    deleteEducation: (id: string) => this.request<any>(`/profile/education/${id}`, { method: 'DELETE' }),
    addExperience: (body: any) => this.request<Experience>('/profile/experience', { method: 'POST', body: JSON.stringify(body) }),
    deleteExperience: (id: string) => this.request<any>(`/profile/experience/${id}`, { method: 'DELETE' }),
    addProject: (body: any) => this.request<Project>('/profile/projects', { method: 'POST', body: JSON.stringify(body) }),
    deleteProject: (id: string) => this.request<any>(`/profile/projects/${id}`, { method: 'DELETE' }),
    addCertification: (body: any) => this.request<Certification>('/profile/certifications', { method: 'POST', body: JSON.stringify(body) }),
    deleteCertification: (id: string) => this.request<any>(`/profile/certifications/${id}`, { method: 'DELETE' }),
    exportData: () => this.request<any>('/profile/export-data'),
    deleteAccount: () => this.request<any>('/profile/account', { method: 'DELETE' }),
  };

  // --- Resumes ---
  resumes = {
    list: () => this.request<Resume[]>('/resumes'),
    get: (id: string) => this.request<Resume>(`/resumes/${id}`),
    upload: (formData: FormData) => this.request<Resume>('/resumes/upload', { method: 'POST', body: formData }),
    setPrimary: (id: string) => this.request<any>(`/resumes/${id}/primary`, { method: 'PUT' }),
    delete: (id: string) => this.request<any>(`/resumes/${id}`, { method: 'DELETE' }),
    getAnalysis: (id: string) => this.request<ResumeAnalysis>(`/resumes/${id}/analysis`),
    getCorrections: (id: string) => this.request<any>(`/resumes/${id}/corrections`),
    saveCorrected: (id: string) => this.request<Resume>(`/resumes/${id}/save-corrected`, { method: 'POST' }),
    getMatchedJobs: (id: string) => this.request<any>(`/resumes/${id}/matched-jobs`),
    downloadCorrectedUrl: (id: string) => `${API_BASE}/resumes/${id}/download-corrected`,
  };

  // --- Jobs ---
  jobs = {
    list: (params?: Record<string, any>) => {
      const query = new URLSearchParams(params || {}).toString();
      return this.request<Job[]>(`/jobs${query ? `?${query}` : ''}`);
    },
    get: (id: string) => this.request<Job>(`/jobs/${id}`),
    apply: (id: string) => this.request<any>(`/jobs/${id}/apply`, { method: 'POST' }),
    analyzeJD: (body: { description: string; title?: string; company?: string }) =>
      this.request<any>('/jobs/analyze-jd', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) => this.request<any>(`/jobs/${id}`, { method: 'DELETE' }),
  };

  // --- Matches ---
  matches = {
    compute: (body: { job_id?: string; job_title?: string; company?: string; job_description?: string; resume_id?: string }) =>
      this.request<MatchResponse>('/matches', { method: 'POST', body: JSON.stringify(body) }),
    list: () => this.request<MatchResponse[]>('/matches'),
    get: (id: string) => this.request<MatchResponse>(`/matches/${id}`),
    getSkillGapsSummary: () => this.request<any>('/matches/skill-gaps/summary'),
  };

  // --- Applications ---
  applications = {
    list: (status?: string) => this.request<Application[]>(`/applications${status ? `?status=${status}` : ''}`),
    create: (body: Partial<Application>) => this.request<Application>('/applications', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Application>) => this.request<Application>(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => this.request<any>(`/applications/${id}`, { method: 'DELETE' }),
  };

  // --- Interviews ---
  interviews = {
    list: () => this.request<Interview[]>('/interviews'),
    create: (body: Partial<Interview>) => this.request<Interview>('/interviews', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Interview>) => this.request<Interview>(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => this.request<any>(`/interviews/${id}`, { method: 'DELETE' }),
    generatePrep: (job_title: string, company: string, interview_type = 'Technical') =>
      this.request<any>(`/interviews/prep/generate?job_title=${encodeURIComponent(job_title)}&company=${encodeURIComponent(company)}&interview_type=${encodeURIComponent(interview_type)}`),
  };

  // --- AI Career Tools ---
  aiTools = {
    generateCoverLetter: (body: { job_title: string; company: string; job_description?: string; tone?: string; resume_id?: string }) =>
      this.request<any>('/ai-tools/cover-letter', { method: 'POST', body: JSON.stringify(body) }),
    generateEmail: (body: { job_title: string; company: string; email_type?: string; contact_person?: string; resume_id?: string }) =>
      this.request<any>('/ai-tools/email', { method: 'POST', body: JSON.stringify(body) }),
  };

  // --- Analytics ---
  analytics = {
    getDashboardSummary: () => this.request<any>('/analytics/dashboard-summary'),
  };

  // --- Notifications ---
  notifications = {
    list: () => this.request<Notification[]>('/notifications'),
    markRead: (id: string) => this.request<Notification>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => this.request<any>('/notifications/mark-all-read', { method: 'PUT' }),
  };

  // --- Admin ---
  admin = {
    getStats: () => this.request<AdminStats>('/admin/stats'),
    getUsers: () => this.request<User[]>('/admin/users'),
    toggleUserStatus: (userId: string) => this.request<any>(`/admin/users/${userId}/toggle-status`, { method: 'PUT' }),
    getAuditLogs: () => this.request<any[]>('/admin/audit-logs'),
    getAIUsage: () => this.request<any[]>('/admin/ai-usage'),
    getSkills: () => this.request<any[]>('/admin/skills'),
    createSkill: (body: any) => this.request<any>('/admin/skills', { method: 'POST', body: JSON.stringify(body) }),
    deleteSkill: (id: string) => this.request<any>(`/admin/skills/${id}`, { method: 'DELETE' }),
  };
}

export const api = new ApiClient();
