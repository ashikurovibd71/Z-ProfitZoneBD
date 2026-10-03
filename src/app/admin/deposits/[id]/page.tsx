"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, CheckCircle, XCircle, Printer, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DepositDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [deposit, setDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDeposit();
  }, [resolvedParams.id]);

  const fetchDeposit = async () => {
    try {
      const res = await fetch("/api/admin/deposits");
      const data = await res.json();
      if (res.ok) {
        const found = data.deposits.find((d: any) => d.id === resolvedParams.id);
        setDeposit(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this deposit?`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/deposits/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`Deposit successfully ${status}!`);
        fetchDeposit(); // refresh
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      alert("Error processing request");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-12 text-gray-400">Loading details...</div>;
  }

  if (!deposit) {
    return <div className="text-center p-12 text-red-400">Deposit not found.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Hide this top bar when printing */}
      <div className="flex items-center justify-between print:hidden">
        <Link 
          href="/admin/deposits" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Back to List
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm"
        >
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* Invoice Area (This will be printed) */}
      <div className="bg-white text-black rounded-2xl overflow-hidden print:shadow-none print:border-none shadow-2xl relative" id="invoice-area">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-start print:bg-gray-100 print:text-black">
          <div>
            <h1 className="text-3xl font-bold mb-1">INVOICE</h1>
            <p className="text-indigo-200 print:text-gray-500 text-sm">Deposit Receipt</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">ProfitZoneBD</h2>
            <p className="text-indigo-200 print:text-gray-500 text-sm">profitzonebd.com</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="flex justify-between border-b border-gray-200 pb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="font-bold text-lg">{deposit.user.fullName}</p>
              <p className="text-gray-600 text-sm">Phone: {deposit.user.phone}</p>
              {deposit.user.email && <p className="text-gray-600 text-sm">Email: {deposit.user.email}</p>}
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Invoice Details</h3>
              <p className="text-sm"><span className="text-gray-500">Invoice No:</span> <span className="font-mono">{deposit.id.split('-')[0].toUpperCase()}</span></p>
              <p className="text-sm"><span className="text-gray-500">Date:</span> {new Date(deposit.createdAt).toLocaleDateString()}</p>
              <p className="text-sm">
                <span className="text-gray-500">Status:</span> 
                <span className={`ml-2 font-bold uppercase ${
                  deposit.status === 'pending' ? 'text-yellow-600' : 
                  deposit.status === 'rejected' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {deposit.status}
                </span>
              </p>
            </div>
          </div>

          <div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-sm text-gray-500 uppercase">Description</th>
                  <th className="py-3 text-sm text-gray-500 uppercase">Method</th>
                  <th className="py-3 text-sm text-gray-500 uppercase">TrxID</th>
                  <th className="py-3 text-sm text-gray-500 uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium">Wallet Deposit</td>
                  <td className="py-4 text-gray-600">{deposit.paymentMethod} (Last 4: {deposit.lastDigitNumber})</td>
                  <td className="py-4 font-mono text-xs text-gray-500">{deposit.transactionId}</td>
                  <td className="py-4 text-right font-bold">৳ {Number(deposit.amount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>৳ {Number(deposit.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Fee</span>
                <span>৳ 0.00</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl text-indigo-600">৳ {Number(deposit.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-8 text-center text-gray-400 text-sm">
            Thank you for using ProfitZoneBD. For support, please contact us.
          </div>
        </div>
      </div>

      {/* Admin Actions (Hidden in Print) */}
      {deposit.status === 'pending' && (
        <div className="flex gap-4 print:hidden">
          <button 
            onClick={() => handleAction('approved')}
            disabled={actionLoading}
            className="flex-1 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} /> Approve & Credit Wallet
          </button>
          
          <button 
            onClick={() => handleAction('rejected')}
            disabled={actionLoading}
            className="flex-1 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <XCircle size={20} /> Reject Deposit
          </button>
        </div>
      )}
    </div>
  );
}
