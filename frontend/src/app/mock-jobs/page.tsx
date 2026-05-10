"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, MapPin, Briefcase, Clock, Building, ChevronRight, Bookmark, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function MockJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/source-jobs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          setJobs([]);
        }
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Public Navbar - Different from internal dashboard */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">HireFlow<span className="text-indigo-600">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="text-indigo-600 font-semibold">Find Jobs</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Companies</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Salary Guide</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign In</button>
            <button className="text-sm font-medium bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 transition-all shadow-md shadow-slate-200">Post a Job</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-indigo-900 text-white py-20 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-screen filter blur-[120px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
          >
            Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">dream job</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
          >
            Discover thousands of job opportunities with top companies and startups.
          </motion.p>

          {/* Mock Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl max-w-3xl mx-auto"
          >
            <div className="flex-1 flex items-center px-4 py-3 md:border-r border-slate-100">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input type="text" placeholder="Job title, keywords, or company" className="w-full bg-transparent text-slate-900 focus:outline-none placeholder-slate-400" />
            </div>
            <div className="flex-1 flex items-center px-4 py-3">
              <MapPin className="w-5 h-5 text-slate-400 mr-3" />
              <input type="text" placeholder="City, state, or 'Remote'" className="w-full bg-transparent text-slate-900 focus:outline-none placeholder-slate-400" />
            </div>
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors w-full md:w-auto">
              Search
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Mock Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm mb-3 text-slate-900">Job Type</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked /> Full-time</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Part-time</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Contract</label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-semibold text-sm mb-3 text-slate-900">Experience Level</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Entry Level</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked /> Mid Level</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Senior Level</label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-semibold text-sm mb-3 text-slate-900">Work Model</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked /> Remote</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> On-site</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked /> Hybrid</label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Job Listings Area */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {loading ? "Loading jobs..." : `Recommended Jobs (${jobs.length})`}
            </h2>
            <select className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option>Most Relevant</option>
              <option>Most Recent</option>
            </select>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                 Loading opportunities...
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs available</h3>
                <p className="text-slate-500">Check back later or add some jobs via the internal Admin panel.</p>
              </div>
            ) : (
              (jobs as any[]).map((job: any, i: number) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                  key={job.$id}
                  className="job-card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all group relative"
                >
                  <div className="flex items-start gap-4">
                    {/* Mock Company Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100 flex items-center justify-center shrink-0 text-xl font-bold text-indigo-600">
                      {job.company ? job.company.charAt(0).toUpperCase() : <Building className="w-6 h-6" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="job-title text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer truncate pr-4">
                            {job.title}
                          </h2>
                          <p className="company-name text-slate-600 font-medium mt-1">{job.company}</p>
                        </div>
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 -mt-2 -mr-2 rounded-full hover:bg-indigo-50">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3">
                        {job.location && (
                          <div className="job-location flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                           <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                           Full-time
                        </div>
                        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                          Actively hiring
                        </div>
                      </div>

                      <div className="description mt-5 text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {job.description}
                      </div>

                      {/* Hidden HR Attributes for the Playwright Scraper */}
                      <span
                        data-hr-name={job.hr_name || ""}
                        data-hr-email={job.hr_email || ""}
                        data-hr-linkedin={job.hr_linkedin || ""}
                        data-hr-contact={job.hr_contact || ""}
                        style={{ display: "none" }}
                        aria-hidden="true"
                      />

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-xs text-slate-400">Posted just now</span>
                        <button className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-5 py-2 rounded-lg transition-colors">
                          Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
