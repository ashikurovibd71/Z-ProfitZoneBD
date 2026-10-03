"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Upload, Image as ImageIcon, IdCard, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function KycPage() {
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<string>("pending");
  const [hasKycDocs, setHasKycDocs] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setKycStatus(data.user.kycStatus || 'pending');
          setHasKycDocs(!!data.user.profilePicture && !!data.user.nidFront && !!data.user.nidBack);
        }
      } catch (error) {
        console.error("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">KYC Verification</h2>
        <p className="text-gray-400 text-sm md:text-base">Complete your KYC to access all features.</p>
      </div>

      <div className="bg-[#111] border border-white/10 p-6 rounded-3xl relative overflow-hidden">
        {kycStatus === 'approved' ? (
          <div className="text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">KYC Approved</h3>
            <p className="text-gray-400">Your identity has been verified successfully.</p>
          </div>
        ) : hasKycDocs && kycStatus === 'pending' ? (
          <div className="text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Under Review</h3>
            <p className="text-gray-400">Your documents have been submitted and are pending admin approval.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3 mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertTriangle className="text-yellow-500 mt-1 shrink-0" size={20} />
              <div>
                <h3 className="text-yellow-500 font-bold mb-1">KYC Incomplete</h3>
                <p className="text-sm text-gray-300">Please upload your Profile Picture and National ID (NID) to verify your account.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Profile Picture</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="file" 
                    name="profilePicture"
                    accept="image/*"
                    className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">NID Card (Front)</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="file" 
                    name="nidFront"
                    accept="image/*"
                    className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">NID Card (Back)</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="file" 
                    name="nidBack"
                    accept="image/*"
                    className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] mt-8 flex items-center justify-center gap-2"
              >
                {isUploading ? <><Loader2 className="animate-spin" size={20} /> Uploading...</> : <><Upload size={20} /> Submit KYC Documents</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
