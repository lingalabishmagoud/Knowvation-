"use client";
import { useState, useEffect } from "react";
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    account.get().then(() => {
      router.push("/admin");
    }).catch(() => {
      // Not logged in, stay on register
    });
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.create(ID.unique(), email, password, name);
      // Automatically log them in after registration
      await account.createEmailPasswordSession(email, password);
      // Send verification email
      await account.createVerification("https://lingalabishmagoud.github.io/Knowvation-/verify");
      router.push("/admin"); // Redirect to dashboard, which will now demand verification
    } catch (error: any) {
      if (error.message.includes("session is active")) {
        router.push("/admin");
      } else {
        alert("Registration failed: " + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-gray-400 mb-8">Join Knowvation</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={8}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-purple-500 outline-none" />
          </div>
          <button disabled={loading} type="submit"
            className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign Up"}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account? <Link href="/login" className="text-purple-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
