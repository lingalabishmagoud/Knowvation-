"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Search, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    import("@/lib/appwrite").then(({ account }) => {
      account.get().then((res) => {
        setUser(res);
      }).catch(() => {
        setUser(null);
      });
    });
  }, []);

  const handleLogout = async () => {
    const { account } = await import("@/lib/appwrite");
    await account.deleteSession("current");
    window.location.href = "/login";
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/20 backdrop-blur-xl border-b border-white/10"
    >
      <div className="flex items-center gap-2">
        <Brain className="w-8 h-8 text-purple-500" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          Knowvation
        </span>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/mock-jobs" className="hover:text-white transition-colors">Mock Source</Link>
        {user && (
          <>
            <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
              📊 Dashboard
            </Link>
            <Link href="/dashboard/recruiters" className="hover:text-white transition-colors flex items-center gap-1 text-green-400 hover:text-green-300">
              🧑‍💼 Recruiters
            </Link>
            <Link href="/dashboard/reports" className="hover:text-white transition-colors flex items-center gap-1 text-yellow-400 hover:text-yellow-300">
              📈 Reports
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" /> Admin
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <button onClick={handleLogout} className="px-5 py-2 text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full transition-all">
            Logout ({user.name})
          </button>
        ) : (
          <>
            <Link href="/login">
              <button className="px-5 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="px-5 py-2 text-sm font-medium text-black bg-white hover:bg-gray-200 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
