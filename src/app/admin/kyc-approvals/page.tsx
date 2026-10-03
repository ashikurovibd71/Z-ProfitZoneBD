"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Loader2, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

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

export default function KYCApprovalsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users.filter((u: User) => u.role !== "admin"));
      }
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Calculate Stats
  const totalUsers = users.length;
  const pendingKYC = users.filter(u => u.kycStatus === 'pending').length;
  const approvedKYC = users.filter(u => u.kycStatus === 'approved').length;
  const rejectedKYC = users.filter(u => u.kycStatus === 'rejected').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">KYC Approvals</h2>
          <p className="text-gray-400">Review and approve user registrations and documents.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={totalUsers.toString()} 
          icon={<Users className="text-blue-400" size={24} />} 
        />
        <StatCard 
          title="Pending KYC" 
          value={pendingKYC.toString()} 
          icon={<Clock className="text-yellow-400" size={24} />} 
        />
        <StatCard 
          title="Approved KYC" 
          value={approvedKYC.toString()} 
          icon={<CheckCircle className="text-green-400" size={24} />} 
        />
        <StatCard 
          title="Rejected KYC" 
          value={rejectedKYC.toString()} 
          icon={<XCircle className="text-red-400" size={24} />} 
        />
      </div>

      <div className="bg-[#121c22]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 font-medium text-gray-300">Name</th>
                <th className="p-4 font-medium text-gray-300">Contact</th>
                <th className="p-4 font-medium text-gray-300">Registered</th>
                <th className="p-4 font-medium text-gray-300">Status</th>
                <th className="p-4 font-medium text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{user.fullName}</td>
                    <td className="p-4 text-sm text-gray-400">
                      {user.phone}
                      {user.email && <div className="text-xs opacity-70">{user.email}</div>}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.kycStatus === 'approved' ? 'bg-green-500/10 text-green-400' :
                        user.kycStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {user.kycStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/kyc-approvals/${user.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye size={16} /> View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-black/40 rounded-2xl">{icon}</div>
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}
