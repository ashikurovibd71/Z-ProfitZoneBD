"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Lock, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (newPassword.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reset failed");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-yellow-500/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> লগিন পেজে ফিরে যান
        </Link>
        
        <div className="bg-[#121c22]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="Logo" className="w-12 h-12 mx-auto rounded-full object-cover shadow-[0_0_20px_rgba(234,179,8,0.3)] mb-4" />
            <h1 className="text-2xl font-bold mb-2">পাসওয়ার্ড রিসেট</h1>
            <p className="text-gray-400 text-sm">নতুন পাসওয়ার্ড সেট করুন</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3 mb-4 text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm rounded-lg p-6 mb-4 flex flex-col items-center justify-center gap-2">
              <CheckCircle size={32} />
              <p className="font-bold text-center">পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!</p>
              <p className="text-xs text-center">লগিন পেজে নিয়ে যাওয়া হচ্ছে...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">ফোন নম্বর বা ইমেইল</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="01XXXXXXXXX বা email@example.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">নতুন পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'রিসেট করুন'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
