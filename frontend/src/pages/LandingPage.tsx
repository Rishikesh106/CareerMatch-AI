import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, FileText,
  Search, BarChart3, AlertCircle, Kanban, Brain, Lock,
  ChevronDown, Cpu, Layers, HelpCircle, Star, Award
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoCandidate, isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does CareerMatch AI compute the match score?',
      a: 'Unlike black-box AI tools, our engine decomposes job matching into transparent, explainable components: Verified Skills Alignment, Years of Experience, Project Relevance, Education, and Semantic Similarity. You see exactly why you scored 88% or 54%.'
    },
    {
      q: 'Does CareerMatch AI invent or hallucinate candidate skills?',
      a: 'Never. Our core safety rule mandates that missing skills are explicitly labeled as "No evidence found in your current profile." We will never advise lying or falsifying qualifications on a resume.'
    },
    {
      q: 'Can I upload and manage multiple resume versions?',
      a: 'Yes! You can upload PDF and DOCX formats, compare versions, designate a primary resume for instant matching, and download parsed data anytime.'
    },
    {
      q: 'Is my resume and personal data secure?',
      a: 'We implement strict data isolation, MIME verification, no plaintext secrets, and full GDPR-style data export and account deletion controls.'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* 1. Header / Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">CareerMatch</span>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest block">AI Platform</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#demo-previews" className="hover:text-indigo-600 transition-colors">Platform Preview</a>
          <a href="#technology" className="hover:text-indigo-600 transition-colors">Technology</a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button onClick={() => navigate('/dashboard')} variant="primary" size="sm">
              Open Dashboard
            </Button>
          ) : (
            <>
              <Button onClick={() => navigate('/login')} variant="ghost" size="sm">
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')} variant="primary" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs font-semibold text-indigo-700 mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Explainable Career Intelligence & Semantic Matching</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Know Your Fit <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Before You Apply.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Analyze your resume, understand your skill gaps, discover relevant opportunities, and manage your entire job search in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              onClick={() => {
                if (isAuthenticated) navigate('/dashboard/resumes');
                else loginAsDemoCandidate().then(() => navigate('/dashboard/resumes'));
              }}
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Analyze My Resume (Live Demo)
            </Button>
            <Button
              onClick={() => {
                const el = document.getElementById('demo-previews');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              variant="outline"
              size="lg"
            >
              Explore Features
            </Button>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            No credit card required • Instant demo account preloaded with verified data
          </p>

          {/* Realistic Dashboard Preview Banner */}
          <div className="mt-14 relative max-w-5xl mx-auto rounded-2xl bg-white shadow-2xl border border-slate-200/80 p-3 sm:p-5 overflow-hidden">
            <div className="bg-slate-900 rounded-xl p-4 text-left text-white shadow-inner flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="sm">✓ Verified Match Engine</Badge>
                  <span className="text-xs text-slate-400">Target Role: Full Stack Developer</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Starlight Financial — 88% Match</h3>
                <p className="text-xs text-slate-300">
                  Skills: 92% • Experience: 85% • Projects: 94% • Education: 95% • Semantics: 88%
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <span className="text-2xl font-black text-emerald-400">88%</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Overall Fit</span>
                </div>
                <Button
                  onClick={() => loginAsDemoCandidate().then(() => navigate('/dashboard/matches'))}
                  variant="primary"
                  size="sm"
                >
                  View Breakdown
                </Button>
              </div>
            </div>

            {/* Quick snapshot tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-left">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Resume Health</span>
                <p className="text-xl font-bold text-slate-900 mt-1">86/100</p>
                <span className="text-[10px] text-emerald-600 font-medium">Strong Quantification</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Pipeline</span>
                <p className="text-xl font-bold text-slate-900 mt-1">6 Applications</p>
                <span className="text-[10px] text-indigo-600 font-medium">1 Technical Round</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Identified Gaps</span>
                <p className="text-xl font-bold text-slate-900 mt-1">3 Missing Skills</p>
                <span className="text-[10px] text-amber-600 font-medium">Learning Paths Ready</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Interview Prep</span>
                <p className="text-xl font-bold text-slate-900 mt-1">4 Custom Q&A</p>
                <span className="text-[10px] text-purple-600 font-medium">Role-tailored Guidance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Statement */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="rose" size="md" className="mb-4">The Industry Problem</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            "Candidates often apply to unsuitable jobs without knowing how well their profile matches the role or which skills they are missing."
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
            Job seekers waste hundreds of hours submitting generic resumes into applicant tracking systems (ATS) with zero feedback. Meanwhile, recruiters sift through misaligned profiles. CareerMatch AI solves this by analyzing your verified resume evidence against target roles and guiding you step-by-step to close actual skill gaps.
          </p>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step-by-step</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">How CareerMatch AI Works</h2>
            <p className="text-sm text-slate-500 mt-2">From raw document to targeted interview offer in four transparent steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center mb-4 text-sm">
                01
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Upload & Parse</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Upload your PDF or DOCX resume. Our parser segments work history, education, and extracts verified technical skills with confidence metrics.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 font-bold flex items-center justify-center mb-4 text-sm">
                02
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Select or Paste Job</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Choose from curated tech roles or paste any raw job description. The Job Analyzer extracts required skills, preferred qualifications, and responsibilities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center mb-4 text-sm">
                03
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Explainable Match</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Receive an explainable breakdown: Matched skills ✓, Partial ◐, and missing evidence with practical, recommended learning paths.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-bold flex items-center justify-center mb-4 text-sm">
                04
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Track & Prepare</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Manage your job lifecycle in an interactive Kanban board. Generate tailored cover letters, application emails, and technical interview questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Features Grid */}
      <section id="features" className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">Built for Serious Job Seekers</h2>
            <p className="text-sm text-slate-500 mt-2">Comprehensive tooling to replace dozens of scattered spreadsheets and AI chatbots.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">AI Resume Health & Quality</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Evaluates quantification, action verbs, keyword coverage, and structure. Offers actionable recommendations without falsifying qualifications.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl w-fit mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Explainable Semantic Matching</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Combines cosine embedding similarity with structured skills, experience, project relevance, and education. Full visibility into every metric.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Skill-Gap Learning Paths</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Categorizes missing skills into Cloud, Cybersecurity, DevOps, etc. Suggests realistic project ideas and learning steps to bridge the gap.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Kanban Application Tracker</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Visual pipeline across Saved, Applied, Screening, Interview, Offer, and Rejected stages. Track follow-ups, recruiter contacts, and notes.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-fit mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">AI Interview Simulator Prep</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Generates role-specific, behavioral, and resume-based technical questions. Includes preparation rationale and structured answering strategies.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl w-fit mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Cover Letter & Email Drafters</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Generate tailored outreach letters and follow-up emails grounded purely in verified profile experience with clear verification reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 - 9. Interactive Platform Previews */}
      <section id="demo-previews" className="py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Product Showcase</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">Experience the Platform Live</h2>
            <p className="text-sm text-slate-500 mt-2">See how CareerMatch AI brings clarity to your resume and career trajectory.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="indigo" size="md" className="mb-3">Live Matching Demonstration</Badge>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Transparent Match Scoring with Component Attribution
                </h3>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Instead of guessing how an automated filter evaluated your profile, inspect every individual metric:
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Skills Alignment (Python, TS, React, PostgreSQL, Docker)</span>
                      <span className="font-bold text-slate-900">92%</span>
                    </div>
                    <ProgressBar value={92} color="emerald" showValue={false} />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Experience Alignment (3 years verified)</span>
                      <span className="font-bold text-slate-900">85%</span>
                    </div>
                    <ProgressBar value={85} color="indigo" showValue={false} />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Project Relevance (Distributed Task Orchestrator)</span>
                      <span className="font-bold text-slate-900">94%</span>
                    </div>
                    <ProgressBar value={94} color="emerald" showValue={false} />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Academic & Certification Alignment (UC Berkeley CS + AWS)</span>
                      <span className="font-bold text-slate-900">90%</span>
                    </div>
                    <ProgressBar value={90} color="indigo" showValue={false} />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button onClick={() => loginAsDemoCandidate().then(() => navigate('/dashboard'))} variant="primary">
                    Launch Interactive Demo
                  </Button>
                </div>
              </div>

              {/* Evidence cards */}
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Evidence Breakdown:
                </span>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Skills (6 verified)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Python', 'TypeScript', 'React', 'PostgreSQL', 'Docker', 'REST APIs'].map((s) => (
                      <Badge key={s} variant="emerald" size="sm">✓ {s}</Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Partially Matched (1 found)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="amber" size="sm">◐ AWS (Certificate verified; EC2 details recommended)</Badge>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs mb-1">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span>Missing Skills (No evidence found in profile)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="slate" size="sm">! Tailwind CSS</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    "No evidence found in current profile. Recommended learning path available."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Security & Privacy Section */}
      <section className="py-16 bg-white border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Privacy-First Architecture</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Export your entire candidate profile, resume history, and applications as structured JSON anytime, or permanently purge all data in one click.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Audit-Logged Operations</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Security-sensitive actions such as authentication, resume updates, and profile edits are recorded in persistent audit logs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-violet-50 text-violet-600 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">No Hallucinations Rule</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  AI suggestions are strictly framed as advisory recommendations. Our platform will never claim you possess a skill without verified evidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Technology Stack Section */}
      <section id="technology" className="py-16 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Tech Stack</span>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 font-semibold text-sm">
            <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-600" /> React & TypeScript</span>
            <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-emerald-600" /> FastAPI & Python 3.13</span>
            <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-amber-600" /> PyMuPDF & docx</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sky-600" /> PostgreSQL & Alembic</span>
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-600" /> AI Provider Abstraction</span>
          </div>
        </div>
      </section>

      {/* 12. FAQ Section */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Control of Your Career Path?
          </h2>
          <p className="mt-4 text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
            Join candidates using CareerMatch AI to discover fit scores, close skill gaps, and interview with confidence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => loginAsDemoCandidate().then(() => navigate('/dashboard'))}
              variant="secondary"
              size="lg"
              className="bg-white text-indigo-700 hover:bg-slate-100"
            >
              Try Live Demo (No Signup)
            </Button>
            <Button
              onClick={() => navigate('/register')}
              variant="outline"
              size="lg"
              className="text-white border-white/40 hover:bg-white/10"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">CareerMatch AI</span>
            <span>— AI-Powered Resume & Job Matching Platform</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/dashboard')}>Candidate Demo</span>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/admin')}>Admin Demo</span>
            <span className="text-slate-600">v1.0.0 Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
