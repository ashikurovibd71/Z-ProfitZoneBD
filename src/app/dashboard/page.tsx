"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock, Wallet, AlertTriangle, Upload, X, Image as ImageIcon, IdCard } from "lucide-react";

export default function DashboardOverview() {
  const [balance, setBalance] = useState<number>(0);
  const [userName, setUserName] = useState<string>("User");
  const [kycStatus, setKycStatus] = useState<string>("approved");
  const [hasKycDocs, setHasKycDocs] = useState<boolean>(true);
  const [showKycModal, setShowKycModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setBalance(Number(data.user.walletBalance) || 0);
          setUserName(data.user.fullName);
          setKycStatus(data.user.kycStatus || 'pending');
          setHasKycDocs(!!data.user.profilePicture && !!data.user.nidFront && !!data.user.nidBack);
        }
      } catch (error) {
        console.error("Failed to fetch user data");
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2">Welcome back, {userName}!</h2>
          <p className="text-sm md:text-base text-gray-400">Here is a summary of your earnings and tasks today.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* We could also make KYC status dynamic here if we stored it in state, for now we leave it or remove it */}
        </div>
      </div>

      {(!hasKycDocs || kycStatus !== 'approved') && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 mt-1" size={20} />
            <div>
              <h3 className="text-yellow-500 font-bold mb-1">
                {!hasKycDocs ? 'KYC অসম্পূর্ণ (KYC Incomplete)' : 'KYC যাচাইকরণ চলছে (KYC Pending)'}
              </h3>
              <p className="text-sm text-gray-300">
                {!hasKycDocs 
                  ? 'আপনার একাউন্ট সম্পূর্ণ করতে এবং পেমেন্ট তুলতে অনুগ্রহ করে আপনার ডকুমেন্টগুলো আপলোড করুন।' 
                  : 'আপনার অ্যাকাউন্টটি অনুমোদনের অপেক্ষায় আছে। দয়া করে অপেক্ষা করুন।'}
              </p>
            </div>
          </div>
          {!hasKycDocs && (
            <button 
              onClick={() => setShowKycModal(true)}
              className="px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors whitespace-nowrap"
            >
              ডকুমেন্ট আপলোড করুন
            </button>
          )}
        </div>
      )}

      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121c22] border border-white/10 p-6 rounded-3xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowKycModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-yellow-500 mb-4">ডকুমেন্ট আপলোড (KYC)</h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsUploading(true);
                const formData = new FormData(e.currentTarget);
                try {
                  const res = await fetch("/api/user/kyc", {
                    method: "POST",
                    body: formData,
                  });
                  if (res.ok) {
                    setHasKycDocs(true);
                    setKycStatus("pending");
                    setShowKycModal(false);
                    alert("KYC documents uploaded successfully!");
                  } else {
                    const data = await res.json();
                    alert(data.error || "Failed to upload KYC documents");
                  }
                } catch (error) {
                  alert("An error occurred while uploading.");
                } finally {
                  setIsUploading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">প্রোফাইল ছবি</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="file" 
                    name="profilePicture"
                    accept="image/*"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-yellow-500/20 file:text-yellow-500 hover:file:bg-yellow-500/30 cursor-pointer focus:outline-none focus:border-yellow-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">এনআইডি কার্ড (সামনের অংশ)</label>
                <div className="relative">
                  <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="file" 
                    name="nidFront"
                    accept="image/*"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-yellow-500/20 file:text-yellow-500 hover:file:bg-yellow-500/30 cursor-pointer focus:outline-none focus:border-yellow-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">এনআইডি কার্ড (পেছনের অংশ)</label>
                <div className="relative">
                  <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="file" 
                    name="nidBack"
                    accept="image/*"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-yellow-500/20 file:text-yellow-500 hover:file:bg-yellow-500/30 cursor-pointer focus:outline-none focus:border-yellow-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] mt-6 flex items-center justify-center gap-2"
              >
                {isUploading ? "আপলোড হচ্ছে..." : <><Upload size={18} /> সাবমিট করুন</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Current Balance" 
          value={`৳ ${balance.toFixed(2)}`} 
          icon={<Wallet className="text-indigo-400" size={24} />} 
          trend="Real-time"
          trendUp={true}
        />
        <StatCard 
          title="Total Earned" 
          value="৳ 8,500.00" 
          icon={<ArrowUpRight className="text-green-400" size={24} />} 
          trend="Lifetime"
        />
        <StatCard 
          title="Tasks Completed" 
          value="142" 
          icon={<CheckCircle2 className="text-blue-400" size={24} />} 
          trend="4 today"
          trendUp={true}
        />
        <StatCard 
          title="Pending Approval" 
          value="3" 
          icon={<Clock className="text-orange-400" size={24} />} 
          trend="Manual Tasks"
        />
      </div>

      {/* Active Package & Recent Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Package Card */}
        <div className="xl:col-span-1 p-6 rounded-3xl bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[50px] rounded-full"></div>
          <h3 className="text-xl font-bold mb-4 relative z-10">Active Package</h3>
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-indigo-400 font-bold">Pro Earner</span>
              <span className="text-xs text-gray-400">12 Days Left</span>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Daily Limit</span>
                <span className="font-bold text-white">20 Tasks</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks Done Today</span>
                <span className="font-bold text-white">4 / 20</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
          <button className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors relative z-10">
            Upgrade Package
          </button>
        </div>

        {/* Available Tasks */}
        <div className="xl:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Quick Tasks</h3>
            <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
          </div>
          
          <div className="space-y-3">
            {[
              { title: "Watch YouTube Video", type: "AUTO", reward: 5.0, time: "30s" },
              { title: "Like Facebook Page", type: "MANUAL", reward: 10.0, time: "Screenshot" },
              { title: "Subscribe to Channel", type: "AUTO", reward: 15.0, time: "60s" }
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${task.type === 'AUTO' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {task.type === 'AUTO' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                      <span className="px-2 py-0.5 rounded bg-white/5">{task.type}</span>
                      <span>• {task.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4">
                  <span className="font-bold text-green-400 text-sm md:text-base">৳ {task.reward.toFixed(2)}</span>
                  <button className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-black text-xs md:text-sm font-medium rounded-lg md:opacity-0 group-hover:opacity-100 transition-opacity">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string; value: string; icon: React.ReactNode; trend?: string; trendUp?: boolean }) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-black/40 rounded-2xl">{icon}</div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-gray-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-400 text-xs md:text-sm font-medium mb-1">{title}</h3>
        <p className="text-xl md:text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}
