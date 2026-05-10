"use client";
import { useEffect, useState, Suspense } from "react";
import { account } from "@/lib/appwrite";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

function VerifyContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  useEffect(() => {
    if (userId && secret) {
      account.updateVerification(userId, secret)
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, [userId, secret]);

  return (
    <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md text-center">
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Verifying Email...</h1>
          <p className="text-gray-400 mt-2">Please wait while we confirm your email address.</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-gray-400 mt-2 mb-6">Your account is now fully active.</p>
          <Link href="/admin">
            <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold">
              Go to Dashboard
            </button>
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Verification Failed</h1>
          <p className="text-gray-400 mt-2 mb-6">The link is invalid or has expired.</p>
          <Link href="/login">
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold">
              Return to Login
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function Verify() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <Suspense fallback={<Loader2 className="w-12 h-12 text-purple-500 animate-spin" />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
