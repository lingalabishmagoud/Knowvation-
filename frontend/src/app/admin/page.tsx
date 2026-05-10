"use client";
import { useState, useEffect } from "react";
import {
  PlusCircle, Loader2, LogOut, CheckCircle, XCircle,
  MapPin, User, Mail, ExternalLink, Phone, Briefcase, Brain,
  RefreshCw, PlayCircle, Shield, Edit2, Trash2, AlertTriangle,
  Activity, Key, Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const EMPTY_FORM = {
  title: "", company: "", location: "", description: "",
  hr_name: "", hr_designation: "", hr_email: "", hr_linkedin: "", hr_contact: ""
};

export default function AdminPage() {
  const [loading, setLoading]           = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser]                 = useState<any>(null);
  const [formData, setFormData]         = useState({ ...EMPTY_FORM });
  const [analyzedJobs, setAnalyzedJobs] = useState<any[]>([]);
  const [sourceJobs, setSourceJobs]     = useState<any[]>([]);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [scraping, setScraping]         = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState<any>(null);
  const [quotaStatus, setQuotaStatus]   = useState<any>(null);
  const [testingQuota, setTestingQuota] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'warning', text: string} | null>(null);
  const router = useRouter();

  const showNotification = (type: 'success' | 'error' | 'warning', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 6000);
  };

  useEffect(() => {
    account.get().then((res) => {
      setUser(res);
      setCheckingAuth(false);
      fetchAnalyzedJobs();
      fetchSourceJobs();
      fetchScrapeStatus();
      fetchQuotaStatus();
    }).catch(() => {
      router.push("/login");
    });
  }, [router]);

  const fetchQuotaStatus = async () => {
    setTestingQuota(true);
    try {
      const res = await fetch("https://knowvation.onrender.com/api/quota-status");
      if (res.ok) setQuotaStatus(await res.json());
    } catch {}
    setTestingQuota(false);
  };

  const fetchAnalyzedJobs = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("https://knowvation.onrender.com/analytics/jobs");
      if (res.ok) {
        const data = await res.json();
        setAnalyzedJobs(data);
        if (data.length > 0) showNotification('success', `Loaded ${data.length} analyzed jobs.`);
      } else {
        showNotification('error', 'Backend returned an error fetching jobs.');
      }
    } catch {
      showNotification('error', 'Cannot connect to backend. Is the server running?');
    }
    setRefreshing(false);
  };

  const fetchScrapeStatus = async () => {
    try {
      const res = await fetch("https://knowvation.onrender.com/scrape-status");
      if (res.ok) setScrapeStatus(await res.json());
    } catch {}
  };

  const fetchSourceJobs = async () => {
    try {
      const res = await fetch("https://knowvation.onrender.com/admin/source-jobs");
      if (res.ok) {
        const data = await res.json();
        setSourceJobs(data);
      }
    } catch {}
  };

  const handleDeleteSourceJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`https://knowvation.onrender.com/admin/source-jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification('success', "Job deleted successfully");
        fetchSourceJobs();
      } else {
        showNotification('error', "Failed to delete job");
      }
    } catch {
      showNotification('error', "Network error");
    }
  };

  const handleEditClick = (job: any) => {
    setFormData({
      title: job.title || "", company: job.company || "",
      location: job.location || "", description: job.description || "",
      hr_name: job.hr_name || "", hr_designation: job.hr_designation || "",
      hr_email: job.hr_email || "", hr_linkedin: job.hr_linkedin || "",
      hr_contact: job.hr_contact || ""
    });
    setEditingJobId(job.$id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrape = async () => {
    setScraping(true);
    showNotification('success', 'Scraper started! This may take a minute — do not refresh.');
    try {
      const res = await fetch("https://knowvation.onrender.com/scrape", { method: "POST" });
      if (res.ok) {
        await fetchScrapeStatus();
        const statusRes = await fetch("https://knowvation.onrender.com/scrape-status");
        const status = statusRes.ok ? await statusRes.json() : null;
        if (status?.quota_warning) {
          showNotification('warning', status.message);
        } else {
          showNotification('success', 'Scraping complete! Results updated.');
        }
        await fetchAnalyzedJobs();
      } else {
        showNotification('error', 'Scraper encountered an error on the backend.');
      }
    } catch {
      showNotification('error', 'Failed to connect to backend. Is the server running?');
    }
    setScraping(false);
  };

  const handleLogout = async () => {
    await account.deleteSession("current");
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingJobId
        ? `https://knowvation.onrender.com/admin/source-jobs/${editingJobId}`
        : "https://knowvation.onrender.com/admin/add-job";
      const method = editingJobId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        showNotification('success', editingJobId ? "Job updated!" : "Job added to source successfully!");
        setFormData({ ...EMPTY_FORM });
        setEditingJobId(null);
        fetchSourceJobs();
      } else {
        const err = await res.json();
        const msg = err.detail || "Server error";
        showNotification('error', msg.includes("missing scopes")
          ? "Backend API key missing permissions. Update scopes in Appwrite."
          : "Failed: " + msg);
      }
    } catch {
      showNotification('error', "Network error or server unreachable");
    }
    setLoading(false);
  };

  if (checkingAuth) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <Loader2 className="animate-spin" />
    </div>
  );

  if (user && !user.emailVerification) {
    return (
      <main className="min-h-screen bg-black pt-24 text-white flex items-center justify-center text-center">
        <Navbar />
        <div className="max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4 text-purple-400">Verify Your Email</h1>
          <p className="text-gray-400 mb-6">
            We sent a verification link to <strong>{user.email}</strong>. Please check your inbox.
          </p>
          <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 underline">
            Log out
          </button>
        </div>
      </main>
    );
  }

  const inputCls = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-colors";
  const labelCls = "block text-sm font-semibold mb-2 text-gray-300 flex items-center gap-2";

  return (
    <main className="min-h-screen bg-black pt-24 text-white">
      <Navbar />
      <div className="container mx-auto px-6 max-w-3xl pb-16">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Console
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name} · Job Source Manager</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : notification.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" />
               : notification.type === 'warning' ? <AlertTriangle className="w-5 h-5 shrink-0" />
               : <XCircle className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium">{notification.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quota Status Card ── */}
        <div className={`mb-8 p-5 rounded-2xl border flex items-start justify-between gap-4 ${
          !quotaStatus ? 'bg-white/5 border-white/10'
          : quotaStatus.status === 'ok' ? 'bg-green-500/10 border-green-500/30'
          : quotaStatus.status === 'quota_exceeded' ? 'bg-yellow-500/10 border-yellow-500/30'
          : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-start gap-3 flex-1">
            <Key className={`w-5 h-5 mt-0.5 shrink-0 ${
              !quotaStatus ? 'text-gray-400'
              : quotaStatus.status === 'ok' ? 'text-green-400'
              : quotaStatus.status === 'quota_exceeded' ? 'text-yellow-400'
              : 'text-red-400'
            }`} />
            <div>
              <p className="font-bold text-sm mb-0.5">
                {testingQuota ? 'Testing Gemini API Key...'
                 : quotaStatus ? `Gemini API — Key: ${quotaStatus.key_preview}`
                 : 'Gemini API Status'}
              </p>
              <p className="text-xs opacity-80">
                {testingQuota ? 'Making a live call to verify...'
                 : quotaStatus?.message || 'Click Refresh Key to test your current API key.'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchQuotaStatus}
            disabled={testingQuota}
            className="shrink-0 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {testingQuota ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {testingQuota ? 'Testing...' : 'Refresh Key'}
          </button>
        </div>

        {/* ── Add / Edit Job Form ── */}
        <form onSubmit={handleSubmit} className="space-y-0 bg-white/5 rounded-3xl border border-white/10 overflow-hidden mb-10">

          {/* Section A: Public Job Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-purple-500/20 rounded-lg"><Briefcase className="w-5 h-5 text-purple-400" /></div>
              <div>
                <h2 className="font-bold text-lg">Job Information</h2>
                <p className="text-xs text-gray-500">This info appears on the public job board</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}><Briefcase className="w-4 h-4 text-purple-400" /> Job Title *</label>
                <input type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls} placeholder="e.g. Senior Python Developer" />
              </div>
              <div>
                <label className={labelCls}><User className="w-4 h-4 text-cyan-400" /> Company Name *</label>
                <input type="text" required value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={inputCls} placeholder="e.g. TechCorp Solutions" />
              </div>
            </div>

            <div className="mt-4">
              <label className={labelCls}><MapPin className="w-4 h-4 text-green-400" /> Hiring Location *</label>
              <input type="text" required value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputCls} placeholder="e.g. Bengaluru, India / Remote" />
            </div>

            <div className="mt-4">
              <label className={labelCls}><Brain className="w-4 h-4 text-yellow-400" /> Job Description * <span className="text-gray-600 font-normal">(AI will analyze this)</span></label>
              <textarea required rows={6} value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputCls} placeholder="Enter the full job description here. The more detail, the better the AI analysis..." />
            </div>
          </div>

          {/* Section B: HR / Recruiter Intel (Internal) */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-cyan-500/20 rounded-lg"><Shield className="w-5 h-5 text-cyan-400" /></div>
              <div>
                <h2 className="font-bold text-lg">HR / Recruiter Intelligence</h2>
                <p className="text-xs text-gray-500">Internal only — used by consultants to contact the hiring company</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}><User className="w-4 h-4 text-cyan-400" /> HR Name *</label>
                <input type="text" required value={formData.hr_name}
                  onChange={(e) => setFormData({ ...formData, hr_name: e.target.value })}
                  className={inputCls} placeholder="e.g. Priya Sharma" />
              </div>
              <div>
                <label className={labelCls}><Briefcase className="w-4 h-4 text-purple-400" /> Designation *</label>
                <input type="text" required value={formData.hr_designation}
                  onChange={(e) => setFormData({ ...formData, hr_designation: e.target.value })}
                  className={inputCls} placeholder="e.g. HR Manager / Talent Acquisition" />
              </div>
              <div>
                <label className={labelCls}><Mail className="w-4 h-4 text-green-400" /> HR Email *</label>
                <input type="email" required value={formData.hr_email}
                  onChange={(e) => setFormData({ ...formData, hr_email: e.target.value })}
                  className={inputCls} placeholder="e.g. priya@techcorp.com" />
              </div>
              <div>
                <label className={labelCls}><Phone className="w-4 h-4 text-yellow-400" /> Contact Number</label>
                <input type="text" value={formData.hr_contact}
                  onChange={(e) => setFormData({ ...formData, hr_contact: e.target.value })}
                  className={inputCls} placeholder="e.g. +91 98765 43210" />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}><Link2 className="w-4 h-4 text-blue-400" /> LinkedIn Profile URL</label>
                <input type="url" value={formData.hr_linkedin}
                  onChange={(e) => setFormData({ ...formData, hr_linkedin: e.target.value })}
                  className={inputCls} placeholder="e.g. https://linkedin.com/in/priya-sharma" />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button disabled={loading} type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                {editingJobId ? "Update Job" : "Add Job to Source"}
              </button>
              {editingJobId && (
                <button type="button"
                  onClick={() => { setEditingJobId(null); setFormData({ ...EMPTY_FORM }); }}
                  className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* ── Source Jobs List ── */}
        <div className="mb-10 border-t border-white/10 pt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" /> Source Jobs in Database
          </h2>
          <div className="space-y-3">
            {sourceJobs.length === 0 ? (
              <p className="text-gray-500 text-center bg-white/5 py-8 rounded-xl border border-white/10">
                No jobs in source yet. Add some above!
              </p>
            ) : (
              sourceJobs.map((job) => (
                <div key={job.$id} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{job.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{job.company}</span>
                        {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-green-400" />{job.location}</span>}
                        {job.hr_name && <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-cyan-400" />{job.hr_name} ({job.hr_designation})</span>}
                        {job.hr_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-yellow-400" />{job.hr_email}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button onClick={() => handleEditClick(job)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteSourceJob(job.$id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── AI Intelligence Engine ── */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-7 h-7 text-purple-400" /> AI Intelligence Engine
            </h2>
            <div className="flex gap-3">
              <button onClick={fetchAnalyzedJobs} disabled={refreshing}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                {refreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button onClick={handleScrape} disabled={scraping}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                {scraping ? 'Running Scraper...' : 'Run Playwright Scraper'}
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-5">
            The scraper launches a headless browser, visits the mock source, extracts job + HR data, and sends it through Gemini AI for structured analysis.
          </p>

          {/* Last scrape status */}
          {scrapeStatus && (
            <div className={`mb-5 p-4 rounded-xl border ${
              scrapeStatus.quota_warning
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                : scrapeStatus.total > 0
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-white/5 border-white/10 text-gray-400'
            }`}>
              <p className="font-bold text-sm">{scrapeStatus.quota_warning ? 'API Quota Warning' : 'Last Scrape Result'}</p>
              <p className="text-sm mt-1">{scrapeStatus.message}</p>
              {scrapeStatus.total > 0 && (
                <div className="flex gap-4 mt-2 text-xs opacity-80">
                  <span>Total: {scrapeStatus.total}</span>
                  <span>AI Analyzed: {scrapeStatus.success}</span>
                  <span>Rate Limited: {scrapeStatus.rate_limited}</span>
                  <span>Errors: {scrapeStatus.errors}</span>
                </div>
              )}
            </div>
          )}

          {/* Analyzed Jobs List */}
          <div className="space-y-4">
            {analyzedJobs.length === 0 ? (
              <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center text-gray-500">
                No analyzed jobs found. Run the scraper!
              </div>
            ) : (
              analyzedJobs.map((job) => (
                <div key={job.$id} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-blue-400">{job.role}</h3>
                      <p className="text-gray-400 text-sm">{job.company} {job.location ? `· ${job.location}` : ''}</p>
                    </div>
                    <span className={`text-lg font-bold ${job.intelligence_score >= 70 ? 'text-green-400' : job.intelligence_score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {job.intelligence_score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {(job.skills || []).map((s: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Experience</p>
                      <p>{job.experience || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Hiring Trend</p>
                      <p className="text-green-400 font-semibold">{job.hiring_trend || '—'}</p>
                    </div>
                    {job.hr_name && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">HR Contact</p>
                        <p className="text-cyan-400">{job.hr_name} · {job.hr_email}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
