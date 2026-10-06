"use client";

import { useState, useEffect } from "react";
import { Package as PackageIcon, ShieldCheck, Loader2, ArrowRight, History, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

type Package = {
  id: string;
  name: string;
  description: string;
  price: string;
  durationDays: number;
  dailyTasks: number;
};

type HistoryItem = {
  id: string;
  purchasePrice: string;
  purchasedAt: string;
  expiresAt: string;
  status: string;
  package: Package;
};

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgRes, histRes] = await Promise.all([
        fetch('/api/user/packages'),
        fetch('/api/user/packages/history')
      ]);

      if (pkgRes.ok) {
        const pData = await pkgRes.json();
        setPackages(pData.packages || []);
      }
      if (histRes.ok) {
        const hData = await histRes.json();
        setHistory(hData.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const buyPackage = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to buy the "${name}" package? Price will be deducted from your wallet.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });
    if (!result.isConfirmed) return;
    
    setBuying(id);
    try {
      const res = await fetch('/api/user/packages/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: id })
      });
      const data = await res.json();
      
      if (res.ok) {
        Swal.fire(data.message);
        // Refresh page to update layout wallet balance too
        window.location.reload();
      } else {
        Swal.fire(data.error || 'Purchase failed');
      }
    } catch (error) {
      Swal.fire('An error occurred');
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-indigo-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-gray-400">Loading packages...</p>
      </div>
    );
  }

  const activePackage = history.find(h => h.status === 'active');

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Current Active Package Alert */}
      {activePackage && (
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-full">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-indigo-300 font-medium mb-1 text-sm md:text-base">Active Package</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">{activePackage.package.name}</h3>
            </div>
          </div>
          <div className="text-right md:text-left bg-black/30 p-4 rounded-2xl border border-white/5 w-full md:w-auto">
            <p className="text-xs md:text-sm text-gray-400">Expires on</p>
            <p className="font-bold text-white text-base md:text-lg">{new Date(activePackage.expiresAt).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* Package Store */}
      <div>
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2 flex items-center gap-2">
            <PackageIcon className="text-indigo-400" /> Package Store
          </h2>
          <p className="text-sm md:text-base text-gray-400">Buy a package to unlock tasks and start earning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#111] rounded-3xl border border-white/10 text-gray-400">
              No packages available at the moment.
            </div>
          ) : (
            packages.map(pkg => (
              <div key={pkg.id} className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <PackageIcon size={100} />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 relative z-10">{pkg.name}</h3>
                <div className="flex items-end gap-1 mb-4 md:mb-6 relative z-10">
                  <span className="text-3xl md:text-4xl font-black text-indigo-400">৳ {Number(pkg.price).toFixed(2)}</span>
                </div>
                
                <p className="text-gray-400 text-sm mb-6 flex-1 relative z-10">{pkg.description}</p>
                
                <div className="space-y-3 mb-8 relative z-10">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span className="text-gray-400">Validity</span>
                    <span className="font-bold">{pkg.durationDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span className="text-gray-400">Daily Tasks</span>
                    <span className="font-bold">{pkg.dailyTasks}</span>
                  </div>
                </div>

                {activePackage?.package.id === pkg.id ? (
                  <button
                    disabled
                    className="w-full py-4 bg-green-500/20 text-green-400 rounded-2xl font-bold flex items-center justify-center gap-2 relative z-10 cursor-not-allowed"
                  >
                    <ShieldCheck size={20} /> Currently Active
                  </button>
                ) : (
                  <button
                    onClick={() => buyPackage(pkg.id, pkg.name)}
                    disabled={buying === pkg.id}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 relative z-10"
                  >
                    {buying === pkg.id ? <Loader2 className="animate-spin" size={20} /> : 'Buy Now'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Purchase History / Invoices */}
      <div>
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <History className="text-gray-400" /> Purchase History & Invoices
          </h2>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-sm">
                <tr>
                  <th className="p-4 font-medium">Package</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Purchased On</th>
                  <th className="p-4 font-medium">Expires On</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No purchase history found.
                    </td>
                  </tr>
                ) : (
                  history.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white">{item.package.name}</td>
                      <td className="p-4">৳ {Number(item.purchasePrice).toFixed(2)}</td>
                      <td className="p-4 text-gray-400">{new Date(item.purchasedAt).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-400">{new Date(item.expiresAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          item.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            const dateStr = new Date(item.purchasedAt).toLocaleString();
                            const expiresStr = new Date(item.expiresAt).toLocaleDateString();
                            const price = Number(item.purchasePrice).toFixed(2);
                            const invoiceHtml = `
                              <!DOCTYPE html>
                              <html lang="en">
                              <head>
                                <meta charset="UTF-8">
                                <title>Invoice - ${item.id}</title>
                                <style>
                                  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px; color: #333; }
                                  .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); background: #fff; }
                                  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                                  .header h1 { margin: 0; color: #4F46E5; font-size: 32px; }
                                  .header-right { text-align: right; color: #666; }
                                  .details-row { display: flex; justify-content: space-between; margin-bottom: 40px; }
                                  .details-col { flex: 1; }
                                  table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                                  th, td { padding: 15px; border-bottom: 1px solid #ddd; text-align: left; }
                                  th { background-color: #f8f8f8; font-weight: bold; }
                                  .total-row { font-weight: bold; font-size: 18px; }
                                  .total-row td { border-bottom: none; border-top: 2px solid #eee; }
                                  .footer { text-align: center; color: #888; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
                                  .status { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0284c7; }
                                  .status.active { background: #dcfce7; color: #166534; }
                                  .status.expired { background: #fee2e2; color: #991b1b; }
                                </style>
                              </head>
                              <body>
                                <div class="invoice-box">
                                  <div class="header">
                                    <div>
                                      <h1>ProfitZoneBD</h1>
                                      <p style="margin-top:5px; color:#777;">Official Package Receipt</p>
                                    </div>
                                    <div class="header-right">
                                      <h2 style="margin:0; font-size: 24px; color:#333;">INVOICE</h2>
                                      <p><strong>Transaction ID:</strong><br/>${item.id}</p>
                                    </div>
                                  </div>
                                  
                                  <div class="details-row">
                                    <div class="details-col">
                                      <p><strong>Date Issued:</strong> ${dateStr}</p>
                                      <p><strong>Valid Until:</strong> ${expiresStr}</p>
                                    </div>
                                    <div class="details-col" style="text-align:right;">
                                      <p><strong>Payment Status:</strong> <span style="color:#166534; font-weight:bold;">PAID</span></p>
                                      <p><strong>Package Status:</strong> <span class="status ${item.status}">${item.status.toUpperCase()}</span></p>
                                    </div>
                                  </div>

                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Description</th>
                                        <th style="text-align:center;">Duration</th>
                                        <th style="text-align:center;">Daily Tasks</th>
                                        <th style="text-align:right;">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td><strong>${item.package.name}</strong><br/><span style="color:#666; font-size:13px;">Subscription Package</span></td>
                                        <td style="text-align:center;">${item.package.durationDays} Days</td>
                                        <td style="text-align:center;">${item.package.dailyTasks}</td>
                                        <td style="text-align:right;">৳ ${price}</td>
                                      </tr>
                                      <tr class="total-row">
                                        <td colspan="3" style="text-align:right;">Total Paid:</td>
                                        <td style="text-align:right; color:#4F46E5;">৳ ${price}</td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  <div class="footer">
                                    <p>Thank you for using ProfitZoneBD!</p>
                                    <p>This is a computer-generated invoice and requires no signature.</p>
                                  </div>
                                </div>
                              </body>
                              </html>
                            `;
                            const newWindow = window.open('', '_blank');
                            if(newWindow) {
                              newWindow.document.write(invoiceHtml);
                              newWindow.document.close();
                              // Wait briefly for styles to parse before printing
                              setTimeout(() => {
                                newWindow.print();
                              }, 250);
                            }
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors inline-block"
                        >
                          <Download size={16} />
                        </button>
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
