"use client";

import { useState, useEffect } from "react";
import { ArrowUpFromLine, Loader2 , Trash2} from "lucide-react";
import Link from "next/link";
import Swal from 'sweetalert2';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch("/api/admin/withdrawals");
      const data = await res.json();
      if (res.ok) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (e) {
      console.error(e);
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
        body: JSON.stringify({ entity: "Withdrawal", ids })
      });
      if (res.ok) {
        setWithdrawals(prev => prev.filter((item: any) => !ids.includes(item.id)));
        setSelectedIds([]);
      } else {
        const data = await res.json();
        Swal.fire("Failed to delete: " + data.error);
      }
    } catch (err) {
      Swal.fire("Error deleting items");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === withdrawals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(withdrawals.map((item: any) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const totalPendingAmount = withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + Number(w.amount), 0);
  const totalApprovedAmount = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + Number(w.amount), 0);
  const totalRejectedAmount = withdrawals.filter(w => w.status === 'rejected').reduce((sum, w) => sum + Number(w.amount), 0);
  
  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const approvedCount = withdrawals.filter(w => w.status === 'approved').length;
  const rejectedCount = withdrawals.filter(w => w.status === 'rejected').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <ArrowUpFromLine className="text-purple-400" /> Withdrawal Requests
        </h2>
        <p className="text-gray-400">Manage user withdrawal requests here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/20 p-6 rounded-3xl">
          <p className="text-sm text-yellow-300 font-medium mb-1">Pending Withdrawals</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">৳ {totalPendingAmount.toFixed(2)}</h3>
            <span className="text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-bold">{pendingCount} Requests</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/20 p-6 rounded-3xl">
          <p className="text-sm text-green-300 font-medium mb-1">Total Paid (Approved)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">৳ {totalApprovedAmount.toFixed(2)}</h3>
            <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">{approvedCount} Users</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/20 p-6 rounded-3xl">
          <p className="text-sm text-red-300 font-medium mb-1">Total Rejected</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">৳ {totalRejectedAmount.toFixed(2)}</h3>
            <span className="text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold">{rejectedCount} Requests</span>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-600 bg-black/50 accent-red-500 w-4 h-4" checked={withdrawals.length > 0 && selectedIds.length === withdrawals.length} onChange={toggleSelectAll} /></th><th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium">Account Number</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-purple-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading requests...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 w-12"><input type="checkbox" className="rounded border-gray-600 bg-black/50 accent-red-500 w-4 h-4" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
<td className="p-4 text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <p className="font-bold text-white">{item.user?.fullName}</p>
                      <p className="text-xs text-gray-500">{item.user?.phone}</p>
                    </td>
                    <td className="p-4 font-bold text-white uppercase">{item.method}</td>
                    <td className="p-4 text-purple-400 font-mono tracking-wider">{item.accountNumber}</td>
                    <td className="p-4 font-bold text-white">৳ {Number(item.amount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        item.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                        item.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/withdrawals/${item.id}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-block font-medium text-xs"
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
