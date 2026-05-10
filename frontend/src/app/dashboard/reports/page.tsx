"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend
} from "recharts";
import {
  Loader2, FileText, Download, FileSpreadsheet, MapPin,
  TrendingUp, Zap, Building2, BarChart3, RefreshCw
} from "lucide-react";

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#84cc16"];

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    account.get().catch(() => router.push("/login"));
    fetchSummary();
  }, [router]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://knowvation.onrender.com/reports/summary");
      if (res.ok) setSummary(await res.json());
    } catch {}
    setLoading(false);
  };

  const downloadFile = async (format: "csv" | "excel") => {
    setDownloading(format);
    try {
      const endpoint = format === "csv" ? "/reports/export/csv" : "/reports/export/excel";
      const res = await fetch(`https://knowvation.onrender.com${endpoint}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = format === "csv" ? "knowvation_jobs_report.csv" : "knowvation_report.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {}
    setDownloading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const skillData = (summary?.skill_demand || []).map(([name, count]: any) => ({ name, count }));
  const locationData = (summary?.location_demand || []).map(([name, value]: any) => ({ name, value }));
  const companyData = (summary?.company_frequency || []).map(([name, count]: any) => ({ name, count }));
  const trendData = Object.entries(summary?.trend_distribution || {}).map(([name, value]) => ({ name, value }));

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
            </div>
            <p className="text-gray-400">In-depth hiring intelligence reports with export options</p>
          </div>
          <button onClick={fetchSummary} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {!summary || summary.total_jobs === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No data yet. Run the scraper from the Admin panel first!</p>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Jobs Analyzed", value: summary.total_jobs, icon: FileText, color: "text-purple-400" },
                { label: "Unique Skills Found", value: summary.skill_demand?.length || 0, icon: Zap, color: "text-yellow-400" },
                { label: "Locations Covered", value: summary.location_demand?.length || 0, icon: MapPin, color: "text-green-400" },
                { label: "Avg Intelligence Score", value: `${summary.avg_score}/100`, icon: TrendingUp, color: "text-cyan-400" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <kpi.icon className={`w-6 h-6 mb-3 ${kpi.color}`} />
                  <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-4 mb-8 p-5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm mb-1">Export Full Report</p>
                <p className="text-xs text-gray-500">Download all analyzed jobs with HR contact data and AI insights</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => downloadFile("csv")}
                  disabled={downloading === "csv"}
                  className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-sm transition-all"
                >
                  {downloading === "csv" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  CSV
                </button>
                <button
                  onClick={() => downloadFile("excel")}
                  disabled={downloading === "excel"}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-sm transition-all"
                >
                  {downloading === "excel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  Excel
                </button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Skill Demand */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> Skill Demand Analytics
                </h2>
                <p className="text-gray-500 text-xs mb-4">Top in-demand technical skills across all jobs</p>
                {skillData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={skillData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "#d1d5db", fontSize: 11 }} width={85} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {skillData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-600 text-center py-16">No skill data yet</p>}
              </div>

              {/* Location Based Analysis */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-400" /> Location-Based Analysis
                </h2>
                <p className="text-gray-500 text-xs mb-4">Which cities have the most job openings?</p>
                {locationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={locationData} cx="50%" cy="50%" outerRadius={100}
                        dataKey="value" nameKey="name"
                        label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {locationData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No location data yet. Add job locations in Admin panel.</p>
                  </div>
                )}
              </div>

              {/* Company Hiring Frequency */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" /> Company Hiring Frequency
                </h2>
                <p className="text-gray-500 text-xs mb-4">How many jobs each company is actively hiring for</p>
                {companyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={companyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {companyData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-600 text-center py-16">No company data yet</p>}
              </div>

              {/* Technology Demand Trend */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" /> Hiring Trend Distribution
                </h2>
                <p className="text-gray-500 text-xs mb-4">Breakdown of hiring activity levels across companies</p>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={trendData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                        dataKey="value" nameKey="name"
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trendData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-600 text-center py-16">No trend data yet</p>}
              </div>

            </div>

            {/* Skill Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> Full Skill Demand Table
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-left">
                      <th className="pb-3 font-semibold">Rank</th>
                      <th className="pb-3 font-semibold">Skill</th>
                      <th className="pb-3 font-semibold">Job Mentions</th>
                      <th className="pb-3 font-semibold">Demand Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillData.map((skill: any, i: number) => (
                      <tr key={skill.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 text-gray-500 font-mono">#{i + 1}</td>
                        <td className="py-3 font-medium text-white">{skill.name}</td>
                        <td className="py-3 text-purple-400 font-bold">{skill.count}</td>
                        <td className="py-3">
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                              style={{ width: `${(skill.count / (skillData[0]?.count || 1)) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
