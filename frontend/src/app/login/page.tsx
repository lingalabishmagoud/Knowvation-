"use client";
import { useState, useEffect } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    account.get().then(() => {
      router.push("/admin");
    }).catch(() => {
      // Not logged in, stay on login
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      router.push("/admin"); // Redirect to dashboard
    } catch (error: any) {
      if (error.message.includes("session is active")) {
        router.push("/admin");
      } else {
        alert("Login failed: " + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-gray-400 mb-8">Log in to your dashboard</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 outline-none" />
          </div>
          <button disabled={loading} type="submit"
            className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Log In"}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-400">
          Don't have an account? <Link href="/register" className="text-purple-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
