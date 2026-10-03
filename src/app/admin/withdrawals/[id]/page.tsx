"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Check, X, Download, User as UserIcon, Banknote, Calendar, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

export default function WithdrawalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawal();
  }, [id]);

  const fetchWithdrawal = async () => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`);
      const d = await res.json();
      if (res.ok) {
        setData(d.withdrawal);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this withdrawal as ${status}?`)) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchWithdrawal();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process withdrawal");
      }
    } catch (e) {
      alert("An error occurred");
    }
  };

  const downloadInvoice = () => {
    if (!data || data.status !== 'approved') return;
    
    const dateStr = new Date(data.createdAt).toLocaleString();
    const amountNum = Number(data.amount);
    const fee = amountNum * 0.06;
    const payable = amountNum - fee;
    const price = payable.toFixed(2);
    const requestedPrice = amountNum.toFixed(2);
    const feeStr = fee.toFixed(2);
    
    const invoiceHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Admin Withdrawal Invoice - ${data.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px; color: #333; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #9333ea; font-size: 32px; }
          .header-right { text-align: right; color: #666; }
          .details-row { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .details-col { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th, td { padding: 15px; border-bottom: 1px solid #ddd; text-align: left; }
          th { background-color: #f8f8f8; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 18px; }
          .total-row td { border-bottom: none; border-top: 2px solid #eee; }
          .footer { text-align: center; color: #888; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
          .status { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #dcfce7; color: #166534; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <h1>ProfitZoneBD</h1>
              <p style="margin-top:5px; color:#777;">Official Withdrawal Receipt (Admin Copy)</p>
            </div>
            <div class="header-right">
              <h2 style="margin:0; font-size: 24px; color:#333;">PAYOUT SLIP</h2>
              <p><strong>Transaction ID:</strong><br/>${data.id}</p>
            </div>
          </div>
          
          <div class="details-row">
            <div class="details-col">
              <p><strong>Date Processed:</strong> ${dateStr}</p>
              <p><strong>User:</strong> ${data.user.fullName} (${data.user.phone})</p>
              <p><strong>Account Info:</strong> ${data.method.toUpperCase()} - ${data.accountNumber}</p>
            </div>
            <div class="details-col" style="text-align:right;">
              <p><strong>Status:</strong> <span class="status">PAID OUT</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Earnings Withdrawal</strong><br/><span style="color:#666; font-size:13px;">Requested: ৳ ${requestedPrice} (Fee: ৳ ${feeStr})</span></td>
                <td style="text-align:right;">৳ ${price}</td>
              </tr>
              <tr class="total-row">
                <td style="text-align:right;">Total Transferred:</td>
                <td style="text-align:right; color:#9333ea;">৳ ${price}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Admin Generated Receipt - ProfitZoneBD</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const newWindow = window.open('', '_blank');
    if(newWindow) {
      newWindow.document.write(invoiceHtml);
      newWindow.document.close();
      setTimeout(() => {
        newWindow.print();
      }, 250);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-purple-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-gray-400">Loading withdrawal details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Not Found</h2>
        <Link href="/admin/withdrawals" className="text-purple-400 hover:underline">
          Go back to requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/withdrawals"
          className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Withdrawal Details</h2>
          <p className="text-gray-400">Transaction ID: {data.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Banknote size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Requested Amount</p>
                <h3 className="text-2xl font-black text-gray-400 line-through">৳ {Number(data.amount).toFixed(2)}</h3>
                <p className="text-sm text-red-400 font-medium mt-1">Platform Fee (6%): - ৳ {(Number(data.amount) * 0.06).toFixed(2)}</p>
                <div className="h-px bg-white/10 my-2"></div>
                <p className="text-sm text-green-400 font-medium mb-1">Payable Amount (Send this)</p>
                <h3 className="text-5xl font-black text-purple-400">৳ {(Number(data.amount) * 0.94).toFixed(2)}</h3>
              </div>
              <div className={`px-4 py-2 rounded-xl font-bold uppercase ${
                data.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                data.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                {data.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Banknote size={16} /> Payment Method</p>
                <p className="text-lg font-bold text-white uppercase">{data.method}</p>
              </div>
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><ShieldCheck size={16} /> Account Number</p>
                <p className="text-lg font-bold text-white tracking-widest">{data.accountNumber}</p>
              </div>
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 col-span-2">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Calendar size={16} /> Request Date</p>
                <p className="text-lg font-medium text-white">{new Date(data.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          
          <div className="bg-[#111] border border-white/10 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserIcon className="text-purple-400" /> User Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400 text-sm">Name</span>
                <span className="font-medium">{data.user.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400 text-sm">Phone</span>
                <span className="font-medium">{data.user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Current Balance</span>
                <span className="font-bold text-green-400">৳ {Number(data.user.walletBalance).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4">Actions</h3>
            
            {data.status === 'pending' ? (
              <div className="space-y-3">
                <button 
                  onClick={() => handleProcess('approved')}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={20} /> Approve & Deduct Balance
                </button>
                <button 
                  onClick={() => handleProcess('rejected')}
                  className="w-full py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} /> Reject Request
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Approving this request will automatically deduct ৳{Number(data.amount).toFixed(2)} from the user's wallet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <p className={`font-bold uppercase ${data.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                    {data.status}
                  </p>
                </div>
                
                {data.status === 'approved' && (
                  <button 
                    onClick={downloadInvoice}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={20} /> Download Invoice
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
