"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import {
  Loader2, Brain, TrendingUp, Users, Star, Briefcase,
  Zap, MapPin, Shield, BarChart3, ArrowRight
} from "lucide-react";

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#84cc16"];

const TREND_COLORS: Record<string, string> = {
  Aggressive: "#10b981",
  Moderate:   "#06b6d4",
  Steady:     "#f59e0b",
  Freeze:     "#ef4444",
  Unknown:    "#6b7280",
};

function KpiCard({ icon: Icon, label, value, color, href }: any) {
  const inner = (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      {href && <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors shrink-0" />}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const [jobs, setJobs]           = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const router = useRouter();

  useEffect(() => {
    account.get().catch(() => router.push("/login"));
    Promise.all([
      fetch("https://knowvation.onrender.com/analytics/jobs").then(r => r.ok ? r.json() : []),
      fetch("https://knowvation.onrender.com/admin/recruiters").then(r => r.ok ? r.json() : []),
    ]).then(([jobsData, recruitersData]) => {
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setRecruiters(Array.isArray(recruitersData) ? recruitersData : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  // ── Derived analytics ──────────────────────────────────────────────────────
  const totalJobs     = jobs.length;
  const avgScore      = jobs.length > 0
    ? Math.round(jobs.reduce((s, j) => s + (j.intelligence_score || 0), 0) / jobs.length) : 0;
  const uniqueCompanies = new Set(jobs.map(j => j.company).filter(c => c && c !== "—")).size;
  const topTrend      = (() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => { counts[j.hiring_trend] = (counts[j.hiring_trend] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  })();

  // Trend distribution pie
  const trendData = (() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => { counts[j.hiring_trend || "Unknown"] = (counts[j.hiring_trend || "Unknown"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Top skills bar
  const skillsData = (() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => (j.skills || []).forEach((s: string) => { counts[s] = (counts[s] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  })();

  // Intelligence score area
  const scoreData = jobs.map((j, i) => ({
    name: (j.role || `Job ${i + 1}`).replace("⚠️ AI Quota Exceeded", "Pending").substring(0, 15),
    score: j.intelligence_score || 0,
  }));

  // Company frequency
  const companyData = (() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      const c = j.company || "Unknown";
      if (c !== "—") counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Location demand
  const locationData = (() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      const loc = (j.location || "").trim();
      if (loc) counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Hiring Intelligence Dashboard
            </h1>
          </div>
          <p className="text-gray-400">Real-time AI-powered recruitment analytics · Phase 3 Complete</p>
        </div>

        {/* No data warning */}
        {jobs.length === 0 && (
          <div className="p-6 mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-300 text-center">
            <p className="font-bold text-lg mb-1">No analyzed jobs found</p>
            <p className="text-sm">Go to the <Link href="/admin" className="underline">Admin Dashboard</Link> → add jobs with HR info → Run the Playwright Scraper.</p>
          </div>
        )}

        {/* KPI Cards — now with links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <KpiCard icon={Briefcase} label="Total Jobs" value={totalJobs} color="bg-purple-600" />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <KpiCard icon={Star} label="Avg AI Score" value={`${avgScore}/100`} color="bg-cyan-600" />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <KpiCard icon={Users} label="Companies" value={uniqueCompanies} color="bg-green-600" />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <KpiCard icon={TrendingUp} label="Dominant Trend" value={topTrend} color="bg-yellow-600" />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <KpiCard icon={Shield} label="HR Contacts" value={recruiters.length} color="bg-cyan-700" href="/dashboard/recruiters" />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <KpiCard icon={BarChart3} label="View Reports" value="Export →" color="bg-orange-600" href="/dashboard/reports" />
          </div>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { href: "/dashboard/recruiters", label: "Recruiter Directory", desc: "Browse all HR contacts stored in the system", icon: Shield, color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", icon_color: "text-cyan-400" },
            { href: "/dashboard/reports",    label: "Reports & Export",    desc: "Download CSV / Excel reports with full data", icon: BarChart3, color: "from-yellow-500/20 to-yellow-500/5", border: "border-yellow-500/30", icon_color: "text-yellow-400" },
            { href: "/admin",               label: "Add Job Sources",     desc: "Add new jobs with HR intel to the pipeline", icon: Briefcase, color: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/30", icon_color: "text-purple-400" },
          ].map((card) => (
            <Link key={card.href} href={card.href}>
              <div className={`p-5 bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer group`}>
                <card.icon className={`w-6 h-6 ${card.icon_color} mb-3`} />
                <p className="font-bold text-white">{card.label}</p>
                <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
                <ArrowRight className={`w-4 h-4 ${card.icon_color} mt-3 group-hover:translate-x-1 transition-transform`} />
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Row 1: Trend + Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" /> Hiring Trend Distribution
            </h2>
            <p className="text-gray-500 text-xs mb-4">How active is hiring across all scraped jobs?</p>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={trendData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}>
                    {trendData.map((entry, i) => (
                      <Cell key={i} fill={TREND_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-600 text-center py-16">No data yet</p>}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Top In-Demand Skills
            </h2>
            <p className="text-gray-500 text-xs mb-4">Skills appearing most across all job descriptions</p>
            {skillsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={skillsData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#d1d5db", fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {skillsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-600 text-center py-16">No skills data yet</p>}
          </div>
        </div>

        {/* Charts Row 2: Score + Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" /> Intelligence Score per Job
            </h2>
            <p className="text-gray-500 text-xs mb-4">AI confidence score for each analyzed job (0-100)</p>
            {scoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={scoreData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#scoreGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-600 text-center py-16">No score data yet</p>}
          </div>

          {/* NEW: Location-based chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" /> Hiring by Location
            </h2>
            <p className="text-gray-500 text-xs mb-4">Top cities / regions with active job postings</p>
            {locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] text-gray-600">
                <MapPin className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">No location data yet.</p>
                <p className="text-xs mt-1">Add Hiring Location when creating jobs in Admin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Companies bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" /> Jobs by Company
          </h2>
          <p className="text-gray-500 text-xs mb-4">Which companies are hiring the most?</p>
          {companyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {companyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-600 text-center py-8">No company data yet</p>}
        </div>

        {/* Jobs Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" /> All Analyzed Jobs
            </h2>
            <Link href="/dashboard/reports">
              <span className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors">
                <BarChart3 className="w-3 h-3" /> Full Reports & Export
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-left">
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Skills</th>
                  <th className="pb-3 font-semibold">Experience</th>
                  <th className="pb-3 font-semibold">Trend</th>
                  <th className="pb-3 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => (
                  <tr key={job.$id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                    <td className="py-3 text-white font-medium">{job.role}</td>
                    <td className="py-3 text-gray-300">{job.company}</td>
                    <td className="py-3 text-gray-400 text-xs">
                      {job.location ? (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-green-400" />{job.location}</span>
                      ) : "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {(job.skills || []).slice(0, 3).map((s: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-md">{s}</span>
                        ))}
                        {(job.skills || []).length > 3 && (
                          <span className="text-gray-500 text-xs">+{job.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{job.experience}</td>
                    <td className="py-3">
                      <span style={{ color: TREND_COLORS[job.hiring_trend] || "#9ca3af" }} className="font-medium">
                        {job.hiring_trend}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`font-bold ${job.intelligence_score >= 70 ? "text-green-400" : job.intelligence_score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                        {job.intelligence_score}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.length === 0 && <p className="text-gray-600 text-center py-8">No jobs to display</p>}
          </div>
        </div>

      </div>
    </main>
  );
}
