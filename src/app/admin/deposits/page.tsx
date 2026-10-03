"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, Search, Loader2, CheckCircle, XCircle, Clock , Trash2} from "lucide-react";

type Deposit = {
  id: string;
  amount: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    phone: string;
  };
};

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const res = await fetch("/api/admin/deposits");
      const data = await res.json();
      if (res.ok) {
        setDeposits(data.deposits || []);
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
        body: JSON.stringify({ entity: "Deposit", ids })
      });
      if (res.ok) {
        setDeposits(prev => prev.filter((item: any) => !ids.includes(item.id)));
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
    if (selectedIds.length === deposits.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deposits.map((item: any) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Calculate Stats
  const totalDeposits = deposits.length;
  const pendingCount = deposits.filter(d => d.status === 'pending').length;
  const approvedAmount = deposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + Number(d.amount), 0);
  const rejectedAmount = deposits.filter(d => d.status === 'rejected').reduce((acc, d) => acc + Number(d.amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <ArrowDownToLine className="text-blue-400" /> Deposit Requests
          </h2>
          <p className="text-gray-400">Manage and approve user deposits.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Requests" 
          value={totalDeposits.toString()} 
          icon={<ArrowDownToLine className="text-blue-400" size={24} />} 
        />
        <StatCard 
          title="Pending Approvals" 
          value={pendingCount.toString()} 
          icon={<Clock className="text-yellow-400" size={24} />} 
        />
        <StatCard 
          title="Approved Amount" 
          value={`৳ ${approvedAmount.toFixed(2)}`} 
          icon={<CheckCircle className="text-green-400" size={24} />} 
        />
        <StatCard 
          title="Rejected Amount" 
          value={`৳ ${rejectedAmount.toFixed(2)}`} 
          icon={<XCircle className="text-red-400" size={24} />} 
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
              placeholder="Search TrxID..."
              className="w-full bg-black border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-600 bg-black/50 accent-red-500 w-4 h-4" checked={deposits.length > 0 && selectedIds.length === deposits.length} onChange={toggleSelectAll} /></th><th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium">TrxID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    <p className="text-gray-500">Loading deposits...</p>
                  </td>
                </tr>
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No deposits found.
                  </td>
                </tr>
              ) : (
                deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 w-12"><input type="checkbox" className="rounded border-gray-600 bg-black/50 accent-red-500 w-4 h-4" checked={selectedIds.includes(deposit.id)} onChange={() => toggleSelect(deposit.id)} /></td>
<td className="p-4"><input type="checkbox" className="rounded border-gray-600 bg-black/50 accent-red-500 w-4 h-4" checked={selectedIds.includes(deposit.id)} onChange={() => toggleSelect(deposit.id)} /></td><td className="p-4">
                      <p className="font-medium text-white">{deposit.user?.fullName}</p>
                      <p className="text-xs text-gray-500">{deposit.user?.phone}</p>
                    </td>
                    <td className="p-4 font-bold text-white">৳ {Number(deposit.amount).toFixed(2)}</td>
                    <td className="p-4 text-gray-300">{deposit.paymentMethod}</td>
                    <td className="p-4 text-gray-300 font-mono text-xs">{deposit.transactionId}</td>
                    <td className="p-4 text-gray-400 text-xs">{new Date(deposit.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        deposit.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                        deposit.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {deposit.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/admin/deposits/${deposit.id}`}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-medium"
                      >
                        View Details
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
