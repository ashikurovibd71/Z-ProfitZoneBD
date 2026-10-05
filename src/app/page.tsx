"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle, Star, ArrowRight, UserPlus, Wallet, PlayCircle, Users, HeadphonesIcon, Zap, ShieldCheck, BarChart3, FileText, Gift } from 'lucide-react';

export default function Home() {
  const [liveActivities, setLiveActivities] = useState([
    { user: "রহিম ***", action: "৳১,২০০ উইথড্র করেছেন (বিকাশ)", time: "এইমাত্র" },
    { user: "সাদিয়া ***", action: "একটি অটো টাস্ক কমপ্লিট করেছেন", time: "১ মিনিট আগে" },
    { user: "কামরুল ***", action: "প্রিমিয়াম প্যাকেজ আপগ্রেড করেছেন", time: "৩ মিনিট আগে" },
    { user: "আণিকা ***", action: "৳৫,০০০ উইথড্র করেছেন (নগদ)", time: "৫ মিনিট আগে" },
  ]);

  const [liveActivityTicker, setLiveActivityTicker] = useState({ user: "রিয়াজ***", amount: "৳100" });
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const interval1 = setInterval(() => {
      setLiveActivities(prev => {
        const newActivity = { user: "ইউজার" + Math.floor(Math.random() * 999), action: "৳১৫.০০ আয় করেছেন", time: "এইমাত্র" };
        return [newActivity, ...prev.slice(0, 3)];
      });
    }, 4000);

    const names = ["রিয়াজ", "সাদিয়া", "কামরুল", "আরিফ", "নাসির", "তাসনিম", "জুবায়ের"];
    const amounts = ["৳100", "৳50", "৳500", "৳10", "৳250", "৳1000"];
    const interval2 = setInterval(() => {
      setLiveActivityTicker({
        user: names[Math.floor(Math.random() * names.length)] + "***",
        amount: amounts[Math.floor(Math.random() * amounts.length)]
      });
    }, 3000);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.referralCode) {
            setReferralCode(data.user.referralCode);
          }
        }
      } catch (err) {
        // user not logged in or error
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500 selection:text-black font-sans">

      {/* Navigation - Full width background, fixed width content */}
      <nav className="backdrop-blur-md bg-black/80 sticky top-0 z-50 border-b border-white/10 px-4 sm:px-8 py-4 sm:py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="ProfitZoneBD Logo" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-lg shadow-yellow-500/20" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-yellow-500 hidden sm:block">ProfitZoneBD</span>
          </div>
          <div className="flex gap-4 sm:gap-6 items-center">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition hidden xs:block">
              Login
            </Link>
            <Link href="/register" className="text-xs sm:text-sm bg-yellow-500 hover:bg-yellow-400 text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold transition shadow-[0_0_15px_rgba(234,179,8,0.4)] whitespace-nowrap">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-4 pt-16 sm:pt-24 pb-12 sm:pb-16 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-yellow-500/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-gray-300 mb-6 sm:mb-8 backdrop-blur-md z-10">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            VIP Earning Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4 sm:mb-6 z-10 max-w-4xl">
            Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Free Time</span> into Real Money
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 z-10 max-w-3xl">
            বাংলাদেশের সেরা micro-job প্ল্যাটফর্ম। সহজ কাজ করে আয় করুন, packages upgrade করুন এবং bKash বা Nagad-এ সাথে সাথে withdraw করুন।
          </p>

          <div className="flex flex-col sm:flex-row gap-4 z-10 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-yellow-500 text-black rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Start Earning Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      {/* Live Automatic Board Marquee */}
      <section className="py-6 sm:py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 whitespace-nowrap text-yellow-500 font-bold shrink-0 text-sm sm:text-base">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            লাইভ অ্যাক্টিভিটি
          </div>
          <div className="w-full overflow-hidden relative h-8">
            <div className="absolute inset-0 flex items-center gap-4 sm:gap-8 animate-marquee whitespace-nowrap">
              {liveActivities.map((act, i) => (
                <div key={i} className="text-gray-300 text-xs sm:text-sm bg-black/50 px-3 sm:px-4 py-1.5 rounded-full border border-white/5">
                  <span className="font-bold text-yellow-500">{act.user}</span> {act.action} <span className="text-gray-500 text-[10px] sm:text-xs ml-2">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content wrapper with fixed width for everything below */}
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">

        {/* Bengali Live Activity Box */}
        <div className="bg-[#121c22] border border-yellow-500/20 rounded-3xl p-4 sm:p-6 mb-8 sm:mb-12 flex items-center justify-between relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 animate-pulse"></span>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-yellow-500 font-bold mb-0.5 sm:mb-1 flex items-center gap-1">
                LIVE <span className="text-gray-400 font-normal">এই মুহূর্তে আয়</span>
              </div>
              <div className="font-bold text-base sm:text-lg">{liveActivityTicker.user}</div>
            </div>
          </div>
          <div className="text-yellow-500 font-bold text-xl sm:text-2xl relative z-10">
            +{liveActivityTicker.amount}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-yellow-500/10 blur-[60px] sm:blur-[80px] rounded-full pointer-events-none"></div>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24">
          <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-3xl hover:border-yellow-500/30 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-3 sm:mb-4">
              <Users size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-yellow-500 mb-1 sm:mb-2">66K+</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Active Users</div>
          </div>

          <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-3xl hover:border-yellow-500/30 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-3 sm:mb-4">
              <Wallet size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-yellow-500 mb-1 sm:mb-2">৳ 95.1M</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Total Deposits</div>
          </div>

          <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-3xl hover:border-yellow-500/30 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-3 sm:mb-4">
              <CheckCircle size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-yellow-500 mb-1 sm:mb-2">99.9%</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Success Rate</div>
          </div>

          <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-3xl hover:border-yellow-500/30 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-3 sm:mb-4">
              <HeadphonesIcon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-yellow-500 mb-1 sm:mb-2">24/7</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Customer Support</div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="py-16 sm:py-24">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-yellow-500">
              Why Choose Us?
            </h2>
            <p className="text-sm sm:text-base text-gray-400">Start your earning journey with security and reliability</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-4 sm:gap-6 hover:border-yellow-500/30 transition-colors w-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0 mt-1 sm:mt-0">
                <Zap size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-yellow-500">🚀 Instant Payment</h3>
                <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">Withdrawals are processed instantly and reach your account within seconds.</p>
              </div>
            </div>

            <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-4 sm:gap-6 hover:border-yellow-500/30 transition-colors w-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0 mt-1 sm:mt-0">
                <ShieldCheck size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-yellow-500">🔒 Maximum Security</h3>
                <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">Bank-grade encryption keeps your data and funds completely secure.</p>
              </div>
            </div>

            <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-4 sm:gap-6 hover:border-yellow-500/30 transition-colors w-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0 mt-1 sm:mt-0">
                <BarChart3 size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-yellow-500">📊 Live Analytics</h3>
                <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">Real-time dashboard for complete transparency and tracking.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Highlight */}
        <div className="py-12 sm:py-16">
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.1)]">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 blur-[50px] rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full"></div>
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30 relative z-10">
              <Gift size={32} className="text-black" />
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 text-white relative z-10">
              রেফার করুন আর <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">আনলিমিটেড ইনকাম</span> করুন!
            </h2>
            
            <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto mb-8 relative z-10">
              আপনার বন্ধুদের ইনভাইট করুন। আপনার লিংকের মাধ্যমে কেউ যুক্ত হলে সাথে সাথে পেয়ে যাবেন রেফার বোনাস! আপনার বন্ধুও পাবে ওয়েলকাম বোনাস।
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
              {referralCode ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-yellow-500 font-bold mb-2">আপনার রেফারেল লিংক:</span>
                  <div className="flex items-center gap-2 bg-black/60 border border-white/20 p-2 pl-4 rounded-xl max-w-full overflow-hidden">
                    <span className="text-gray-300 text-sm select-all truncate max-w-[200px] sm:max-w-md">
                      {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : ''}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralCode}`);
                        alert("Referral link copied!");
                      }}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-lg transition-colors shrink-0"
                    >
                      কপি করুন
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-6 py-3 rounded-full">
                    <span className="text-yellow-500 font-bold">1</span>
                    <span className="text-sm text-gray-300">লিংক শেয়ার করুন</span>
                  </div>
                  <ArrowRight className="text-yellow-500 hidden sm:block opacity-50" />
                  <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-6 py-3 rounded-full">
                    <span className="text-yellow-500 font-bold">2</span>
                    <span className="text-sm text-gray-300">বন্ধু একাউন্ট খুলবে</span>
                  </div>
                  <ArrowRight className="text-yellow-500 hidden sm:block opacity-50" />
                  <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-6 py-3 rounded-full">
                    <span className="text-yellow-500 font-bold">3</span>
                    <span className="text-sm text-gray-300">বোনাস পেয়ে যান!</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* How to start */}
        <div className="py-16 sm:py-24">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-yellow-500">
              কিভাবে শুরু করবেন? (How to Start)
            </h2>
            <p className="text-sm sm:text-base text-gray-400">ProfitZoneBD এ যুক্ত হওয়া একদম সহজ! Just follow these 5 steps:</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden w-full animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0 mt-1 sm:mt-0">
                <UserPlus size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="text-[10px] sm:text-xs bg-yellow-500/20 text-yellow-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold">Step 1</span>
                  <h3 className="text-base sm:text-xl font-bold">Create an Account</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">প্রথমে একটি ফ্রি একাউন্ট তৈরি করুন—মাত্র কয়েক সেকেন্ডের কাজ।</p>
              </div>
            </div>

            <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden w-full animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0 mt-1 sm:mt-0">
                <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="text-[10px] sm:text-xs bg-yellow-500/20 text-yellow-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold">Step 2</span>
                  <h3 className="text-base sm:text-xl font-bold">Complete KYC Verification</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">একাউন্ট সুরক্ষিত রাখতে আপনার কেওয়াইসি সম্পন্ন করুন এবং এডমিন থেকে এপ্রুভ নিন।</p>
              </div>
            </div>

            <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden w-full animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0 mt-1 sm:mt-0">
                <Zap size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="text-[10px] sm:text-xs bg-yellow-500/20 text-yellow-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold">Step 3</span>
                  <h3 className="text-base sm:text-xl font-bold">Buy a Package</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">আপনার পছন্দমতো একটি প্রিমিয়াম প্যাকেজ এক্টিভ করুন।</p>
              </div>
            </div>

            <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden w-full animate-fade-in-up" style={{ animationDelay: '700ms' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0 mt-1 sm:mt-0">
                <FileText size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="text-[10px] sm:text-xs bg-yellow-500/20 text-yellow-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold">Step 4</span>
                  <h3 className="text-base sm:text-xl font-bold">Complete Tasks</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">প্রতিদিন সহজ কাজগুলো সম্পন্ন করে আয় করুন।</p>
              </div>
            </div>

            <div className="bg-[#121c22] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden w-full animate-fade-in-up" style={{ animationDelay: '900ms' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0 mt-1 sm:mt-0">
                <Wallet size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="text-[10px] sm:text-xs bg-yellow-500/20 text-yellow-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold">Step 5</span>
                  <h3 className="text-base sm:text-xl font-bold">Instant Withdraw</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">বিকাশ বা নগদের মাধ্যমে আপনার আয় করা টাকা সাথে সাথে তুলে নিন।</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="py-16 sm:pb-24 bg-gradient-to-b from-transparent to-[#050505] px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-16 text-yellow-500">হাজারো মানুষের আস্থার প্রতীক</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            {[
              { name: "সাব্বির হোসেন", review: "অটো টাস্কগুলো দারুণ! শুধু লিংকে ক্লিক করলেই টাইমার নিজে কাজ করে। গতকাল আমি ২০০০ টাকা উইথড্র করেছি।", rating: 5 },
              { name: "ফারজানা আক্তার", review: "খুবই সুরক্ষিত প্ল্যাটফর্ম। কেওয়াইসি (KYC) সিস্টেম আমাকে নিরাপত্তা দেয়। ৬% ফিসহ দ্রুত পেমেন্ট পেয়েছি।", rating: 5 },
              { name: "রাকিবুল ইসলাম", review: "বাংলাদেশের সেরা মাইক্রো-জব সাইট। আপনি যদি প্রতিদিন ভালো আয় করতে চান তবে প্রিমিয়াম প্যাকেজগুলো নিতে পারেন।", rating: 4 }
            ].map((rev, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-yellow-500/30 transition-colors">
                <div>
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className={j < rev.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"} />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 mb-6 italic">"{rev.review}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-full flex items-center justify-center font-bold text-yellow-500 shrink-0">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-yellow-500">{rev.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">ভেরিফাইড আর্নার <CheckCircle size={10} className="inline text-yellow-500" /></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 pt-16 pb-8 bg-black px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">

            {/* Branding Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.jpg" alt="ProfitZoneBD Logo" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-lg shadow-yellow-500/20" />
                <span className="text-xl font-bold tracking-tight text-yellow-500">ProfitZoneBD</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                বাংলাদেশের সেরা মাইক্রো-জব প্ল্যাটফর্ম। নিরাপদ ও দ্রুত লেনদেনের মাধ্যমে আপনার আয় নিশ্চিত করুন।
              </p>
            </div>

            {/* Payment Partners */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">আমাদের পেমেন্ট পার্টনারস</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500 shrink-0" /> দ্রুত এবং নিরাপদ লেনদেন</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500 shrink-0" /> টাকা রিফান্ড</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-yellow-500 shrink-0" /> ১০০% নিরাপদ গ্যারান্টি</li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">এক্সপ্লোর</h3>
              <ul className="space-y-3 text-sm text-gray-400 flex flex-col">
                <li><Link href="#" className="hover:text-yellow-500 transition">সফলতা</Link></li>
                <li><Link href="#" className="hover:text-yellow-500 transition">রেফারেল সিস্টেম</Link></li>
                <li><a href="https://t.me/+is-FNALTRN40Zjgx" target="_blank" rel="noreferrer" className="hover:text-yellow-500 transition">টেলিগ্রাম চ্যানেল</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">কোম্পানি</h3>
              <ul className="space-y-3 text-sm text-gray-400 flex flex-col">
                <li><Link href="#" className="hover:text-yellow-500 transition">আমাদের সম্পর্কে</Link></li>
                <li><Link href="#" className="hover:text-yellow-500 transition">প্রাইভেসি পলিসি</Link></li>
                <li><Link href="#" className="hover:text-yellow-500 transition">শর্তাবলী</Link></li>
                <li><Link href="#" className="hover:text-yellow-500 transition">রিফান্ড পলিসি</Link></li>
                <li><Link href="#" className="hover:text-yellow-500 transition">যোগাযোগ</Link></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
            <p>© ২০২৬ ProfitZoneBD. সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col gap-3 sm:gap-4 z-50">
        <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform">
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
        </a>
        <a href="#" className="w-12 h-12 sm:w-14 sm:h-14 bg-white text-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <HeadphonesIcon size={24} className="sm:w-7 sm:h-7" />
        </a>
      </div>

    </div>
  );
}
