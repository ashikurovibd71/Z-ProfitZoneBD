"use client";

import Link from "next/link";
import { ArrowLeft, User, Phone, Lock, Image as ImageIcon, IdCard, Mail } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refCode, setRefCode] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setRefCode(ref);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না (Passwords do not match)");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setError("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative z-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> হোমে ফিরে যান
      </Link>
      
      <div className="bg-[#121c22]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-yellow-500">একাউন্ট তৈরি করুন</h1>
          <p className="text-gray-400 text-sm">ProfitZoneBD তে যুক্ত হয়ে আজই আয় শুরু করুন</p>
        </div>

        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="mb-4 text-green-500 text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">পূর্ণ নাম</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                name="fullName"
                placeholder="আপনার নাম" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">ফোন নম্বর</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="tel" 
                name="phone"
                placeholder="01XXXXXXXXX" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">ইমেইল (Email)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="ashikurovi2003@gmail.com" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">পাসওয়ার্ড নিশ্চিত করুন</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">রেফারেল কোড (ঐচ্ছিক)</label>
            <div className="relative">
              <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                name="referralCode"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                placeholder="Referral Code (Optional)" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors uppercase"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] mt-6">
            {loading ? "অপেক্ষা করুন..." : "নিবন্ধন করুন"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          আগেই একাউন্ট আছে? <Link href="/login" className="text-yellow-500 font-bold hover:underline">লগিন করুন</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-yellow-500/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>

      <Suspense fallback={<div className="z-10 text-yellow-500">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
