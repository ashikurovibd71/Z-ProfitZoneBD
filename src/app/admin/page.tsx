"use client";

import { useState, useEffect } from "react";
import { Users, ShieldAlert, ArrowDownToLine, ArrowUpFromLine, Activity, Loader2 } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  pendingKyc: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  depositFees: number;
  withdrawalFees: number;
  totalRevenue: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch admin stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h2>
          <p className="text-gray-400">System metrics and pending action items.</p>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toString()} 
          icon={<Users className="text-blue-400" size={24} />} 
          trend="Total Platform Users"
        />
        <StatCard 
          title="Pending KYC" 
          value={stats.pendingKyc.toString()} 
          icon={<ShieldAlert className="text-orange-400" size={24} />} 
          urgent={stats.pendingKyc > 0}
        />
        <StatCard 
          title="Pending Deposits" 
          value={stats.pendingDeposits.toString()} 
          icon={<ArrowDownToLine className="text-green-400" size={24} />} 
          urgent={stats.pendingDeposits > 0}
        />
        <StatCard 
          title="Pending Withdrawals" 
          value={stats.pendingWithdrawals.toString()} 
          icon={<ArrowUpFromLine className="text-red-400" size={24} />} 
          urgent={stats.pendingWithdrawals > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Actions / Alerts */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-indigo-400" /> Action Required
          </h3>
          <div className="space-y-4">
            <ActionItem title="Review KYC Applications" count={stats.pendingKyc} href="/admin/kyc-approvals" color="orange" />
            <ActionItem title="Approve Deposits (6% Fee auto-applied)" count={stats.pendingDeposits} href="/admin/deposits" color="green" />
            <ActionItem title="Process Withdrawals" count={stats.pendingWithdrawals} href="/admin/withdrawals" color="red" />
          </div>
        </div>

        {/* System Revenue Overview */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20">
          <h3 className="text-xl font-bold mb-6">System Revenue (6% Fees)</h3>
          <div className="space-y-6">
            <div>
              <p className="text-gray-400 text-sm">Total Deposit Fees Collected</p>
              <p className="text-3xl font-bold text-white">৳ {stats.depositFees.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Withdrawal Fees Collected</p>
              <p className="text-3xl font-bold text-white">৳ {stats.withdrawalFees.toFixed(2)}</p>
            </div>
            <div className="h-px w-full bg-white/10 my-4"></div>
            <div>
              <p className="text-gray-300 font-medium">Total Platform Revenue</p>
              <p className="text-4xl font-bold text-green-400">৳ {stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, urgent }: { title: string; value: string; icon: React.ReactNode; trend?: string; urgent?: boolean }) {
  return (
    <div className={`p-6 rounded-3xl bg-white/5 border relative overflow-hidden group transition-colors ${urgent ? 'border-orange-500/30' : 'border-white/10 hover:border-white/20'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-black/40 rounded-2xl">{icon}</div>
        {trend && <span className="text-xs font-medium text-gray-400">{trend}</span>}
        {urgent && <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold rounded animate-pulse">ACTION NEEDED</span>}
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function ActionItem({ title, count, href, color }: { title: string; count: number; href: string; color: string }) {
  const colors: Record<string, string> = {
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
  };

  return (
    <a href={href} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${colors[color]}`}>
      <span className="font-medium">{title}</span>
      <span className="px-3 py-1 bg-black/40 rounded-full font-bold">{count}</span>
    </a>
  );
}
