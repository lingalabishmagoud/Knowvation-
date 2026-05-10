"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import Navbar from "@/components/Navbar";
import {
  Loader2, User, Mail, Phone, Link2, MapPin,
  Briefcase, Shield, Search, ExternalLink, Copy, CheckCircle
} from "lucide-react";

export default function RecruitersPage() {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [copied, setCopied]         = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    account.get().catch(() => router.push("/login"));
    fetch("https://knowvation.onrender.com/admin/recruiters")
      .then((r) => r.json())
      .then((data) => { setRecruiters(Array.isArray(data) ? data : []); })
      .catch(() => setRecruiters([]))
      .finally(() => setLoading(false));
  }, [router]);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = recruiters.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.company?.toLowerCase().includes(q) ||
      r.hr_name?.toLowerCase().includes(q) ||
      r.hr_email?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r.job_title?.toLowerCase().includes(q)
    );
  });

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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Recruiter & HR Intelligence
            </h1>
          </div>
          <p className="text-gray-400">Internal directory — HR contacts for all companies in the system</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, HR name, email, location..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-colors"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Recruiters", value: recruiters.length, color: "text-cyan-400" },
            { label: "Unique Companies", value: new Set(recruiters.map(r => r.company)).size, color: "text-purple-400" },
            { label: "With LinkedIn", value: recruiters.filter(r => r.hr_linkedin).length, color: "text-blue-400" },
            { label: "Search Results", value: filtered.length, color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recruiters Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {recruiters.length === 0
              ? "No recruiter data yet. Add jobs with HR info in the Admin panel."
              : "No recruiters match your search."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-white/20 transition-all group">

                {/* Company + Job Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-lg text-white leading-tight">{r.company}</p>
                    {r.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-green-400" /> {r.location}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg shrink-0 ml-2">
                    <Briefcase className="w-3 h-3 inline mr-1" />
                    {r.job_title?.substring(0, 18) || 'Job'}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 my-3" />

                {/* HR Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">{r.hr_name}</p>
                      {r.hr_designation && <p className="text-xs text-gray-500">{r.hr_designation}</p>}
                    </div>
                  </div>

                  {r.hr_email && (
                    <div className="flex items-center gap-2 group/email">
                      <Mail className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-sm text-gray-300 truncate flex-1">{r.hr_email}</span>
                      <button
                        onClick={() => copyEmail(r.hr_email)}
                        className="opacity-0 group-hover/email:opacity-100 transition-opacity p-1 hover:text-green-400"
                      >
                        {copied === r.hr_email ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  {r.hr_contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span className="text-sm text-gray-300">{r.hr_contact}</span>
                    </div>
                  )}

                  {r.hr_linkedin && (
                    <a
                      href={r.hr_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Link2 className="w-4 h-4 shrink-0" />
                      <span className="text-sm underline">View LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
