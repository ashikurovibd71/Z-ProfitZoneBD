"use client";

import { useState, useEffect } from "react";
import { ArrowUpFromLine, History, Loader2, Download, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WithdrawalsPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    method: 'bkash',
    accountNumber: '',
    amount: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [histRes, userRes] = await Promise.all([
        fetch('/api/user/withdrawals'),
        fetch('/api/auth/me')
      ]);

      if (histRes.ok) {
        const hData = await histRes.json();
        setHistory(hData.history || []);
      }
      if (userRes.ok) {
        const uData = await userRes.json();
        setBalance(Number(uData.user.walletBalance));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const pendingAmount = history.filter(h => h.status === 'pending').reduce((sum, h) => sum + Number(h.amount), 0);
    const availableToWithdraw = Math.max(0, balance - pendingAmount);
    
    if (Number(formData.amount) > availableToWithdraw) {
      alert(`You cannot request more than your available balance (৳${availableToWithdraw.toFixed(2)})`);
      return;
    }
    if (Number(formData.amount) < 50) {
      alert("Minimum withdrawal amount is ৳50.00");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Withdrawal request submitted successfully! Wait for admin approval.");
        setFormData({ method: 'bkash', accountNumber: '', amount: '' });
        fetchData();
      } else {
        alert(data.error || "Failed to submit request");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate pending amount to show accurate "Available to withdraw"
  const pendingAmount = history.filter(h => h.status === 'pending').reduce((sum, h) => sum + Number(h.amount), 0);
  const availableToWithdraw = Math.max(0, balance - pendingAmount);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Request Section */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2 flex items-center gap-2">
          <ArrowUpFromLine className="text-purple-400" /> Withdraw Funds
        </h2>
        <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8">Request a withdrawal to your mobile banking or bank account.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ArrowUpFromLine size={120} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 relative z-10">Available Balance</h3>
            
            <div className="mb-6 md:mb-8 relative z-10">
              <p className="text-3xl md:text-4xl font-black text-purple-400 mb-2">৳ {balance.toFixed(2)}</p>
              {pendingAmount > 0 && (
                <p className="text-sm text-yellow-500 flex items-center gap-1">
                  <AlertCircle size={14} /> ৳ {pendingAmount.toFixed(2)} is currently pending. 
                  <br />Max available to request: ৳ {availableToWithdraw.toFixed(2)}
                </p>
              )}
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                <select 
                  value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Account Number</label>
                <input 
                  type="text" required placeholder="01XXXXXXXXX"
                  value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount (৳)</label>
                <input 
                  type="number" required min="50" max={availableToWithdraw} step="0.01"
                  value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder={`Max ৳${availableToWithdraw.toFixed(2)}`}
                />
                {Number(formData.amount) > 0 && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg text-sm border border-white/10">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Requested Amount:</span>
                      <span>৳ {Number(formData.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-400 mb-1">
                      <span>Withdrawal Fee (6%):</span>
                      <span>- ৳ {(Number(formData.amount) * 0.06).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold border-t border-white/10 pt-1 mt-1">
                      <span>You will receive:</span>
                      <span className="text-green-400">৳ {(Number(formData.amount) * 0.94).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" disabled={submitting || availableToWithdraw <= 0}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Request'}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 p-6 md:p-8 rounded-3xl flex flex-col justify-center">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4">Withdrawal Rules</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">1</div>
                <p>Minimum withdrawal amount is ৳50.00.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">2</div>
                <p>Requests are manually reviewed and processed within 24-48 hours by administrators.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">3</div>
                <p>Make sure your account number is correct. We are not responsible for wrong numbers.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">4</div>
                <p>Once approved, the amount will be deducted from your wallet balance and you can download an invoice.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <History className="text-gray-400" /> Withdrawal History
          </h2>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-sm">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Account</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-purple-500">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Loading history...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No withdrawal history found.
                    </td>
                  </tr>
                ) : (
                  history.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-bold text-white uppercase">{item.method}</td>
                      <td className="p-4 text-gray-300 font-mono tracking-wider">{item.accountNumber}</td>
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
                        {item.status === 'approved' ? (
                          <button 
                            onClick={() => {
                              const dateStr = new Date(item.createdAt).toLocaleString();
                              const amountNum = Number(item.amount);
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
                                  <title>Withdrawal Invoice - ${item.id}</title>
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
                                        <p style="margin-top:5px; color:#777;">Official Withdrawal Receipt</p>
                                      </div>
                                      <div class="header-right">
                                        <h2 style="margin:0; font-size: 24px; color:#333;">PAYOUT SLIP</h2>
                                        <p><strong>Transaction ID:</strong><br/>${item.id}</p>
                                      </div>
                                    </div>
                                    
                                    <div class="details-row">
                                      <div class="details-col">
                                        <p><strong>Date Processed:</strong> ${dateStr}</p>
                                        <p><strong>Account Info:</strong> ${item.method.toUpperCase()} - ${item.accountNumber}</p>
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
                                      <p>Thank you for working with ProfitZoneBD!</p>
                                      <p>This is a computer-generated receipt and requires no signature.</p>
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
                            }}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors inline-block"
                            title="Download Invoice"
                          >
                            <Download size={16} />
                          </button>
                        ) : (
                          <span className="text-gray-500 italic text-xs">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
