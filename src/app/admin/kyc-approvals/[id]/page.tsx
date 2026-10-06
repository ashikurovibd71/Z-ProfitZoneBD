"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  profilePicture: string | null;
  nidFront: string | null;
  nidBack: string | null;
  kycStatus: string;
  role: string;
  createdAt: string;
};

export default function KYCDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          Swal.fire("User not found");
          router.push("/admin/kyc-approvals");
        }
      } catch (error) {
        console.error("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, router]);

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/kyc`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setUser((prev) => prev ? { ...prev, kycStatus: status } : null);
      } else {
        Swal.fire("Failed to update status");
      }
    } catch (error) {
      Swal.fire("Error updating status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-500" size={32} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href="/admin/kyc-approvals" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review KYC: {user.fullName}</h2>
          <p className="text-gray-400">View user details and submitted documents.</p>
        </div>
      </div>

      <div className="bg-[#121c22]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-8">
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-sm mb-1">Full Name</p>
            <p className="font-bold text-lg">{user.fullName}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-sm mb-1">Phone</p>
            <p className="font-bold text-lg">{user.phone}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="font-bold text-lg">{user.email || 'N/A'}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-sm mb-1">Current Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block mt-1 ${
              user.kycStatus === 'approved' ? 'bg-green-500/10 text-green-400' :
              user.kycStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
              'bg-orange-500/10 text-orange-400'
            }`}>
              {user.kycStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b border-white/10 pb-4">Submitted Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <p className="font-medium text-gray-300">Profile Picture</p>
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden aspect-square flex items-center justify-center relative">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-gray-500">No Image</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="font-medium text-gray-300">NID Front</p>
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden aspect-video flex items-center justify-center relative">
                {user.nidFront ? (
                  <img src={user.nidFront} alt="NID Front" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-gray-500">No Image</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-gray-300">NID Back</p>
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden aspect-video flex items-center justify-center relative">
                {user.nidBack ? (
                  <img src={user.nidBack} alt="NID Back" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-gray-500">No Image</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-end">
          <button 
            disabled={actionLoading || user.kycStatus === 'rejected'}
            onClick={() => handleUpdateStatus('rejected')}
            className="flex items-center gap-2 px-8 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 disabled:opacity-50 disabled:hover:bg-red-500/10 disabled:hover:text-red-500 rounded-xl font-bold transition-all shadow-sm"
          >
            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <XCircle size={20} />}
            Reject KYC
          </button>
          
          <button 
            disabled={actionLoading || user.kycStatus === 'approved'}
            onClick={() => handleUpdateStatus('approved')}
            className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
            Approve KYC
          </button>
        </div>
      </div>
    </div>
  );
}
