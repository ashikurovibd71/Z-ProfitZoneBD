"use client";

import { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon, History, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

type DepositRecord = {
  id: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
};

export default function WalletPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  
  // Deposit state
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [lastDigitNumber, setLastDigitNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  
  // Data state
  const [walletBalance, setWalletBalance] = useState(0);
  const [history, setHistory] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  
  const numAmount = typeof amount === 'number' ? amount : 0;
  const netDeposit = numAmount;

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await fetch("/api/user/wallet");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(Number(data.walletBalance) || 0);
        setHistory(data.depositHistory || []);
      }
    } catch (err) {
      console.error("Failed to fetch wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;
    
    setSubmitLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/user/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod,
          lastDigitNumber,
          transactionId
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Deposit request submitted successfully! Pending admin approval.");
        setAmount("");
        setLastDigitNumber("");
        setTransactionId("");
        fetchWalletData(); // refresh history
      } else {
        setError(data.error || "Failed to submit deposit request");
      }
    } catch (err) {
      setError("An error occurred while submitting.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2">Wallet & Transactions</h2>
          <p className="text-sm md:text-base text-gray-400">Manage your deposits securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Balances & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-indigo-400/30">
            <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[50px] rounded-full"></div>
            <div className="flex items-center gap-3 text-indigo-100 mb-2 relative z-10">
              <WalletIcon size={20} />
              <span className="font-medium">Available Balance</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
              ৳ {walletBalance.toFixed(2)}
            </h3>
            
            <div className="flex gap-4 relative z-10">
              <button 
                onClick={() => setActiveTab("DEPOSIT")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "DEPOSIT" ? "bg-white text-indigo-900" : "bg-black/20 text-white hover:bg-black/30"}`}
              >
                <ArrowDownLeft size={18} /> Deposit
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction Form & History */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-8 rounded-3xl bg-[#111] border border-white/10 relative">
            <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
              Deposit Funds
            </h3>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleDeposit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Amount (BDT)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                  <input 
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors text-lg font-medium"
                    placeholder="Enter amount..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Account Last 4 Digits</label>
                <input 
                  type="text"
                  maxLength={4}
                  value={lastDigitNumber}
                  onChange={(e) => setLastDigitNumber(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                  placeholder="e.g. 5678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Transaction ID (TrxID)</label>
                <input 
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                  placeholder="Enter TrxID..."
                  required
                />
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount Sent</span>
                  <span className="font-medium">৳ {numAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Admin Fee (0%)</span>
                  <span className="text-green-400">৳ 0.00</span>
                </div>
                <div className="h-px bg-white/10 w-full my-2"></div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-300">Wallet will receive</span>
                  <span className="font-bold text-green-400 text-lg">
                    ৳ {netDeposit.toFixed(2)}
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitLoading || numAmount <= 0}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2"
              >
                {submitLoading && <Loader2 className="animate-spin" size={20} />}
                Submit Deposit Request
              </button>
            </form>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
              <History size={20} className="text-gray-400" /> Deposit History
            </h3>
            
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No deposit history found.</p>
              ) : (
                history.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                        <ArrowDownLeft size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium">Deposit via {tx.paymentMethod}</h4>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">TrxID: {tx.transactionId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">
                        + ৳{Number(tx.amount).toFixed(2)}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        tx.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
