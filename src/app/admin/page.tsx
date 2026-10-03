import { Users, ShieldAlert, ArrowDownToLine, ArrowUpFromLine, Activity } from "lucide-react";

export default function AdminOverview() {
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
          value="1,248" 
          icon={<Users className="text-blue-400" size={24} />} 
          trend="+12 today"
        />
        <StatCard 
          title="Pending KYC" 
          value="45" 
          icon={<ShieldAlert className="text-orange-400" size={24} />} 
          urgent={true}
        />
        <StatCard 
          title="Pending Deposits" 
          value="12" 
          icon={<ArrowDownToLine className="text-green-400" size={24} />} 
          urgent={true}
        />
        <StatCard 
          title="Pending Withdrawals" 
          value="8" 
          icon={<ArrowUpFromLine className="text-red-400" size={24} />} 
          urgent={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Actions / Alerts */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-indigo-400" /> Action Required
          </h3>
          <div className="space-y-4">
            <ActionItem title="Review KYC Applications" count={45} href="/admin/kyc-approvals" color="orange" />
            <ActionItem title="Approve Deposits (6% Fee auto-applied)" count={12} href="/admin/deposits" color="green" />
            <ActionItem title="Process Withdrawals" count={8} href="/admin/withdrawals" color="red" />
          </div>
        </div>

        {/* System Revenue Overview */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20">
          <h3 className="text-xl font-bold mb-6">System Revenue (6% Fees)</h3>
          <div className="space-y-6">
            <div>
              <p className="text-gray-400 text-sm">Total Deposit Fees Collected</p>
              <p className="text-3xl font-bold text-white">৳ 124,500.00</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Withdrawal Fees Collected</p>
              <p className="text-3xl font-bold text-white">৳ 86,200.00</p>
            </div>
            <div className="h-px w-full bg-white/10 my-4"></div>
            <div>
              <p className="text-gray-300 font-medium">Total Platform Revenue</p>
              <p className="text-4xl font-bold text-green-400">৳ 210,700.00</p>
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
