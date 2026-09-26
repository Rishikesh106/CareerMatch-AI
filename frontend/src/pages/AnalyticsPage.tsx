import React, { useState, useEffect } from 'react';
import {
  PieChart as PieChartIcon, TrendingUp, Award, Calendar,
  BarChart2, Filter, Layers, ArrowDown
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { api } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    api.analytics.getDashboardSummary()
      .then((res) => setData(res))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Computing analytics...</div>;
  }

  const metrics = data?.metrics || {};
  const funnel = data?.funnel || [];
  const matchDist = data?.match_distribution || [];
  const timeline = data?.timeline_data || [];
  const statusDist = data?.status_distribution || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Date Range Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Career Analytics & Conversion Funnel</h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven insights on your job search velocity, screening rates, and match score distribution.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateRange === range
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Interview Conversion"
          value={`${metrics.conversion_rate || 20}%`}
          subtitle="Applied → Interview milestone"
          icon={TrendingUp}
          trend="+4.2% vs avg"
          trendPositive={true}
          color="indigo"
        />
        <StatCard
          title="Average Fit Score"
          value={`${metrics.average_match_score || 82}%`}
          subtitle="Across all target roles"
          icon={Award}
          trend="Top decile"
          trendPositive={true}
          color="emerald"
        />
        <StatCard
          title="Total Submissions"
          value={metrics.total_applications || 0}
          subtitle="Active pipeline count"
          icon={Calendar}
          color="sky"
        />
        <StatCard
          title="Offer Rate"
          value={`${metrics.offers || 0} Offers`}
          subtitle="Formal compensation packages"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Application Funnel</h2>
              <p className="text-xs text-slate-500">Stage-by-stage candidate progression</p>
            </div>
            <Badge variant="indigo" size="sm">Funnel Stages</Badge>
          </div>

          <div className="space-y-3 pt-2">
            {funnel.map((step: any, idx: number) => {
              const maxCount = Math.max(1, funnel[0]?.count || 1);
              const pct = Math.round((step.count / maxCount) * 100);

              return (
                <div key={step.stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{step.stage}</span>
                    <span>{step.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Match Score Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Match Score Distribution</h2>
              <p className="text-xs text-slate-500">How your profile rates against evaluated positions</p>
            </div>
            <Badge variant="emerald" size="sm">Score Bands</Badge>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Roles Evaluated" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Timeline Trend Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Career Velocity Over Time</h2>
            <p className="text-xs text-slate-500">Submissions, active screenings, and interview calls</p>
          </div>
          <Badge variant="slate" size="sm">Pipeline Momentum</Badge>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="appliedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="applied" stroke="#6366f1" fill="url(#appliedGrad)" strokeWidth={2.5} name="Applications" />
              <Area type="monotone" dataKey="interviews" stroke="#f59e0b" fill="transparent" strokeWidth={2} name="Interviews Scheduled" />
              <Area type="monotone" dataKey="offers" stroke="#10b981" fill="transparent" strokeWidth={2} name="Offers Received" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
