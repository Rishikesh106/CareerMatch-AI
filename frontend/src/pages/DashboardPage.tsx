import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Briefcase, Calendar, Award, Sparkles,
  ArrowRight, CheckCircle2, AlertTriangle, TrendingUp,
  BarChart2, ShieldCheck, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.analytics.getDashboardSummary()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading candidate career analytics...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const statusDist = data?.status_distribution || [];
  const timeline = data?.timeline_data || [];
  const matchDist = data?.match_distribution || [];
  const actions = data?.recommended_actions || [];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <Badge variant="indigo" size="sm">Verified Candidate</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Targeting <span className="font-semibold text-slate-800">{user?.target_role || 'Software Engineering'}</span> roles • {metrics.total_applications} active applications tracked
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => navigate('/dashboard/job-analyzer')}
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Analyze Job (JD)
          </Button>
          <Button
            onClick={() => navigate('/dashboard/jobs')}
            variant="primary"
            size="sm"
            leftIcon={<Briefcase className="w-3.5 h-3.5" />}
          >
            Search Openings
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={metrics.total_applications || 0}
          subtitle={`${metrics.saved_jobs || 0} saved roles`}
          icon={Briefcase}
          trend="+2 this month"
          trendPositive={true}
          color="indigo"
        />
        <StatCard
          title="Interviews"
          value={metrics.interviews || 0}
          subtitle={`${metrics.conversion_rate || 0}% conversion rate`}
          icon={Calendar}
          trend="Upcoming: Sep 28"
          trendPositive={true}
          color="amber"
        />
        <StatCard
          title="Average Fit Score"
          value={`${metrics.average_match_score || 82}%`}
          subtitle="Across matched roles"
          icon={Sparkles}
          trend="High alignment"
          trendPositive={true}
          color="emerald"
        />
        <StatCard
          title="Resume Health"
          value={`${metrics.resume_health || 86}/100`}
          subtitle="Quantification & keywords"
          icon={FileText}
          trend="Master active"
          trendPositive={true}
          color="sky"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Timeline Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Application Velocity & Pipeline Trend</h2>
              <p className="text-xs text-slate-500">Applications submitted vs interview milestones</p>
            </div>
            <Badge variant="slate" size="sm">Last 5 Months</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="applied" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApplied)" name="Applied" />
                <Area type="monotone" dataKey="interviews" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} name="Interviews" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Status Distribution</h2>
              <span className="text-xs font-semibold text-slate-400">Kanban</span>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDist}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDist.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {statusDist.map((s: any) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 truncate">{s.name}:</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Action Cards & Match Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recommended Next Actions</h2>
              <p className="text-xs text-slate-500">AI-curated steps to boost application outcomes</p>
            </div>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="space-y-3">
            {actions.map((act: any) => (
              <div
                key={act.id}
                onClick={() => navigate(act.link)}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {act.title}
                      </span>
                      <Badge variant={act.priority === 'Critical' ? 'rose' : act.priority === 'High' ? 'amber' : 'slate'} size="sm">
                        {act.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completeness & Quick Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Profile Health</h2>
            <p className="text-xs text-slate-500 mb-4">Completeness determines semantic match fidelity</p>
            
            <ProgressBar value={metrics.profile_completeness || 90} color="auto" label="Candidate Profile Completeness" />

            <div className="mt-6 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span>Verified Skills</span>
                <span className="font-semibold text-slate-900">13 Skills</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span>Active Resumes</span>
                <span className="font-semibold text-slate-900">1 Primary</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span>Degree & Certs</span>
                <span className="font-semibold text-slate-900">B.S. + AWS SAA</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate('/dashboard/profile')}
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            Manage Complete Profile
          </Button>
        </div>
      </div>
    </div>
  );
};
