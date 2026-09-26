import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ResumesPage } from '../pages/ResumesPage';
import { ResumeAnalysisPage } from '../pages/ResumeAnalysisPage';
import { JobSearchPage } from '../pages/JobSearchPage';
import { JobAnalyzerPage } from '../pages/JobAnalyzerPage';
import { MatchAnalysisPage } from '../pages/MatchAnalysisPage';
import { SkillGapsPage } from '../pages/SkillGapsPage';
import { ApplicationsPage } from '../pages/ApplicationsPage';
import { InterviewsPage } from '../pages/InterviewsPage';
import { CoverLetterPage } from '../pages/CoverLetterPage';
import { EmailGeneratorPage } from '../pages/EmailGeneratorPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Verifying session...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Verifying administrator authorization...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Authenticated Dashboard Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="resumes" element={<ResumesPage />} />
        <Route path="resumes/:resumeId/analysis" element={<ResumeAnalysisPage />} />
        <Route path="jobs" element={<JobSearchPage />} />
        <Route path="job-analyzer" element={<JobAnalyzerPage />} />
        <Route path="matches" element={<MatchAnalysisPage />} />
        <Route path="skill-gaps" element={<SkillGapsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="cover-letter" element={<CoverLetterPage />} />
        <Route path="email-generator" element={<EmailGeneratorPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin Portal Pages */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
