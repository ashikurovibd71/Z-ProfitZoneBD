"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, Loader2, ArrowRight, Wallet, Activity, CheckCircle , Trash2} from "lucide-react";

type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  kycStatus: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  walletBalance: string;
  deposits?: any[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} item(s)? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "User", ids })
      });
      if (res.ok) {
        setUsers(prev => prev.filter((item: any) => !ids.includes(item.id)));
        setSelectedIds([]);
      } else {
        const data = await res.json();
        alert("Failed to delete: " + data.error);
      }
    } catch (err) {
      alert("Error deleting items");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((item: any) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const calculateTotalDeposit = (deposits?: any[]) => {
    if (!deposits) return 0;
    return deposits
      .filter((d) => d.status === 'approved')
      .reduce((sum, d) => sum + Number(d.amount), 0);
  };

  // Stats Calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.lastLogin).length; // users who have logged in at least once
  const totalPlatformBalance = users.reduce((sum, u) => sum + Number(u.walletBalance || 0), 0);
  const totalPlatformDeposits = users.reduce((sum, u) => sum + calculateTotalDeposit(u.deposits), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <Users className="text-blue-400" /> Manage Users
          </h2>
          <p className="text-gray-400">View and manage all registered users.</p>
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
          title="Active Logins" 
          value={activeUsers.toString()} 
          icon={<Activity className="text-green-400" size={24} />} 
        />
        <StatCard 
          title="Total User Balance" 
          value={`৳ ${totalPlatformBalance.toFixed(2)}`} 
          icon={<Wallet className="text-indigo-400" size={24} />} 
        />
        <StatCard 
          title="Total Deposited" 
          value={`৳ ${totalPlatformDeposits.toFixed(2)}`} 
          icon={<CheckCircle className="text-purple-400" size={24} />} 
        />
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
          
          {selectedIds.length > 0 && (
            <button 
              onClick={() => handleDelete(selectedIds)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium mr-4 transition-colors"
            >
              <Trash2 size={16} /> Delete Selected ({selectedIds.length})
            </button>
          )}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search user name/phone..."
              className="w-full bg-black border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-600 bg-black/50 accent-red-500 w-4 h-4" checked={users.length > 0 && selectedIds.length === users.length} onChange={toggleSelectAll} /></th><th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Last Login</th>
                <th className="p-4 font-medium">Wallet Balance</th>
                <th className="p-4 font-medium">Total Deposited</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    <p className="text-gray-500">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 w-12"><input type="checkbox" className="rounded border-gray-600 bg-black/50 accent-red-500 w-4 h-4" checked={selectedIds.includes(user.id)} onChange={() => toggleSelect(user.id)} /></td>
<td className="p-4"><input type="checkbox" className="rounded border-gray-600 bg-black/50 accent-red-500 w-4 h-4" checked={selectedIds.includes(user.id)} onChange={() => toggleSelect(user.id)} /></td><td className="p-4">
                      <p className="font-medium text-white">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-400 text-xs">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 font-bold text-green-400">৳ {Number(user.walletBalance).toFixed(2)}</td>
                    <td className="p-4 font-medium text-blue-400">৳ {calculateTotalDeposit(user.deposits).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        user.kycStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        user.kycStatus === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        KYC {user.kycStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-medium"
                      >
                        Details <ArrowRight size={14} />
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
