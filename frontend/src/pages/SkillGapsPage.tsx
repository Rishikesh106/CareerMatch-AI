import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, BookOpen, Layers, CheckCircle2, ArrowRight,
  Sparkles, ExternalLink, ShieldAlert
} from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SkillGapsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.matches.getSkillGapsSummary()
      .then((res) => setData(res))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Synthesizing skill gap analysis...</div>;
  }

  const categorized = data?.categorized_gaps || {};
  const categories = ['All', ...Object.keys(categorized)];
  const learningPaths = data?.learning_paths || [];

  const displayedGaps = activeCategory === 'All'
    ? data?.top_missing_skills || []
    : categorized[activeCategory] || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skill Gap Analysis & Roadmap</h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated missing competencies across target roles with structured learning paths.
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/jobs')}
          variant="outline"
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
        >
          Match More Roles
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 uppercase">Target Skills</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data?.total_skills_required || 12}</p>
          <span className="text-[11px] text-slate-400">Analyzed across pipeline</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-emerald-50/20">
          <span className="text-xs font-semibold text-emerald-700 uppercase">Verified Matches</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{data?.matched_count || 8}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Clear profile evidence</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-amber-50/20">
          <span className="text-xs font-semibold text-amber-700 uppercase">Partial Matches</span>
          <p className="text-2xl font-bold text-amber-800 mt-1">{data?.partial_count || 1}</p>
          <span className="text-[11px] text-amber-600 font-medium">Related experience found</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-100 bg-rose-50/20">
          <span className="text-xs font-semibold text-rose-700 uppercase">Missing Evidence</span>
          <p className="text-2xl font-bold text-rose-800 mt-1">{data?.missing_count || 3}</p>
          <span className="text-[11px] text-rose-600 font-medium">Roadmaps recommended</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skill Gap Table / Cards (Section 16) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Missing Competency Evidence</h2>

        {displayedGaps.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No missing skills in this category!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Skill</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Match Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Candidate Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedGaps.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.skill}</td>
                    <td className="py-3.5 px-4"><Badge variant="slate" size="sm">{item.category}</Badge></td>
                    <td className="py-3.5 px-4">
                      <Badge variant="rose" size="sm">! No Evidence Found</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold ${item.priority === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic">
                      "No evidence found in your current profile."
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actionable Learning Paths & Projects */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Recommended Actionable Learning Roadmaps
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Practical steps and portfolio projects designed to demonstrate tangible evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPaths.map((lp: any, idx: number) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{lp.missing_skill}</h3>
                  <Badge variant="indigo" size="sm">{lp.category}</Badge>
                </div>

                <div className="space-y-1.5 my-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Action Steps:
                  </span>
                  <ol className="space-y-1 text-xs text-slate-600 list-decimal list-inside">
                    {lp.steps?.map((step: string, sIdx: number) => (
                      <li key={sIdx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>

                {lp.recommended_project && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 mt-2">
                    <span className="font-bold block mb-0.5">Recommended Project to Build:</span>
                    <span>{lp.recommended_project}</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 mt-4 italic">
                {lp.disclaimer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
