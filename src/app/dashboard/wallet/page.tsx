"use client";

import { useState, useEffect } from "react";
import { 
  ArrowDownLeft, Wallet as WalletIcon, History, 
  Loader2, Copy, Check, CheckCircle2, AlertCircle, Info, Sparkles, Building
} from "lucide-react";
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

interface PaymentMethodOption {
  id: string;
  name: string;
  number: string;
  type: string;
  instruction: string;
  minDeposit?: number;
  maxDeposit?: number;
  isActive: boolean;
}

const PRESET_AMOUNTS = [100, 300, 500, 1000, 2500, 5000];

export default function WalletPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  
  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Deposit Form state
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
    fetchWalletAndMethods();
  }, []);

  const fetchWalletAndMethods = async () => {
    try {
      const [resWallet, resMethods] = await Promise.all([
        fetch("/api/user/wallet"),
        fetch("/api/public/payment-methods")
      ]);

      if (resWallet.status === 401) {
        router.push("/login");
        return;
      }

      if (resWallet.ok) {
        const dataWallet = await resWallet.json();
        setWalletBalance(Number(dataWallet.walletBalance) || 0);
        setHistory(dataWallet.depositHistory || []);
      }

      if (resMethods.ok) {
        const dataMethods = await resMethods.json();
        const active = (dataMethods.methods || []).filter((m: PaymentMethodOption) => m.isActive !== false);
        setPaymentMethods(active);
        if (active.length > 0) {
          setSelectedMethod(active[0]);
          setPaymentMethod(active[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to fetch wallet data or methods:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = (m: PaymentMethodOption) => {
    setSelectedMethod(m);
    setPaymentMethod(m.name);
    setError("");
  };

  const handleCopy = (num: string) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (selectedMethod?.minDeposit && numAmount < selectedMethod.minDeposit) {
      setError(`Minimum deposit for ${selectedMethod.name} is ৳${selectedMethod.minDeposit}`);
      return;
    }

    if (selectedMethod?.maxDeposit && numAmount > selectedMethod.maxDeposit) {
      setError(`Maximum deposit for ${selectedMethod.name} is ৳${selectedMethod.maxDeposit}`);
      return;
    }
    
    setSubmitLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/user/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod: selectedMethod ? selectedMethod.name : paymentMethod,
          lastDigitNumber,
          transactionId
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Deposit Request Submitted!',
          text: 'Your deposit is pending approval. Once verified by admin, your balance will be updated.',
          confirmButtonColor: '#4f46e5'
        });
        setAmount("");
        setLastDigitNumber("");
        setTransactionId("");
        
        // Refresh wallet and history
        const resWallet = await fetch("/api/user/wallet");
        if (resWallet.ok) {
          const dataWallet = await resWallet.json();
          setWalletBalance(Number(dataWallet.walletBalance) || 0);
          setHistory(dataWallet.depositHistory || []);
        }
      } else {
        setError(data.error || "Failed to submit deposit request");
      }
    } catch (err) {
      setError("An error occurred while submitting.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper for brand badge styling
  const getMethodTheme = (name: string, isSelected: boolean) => {
    const lower = name.toLowerCase();
    if (lower.includes("bkash")) {
      return {
        badge: "bg-pink-500/20 text-pink-400 border-pink-500/30",
        border: isSelected ? "border-pink-500 bg-pink-500/[0.08] shadow-[0_0_25px_rgba(236,72,153,0.25)]" : "border-white/10 hover:border-pink-500/50 bg-[#121212]",
        accent: "text-pink-400"
      };
    }
    if (lower.includes("nagad")) {
      return {
        badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        border: isSelected ? "border-orange-500 bg-orange-500/[0.08] shadow-[0_0_25px_rgba(249,115,22,0.25)]" : "border-white/10 hover:border-orange-500/50 bg-[#121212]",
        accent: "text-orange-400"
      };
    }
    if (lower.includes("rocket")) {
      return {
        badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        border: isSelected ? "border-purple-500 bg-purple-500/[0.08] shadow-[0_0_25px_rgba(168,85,247,0.25)]" : "border-white/10 hover:border-purple-500/50 bg-[#121212]",
        accent: "text-purple-400"
      };
    }
    if (lower.includes("upay")) {
      return {
        badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        border: isSelected ? "border-amber-500 bg-amber-500/[0.08] shadow-[0_0_25px_rgba(245,158,11,0.25)]" : "border-white/10 hover:border-amber-500/50 bg-[#121212]",
        accent: "text-amber-400"
      };
    }
    return {
      badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      border: isSelected ? "border-cyan-500 bg-cyan-500/[0.08] shadow-[0_0_25px_rgba(6,182,212,0.25)]" : "border-white/10 hover:border-cyan-500/50 bg-[#121212]",
      accent: "text-cyan-400"
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2 text-white">Wallet & Deposits</h2>
          <p className="text-sm md:text-base text-gray-400">Add funds to your account securely via mobile banking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Balances & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-indigo-400/30">
            <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 text-indigo-100 mb-2 relative z-10">
              <WalletIcon size={20} />
              <span className="font-medium">Available Balance</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10 tracking-tight">
              ৳ {walletBalance.toFixed(2)}
            </h3>
            
            <div className="flex gap-4 relative z-10">
              <button 
                onClick={() => setActiveTab("DEPOSIT")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "DEPOSIT" ? "bg-white text-indigo-900 shadow-lg" : "bg-black/20 text-white hover:bg-black/30"
                }`}
              >
                <ArrowDownLeft size={18} /> Deposit
              </button>
            </div>
          </div>

          {/* Quick Step Guide */}
          <div className="p-6 rounded-3xl bg-[#111] border border-white/10 space-y-3 text-xs text-gray-400">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Info size={16} className="text-indigo-400" />
              কীভাবে ডিপোজিট করবেন?
            </h4>
            <div className="space-y-2.5">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">1</span>
                <span>পছন্দের পেমেন্ট মেথড কার্ডটি সিলেক্ট করুন এবং একাউন্ট নাম্বারটি কপি করুন।</span>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">2</span>
                <span>আপনার বিকাশ/নগদ অ্যাপ থেকে উল্লেখিত নাম্বারে <strong>Send Money</strong> করুন।</span>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">3</span>
                <span>টাকা পাঠানোর পর ট্রানজেকশন আইডি (TrxID) ও আপনার নাম্বারের শেষ ৪ ডিজিট দিয়ে সাবমিট করুন।</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Cards, Form & History */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 md:p-8 rounded-3xl bg-[#111] border border-white/10 relative">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Sparkles size={20} className="text-indigo-400" />
              1. Select Payment Method
            </h3>
            
            {/* PAYMENT METHOD CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {paymentMethods.length === 0 ? (
                <div className="col-span-full p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-2xl text-sm">
                  বর্তমানে কোনো পেমেন্ট মেথড কনফিগার করা নেই। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।
                </div>
              ) : (
                paymentMethods.map((m) => {
                  const isSelected = selectedMethod?.id === m.id || (!selectedMethod && m.name === paymentMethod);
                  const theme = getMethodTheme(m.name, isSelected);

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMethod(m)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${theme.border}`}
                    >
                      {/* Card Header: Method Name + Type Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${theme.badge}`}>
                            {m.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-gray-300 border border-white/10">
                            {m.type}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                            <CheckCircle2 size={12} /> Selected
                          </div>
                        )}
                      </div>

                      {/* Number & Copy Button */}
                      <div className="bg-black/70 p-2.5 rounded-xl border border-white/5 flex items-center justify-between mt-1">
                        <div>
                          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Number</p>
                          <p className="font-mono font-bold text-white tracking-wider text-base">{m.number}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(m.number);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1 text-xs font-medium"
                          title="Copy Number"
                        >
                          {copiedNumber && selectedMethod?.id === m.id ? (
                            <span className="text-green-400 flex items-center gap-1 font-bold">
                              <Check size={14} /> Copied!
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Copy size={14} /> Copy
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Instruction brief */}
                      {m.instruction && (
                        <p className="text-[11px] text-gray-400 mt-2.5 line-clamp-1">
                          {m.instruction}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* SELECTED METHOD BANNER */}
            {selectedMethod && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-black border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Send Money To ({selectedMethod.name}):</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-medium">{selectedMethod.type}</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-white tracking-wider">
                    {selectedMethod.number}
                  </p>
                  {selectedMethod.instruction && (
                    <p className="text-xs text-indigo-200/80">
                      👉 {selectedMethod.instruction}
                    </p>
                  )}
                  {(selectedMethod.minDeposit || selectedMethod.maxDeposit) && (
                    <p className="text-[11px] text-gray-400">
                      মিনিমাম ডিপোজিট: ৳{selectedMethod.minDeposit || 100} {selectedMethod.maxDeposit ? `| সর্বোচ্চ: ৳${selectedMethod.maxDeposit}` : ''}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(selectedMethod.number)}
                  className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 shrink-0"
                >
                  {copiedNumber ? <Check size={16} className="text-green-300" /> : <Copy size={16} />}
                  {copiedNumber ? "Number Copied!" : "Copy Number"}
                </button>
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white border-t border-white/10 pt-6">
              2. Enter Deposit Details
            </h3>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleDeposit} className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Amount (BDT) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">৳</span>
                  <input 
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors text-lg font-bold"
                    placeholder="Enter deposit amount..."
                    required
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        amount === val
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      ৳{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender Account Last 4 Digits */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Your Sender Account Last 4 Digits <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  maxLength={11}
                  value={lastDigitNumber}
                  onChange={(e) => setLastDigitNumber(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="e.g. 5678 (যে নাম্বার থেকে টাকা পাঠিয়েছেন)"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">যে নাম্বার থেকে টাকা পাঠিয়েছেন তার শেষ ৪ ডিজিট বা পুরো নম্বর দিন।</p>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Transaction ID (TrxID) <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono uppercase"
                  placeholder="e.g. BL90XTR56Y"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">এসএমএস বা অ্যাপ থেকে প্রাপ্ত TrxID টি এখানে লিখুন।</p>
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Deposit Amount</span>
                  <span className="font-medium text-white">৳ {numAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Admin Charge (0%)</span>
                  <span className="text-green-400 font-semibold">৳ 0.00</span>
                </div>
                <div className="h-px bg-white/10 w-full my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-300">Wallet will receive</span>
                  <span className="font-bold text-green-400 text-xl">
                    ৳ {netDeposit.toFixed(2)}
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitLoading || numAmount <= 0}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all shadow-[0_0_25px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2"
              >
                {submitLoading && <Loader2 className="animate-spin" size={20} />}
                Submit Deposit Request
              </button>
            </form>
          </div>

          {/* Deposit History */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2 text-white">
              <History size={20} className="text-gray-400" /> Deposit History
            </h3>
            
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-6 text-sm">No deposit history found.</p>
              ) : (
                history.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <ArrowDownLeft size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">Deposit via {tx.paymentMethod}</h4>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                        <p className="text-xs font-mono text-gray-500 mt-1">TrxID: {tx.transactionId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400 text-base">
                        + ৳{Number(tx.amount).toFixed(2)}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                        tx.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
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
