"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, User as UserIcon, Wallet, Activity, Calendar, ShieldCheck, Mail, Phone, Loader2, ArrowDownToLine, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [resolvedParams.id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${resolvedParams.id}`);
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDeposit = (deposits?: any[]) => {
    if (!deposits) return 0;
    return deposits
      .filter((d) => d.status === 'approved')
      .reduce((sum, d) => sum + Number(d.amount), 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-blue-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-gray-400">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center p-12 text-red-400 font-bold">User not found.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/users" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Back to Users
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-900/40 to-transparent"></div>
            <div className="w-24 h-24 bg-blue-500/20 border-2 border-blue-500/50 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-400 relative z-10">
              <UserIcon size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white relative z-10">{user.fullName}</h2>
            <p className="text-gray-400 mb-6 relative z-10">{user.role.toUpperCase()}</p>
            
            <div className="space-y-3 text-sm text-left relative z-10">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Phone className="text-gray-400" size={16} />
                <span className="font-medium">{user.phone}</span>
              </div>
              {user.email && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Mail className="text-gray-400" size={16} />
                  <span className="font-medium truncate">{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <ShieldCheck className={user.kycStatus === 'approved' ? 'text-green-400' : 'text-yellow-400'} size={16} />
                <span className="font-medium capitalize">KYC: {user.kycStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] border border-white/10 p-6 rounded-3xl flex items-center gap-4">
              <div className="p-4 bg-green-500/10 rounded-2xl text-green-400">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Wallet Balance</p>
                <p className="text-2xl font-bold text-white">৳ {Number(user.walletBalance).toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-[#111] border border-white/10 p-6 rounded-3xl flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                <ArrowDownToLine size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Deposited (Approved)</p>
                <p className="text-2xl font-bold text-white">৳ {calculateTotalDeposit(user.deposits).toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-[#111] border border-white/10 p-6 rounded-3xl flex items-center gap-4">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Account Created</p>
                <p className="text-lg font-bold text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="bg-[#111] border border-white/10 p-6 rounded-3xl flex items-center gap-4">
              <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Last Login</p>
                <p className="text-lg font-bold text-white">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Deposit History */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="text-gray-400" /> Recent Deposit Requests
            </h3>
            
            {user.deposits && user.deposits.length > 0 ? (
              <div className="space-y-3">
                {user.deposits.slice().reverse().map((deposit: any) => (
                  <div key={deposit.id} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold text-white">৳ {Number(deposit.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{deposit.paymentMethod} • TrxID: {deposit.transactionId}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{new Date(deposit.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                        deposit.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        deposit.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {deposit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                This user has not made any deposit requests yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
