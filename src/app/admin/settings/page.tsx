"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Lock, Save, Loader2, CheckCircle2, 
  ShieldAlert, CreditCard, Plus, Trash2, Edit2, 
  Copy, Check, AlertCircle, Sparkles, Wallet
} from "lucide-react";
import Swal from 'sweetalert2';

interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  type: string; // Personal, Agent, Merchant, Bank
  instruction: string;
  minDeposit?: number;
  maxDeposit?: number;
  isActive: boolean;
}

const METHOD_PRESETS = [
  { name: "bKash", color: "from-pink-600 to-rose-600", bgBadge: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  { name: "Nagad", color: "from-orange-600 to-amber-600", bgBadge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { name: "Rocket", color: "from-purple-600 to-indigo-600", bgBadge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { name: "Upay", color: "from-amber-600 to-yellow-600", bgBadge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { name: "Bank Transfer", color: "from-blue-600 to-cyan-600", bgBadge: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "payment">("payment");

  // Admin Profile State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    referrerBonus: "0",
    refereeBonus: "0"
  });
  
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [savingPayment, setSavingPayment] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [methodForm, setMethodForm] = useState<PaymentMethod>({
    id: "",
    name: "bKash",
    number: "",
    type: "Personal",
    instruction: "Send Money (Personal) করবেন। রেফারেন্সে আপনার ফোন নম্বর দিন।",
    minDeposit: 100,
    maxDeposit: 25000,
    isActive: true
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // 1. Fetch settings & profile
      const [resSettings, resProfile, resMethods] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/auth/me"),
        fetch("/api/admin/payment-methods")
      ]);

      let settingsMap: Record<string, string> = {};
      if (resSettings.ok) {
        const dataSettings = await resSettings.json();
        settingsMap = dataSettings.settings || {};
      }

      if (resProfile.ok) {
        const dataUser = await resProfile.json();
        setFormData({
          fullName: dataUser.user?.fullName || "",
          email: dataUser.user?.email || "",
          phone: dataUser.user?.phone || "",
          password: "",
          referrerBonus: settingsMap['referrerBonus'] || "0",
          refereeBonus: settingsMap['refereeBonus'] || "0"
        });
      }

      if (resMethods.ok) {
        const dataMethods = await resMethods.json();
        setPaymentMethods(dataMethods.methods || []);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setProfileSuccess(false);
    setProfileError("");
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    setProfileError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });

      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: 'referrerBonus', value: formData.referrerBonus })
      });

      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: 'refereeBonus', value: formData.refereeBonus })
      });

      if (res.ok) {
        setProfileSuccess(true);
        setFormData(prev => ({ ...prev, password: "" }));
      } else {
        const data = await res.json();
        setProfileError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setProfileError("An error occurred while updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Payment Methods Actions
  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setMethodForm({
      id: `pm_${Date.now()}`,
      name: "bKash",
      number: "",
      type: "Personal",
      instruction: "Send Money (Personal) করবেন। রেফারেন্সে আপনার ফোন নম্বর দিন।",
      minDeposit: 100,
      maxDeposit: 25000,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (method: PaymentMethod, index: number) => {
    setEditingIndex(index);
    setMethodForm({ ...method });
    setIsModalOpen(true);
  };

  const handleSaveMethodForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodForm.name.trim() || !methodForm.number.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Method Name and Account Number are required!'
      });
      return;
    }

    const updated = [...paymentMethods];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...methodForm };
    } else {
      updated.push({
        ...methodForm,
        id: methodForm.id || `pm_${Date.now()}`
      });
    }

    setIsModalOpen(false);
    await saveMethodsToBackend(updated, editingIndex !== null ? "Payment method updated!" : "New payment method added!");
  };

  const handleToggleActive = async (index: number) => {
    const updated = [...paymentMethods];
    updated[index].isActive = !updated[index].isActive;
    await saveMethodsToBackend(updated, `Status set to ${updated[index].isActive ? 'Active' : 'Inactive'}`);
  };

  const handleDeleteMethod = async (index: number) => {
    const target = paymentMethods[index];
    const confirm = await Swal.fire({
      title: 'Delete Payment Method?',
      text: `Are you sure you want to delete "${target.name}" (${target.number})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, Delete'
    });

    if (!confirm.isConfirmed) return;

    const updated = paymentMethods.filter((_, i) => i !== index);
    await saveMethodsToBackend(updated, 'Payment method deleted successfully!');
  };

  const saveMethodsToBackend = async (newMethods: PaymentMethod[], successMsg: string) => {
    setSavingPayment(true);
    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methods: newMethods })
      });

      if (res.ok) {
        setPaymentMethods(newMethods);
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: successMsg,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.error || 'Failed to save payment methods.'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while saving.'
      });
    } finally {
      setSavingPayment(false);
    }
  };

  const handleCopyNumber = (number: string, id: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodBadgeStyle = (name: string) => {
    const preset = METHOD_PRESETS.find(p => p.name.toLowerCase() === name.toLowerCase());
    return preset ? preset.bgBadge : "bg-zinc-800 text-zinc-300 border-zinc-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">System & Payment Settings</h2>
          <p className="text-gray-400 text-sm">
            Configure deposit payment methods, admin account, and referral bonus rules.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("payment")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "payment"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CreditCard size={18} />
            <span>Deposit Methods</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-mono">
              {paymentMethods.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <User size={18} />
            <span>Admin & Referral</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: PAYMENT METHODS ================= */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-red-950/30 via-black to-zinc-950 p-6 rounded-3xl border border-red-500/20">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Wallet className="text-red-500" size={24} />
                User Deposit Payment Methods
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                এখানে যে মেথডগুলো Active রাখবেন, ইউজার ডিপোজিট পেইজে সেই নাম্বারগুলো Card আকারে দেখতে পাবে এবং টাকা পাঠাবে।
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-105"
            >
              <Plus size={18} />
              Add Payment Method
            </button>
          </div>

          {/* List of Payment Methods */}
          {paymentMethods.length === 0 ? (
            <div className="text-center py-16 bg-[#111] border border-white/10 rounded-3xl p-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <CreditCard size={32} />
              </div>
              <h4 className="text-lg font-bold text-white">No Payment Methods Configured</h4>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                ইউজার যাতে ডিপোজিট করতে পারে সেজন্য বিকাশ, নগদ অথবা রকেট নম্বর যুক্ত করুন।
              </p>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all"
              >
                <Plus size={16} /> Add First Method
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method, idx) => {
                const badgeStyle = getMethodBadgeStyle(method.name);
                return (
                  <div
                    key={method.id || idx}
                    className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                      method.isActive
                        ? "bg-[#111] border-white/10 hover:border-red-500/40 shadow-xl"
                        : "bg-[#0c0c0c] border-white/5 opacity-60"
                    }`}
                  >
                    {/* Top Row: Method Name & Type & Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeStyle}`}>
                            {method.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-gray-300 border border-white/10">
                            {method.type}
                          </span>
                        </div>

                        {/* Active Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(idx)}
                          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                            method.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${method.isActive ? "bg-green-400 animate-pulse" : "bg-zinc-500"}`}></span>
                          {method.isActive ? "Active" : "Inactive"}
                        </button>
                      </div>

                      {/* Number Display with Copy */}
                      <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Account Number</p>
                          <p className="text-xl font-mono font-bold text-white tracking-wide">{method.number}</p>
                        </div>
                        <button
                          onClick={() => handleCopyNumber(method.number, method.id)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                          title="Copy Number"
                        >
                          {copiedId === method.id ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                        </button>
                      </div>

                      {/* Instructions */}
                      {method.instruction && (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-4 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                          💡 {method.instruction}
                        </p>
                      )}

                      {/* Deposit Limits */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                        {method.minDeposit !== undefined && (
                          <span>Min: <strong className="text-white">৳{method.minDeposit}</strong></span>
                        )}
                        {method.maxDeposit !== undefined && (
                          <span>Max: <strong className="text-white">৳{method.maxDeposit}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleOpenEditModal(method, idx)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMethod(idx)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PROFILE & REFERRAL ================= */}
      {activeTab === "profile" && (
        <div className="bg-[#111] border border-red-500/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[50px] rounded-full pointer-events-none"></div>
          
          {profileSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-3 relative z-10">
              <CheckCircle2 size={20} />
              <span className="font-medium">Admin settings updated successfully!</span>
            </div>
          )}

          {profileError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl relative z-10">
              <span className="font-medium">{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6 relative z-10">
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-8">
              <ShieldAlert size={20} className="shrink-0" />
              <p className="text-sm font-medium">You are editing the super admin credentials and system-wide referral bonuses.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Admin Phone (Unchangeable)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  disabled
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Admin Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                  placeholder="Enter full name"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Recovery Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter email address"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Referral Settings */}
            <div className="pt-6 border-t border-white/10 mt-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-500 flex items-center gap-2">
                <span className="text-2xl">🎁</span> Referral Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Referrer Bonus (৳) - যিনি রেফার করবেন</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                    <input 
                      type="number" 
                      name="referrerBonus"
                      value={formData.referrerBonus}
                      onChange={handleProfileChange}
                      placeholder="e.g. 50"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Referee Bonus (৳) - যিনি জয়েন করবেন</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                    <input 
                      type="number" 
                      name="refereeBonus"
                      value={formData.refereeBonus}
                      onChange={handleProfileChange}
                      placeholder="e.g. 20"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="pt-6 border-t border-white/10 mt-6">
              <h3 className="text-lg font-bold mb-4 text-white">Change Admin Password</h3>
              <label className="block text-sm font-medium text-gray-400 mb-2">New Password (leave empty to keep current)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleProfileChange}
                  placeholder="Enter new strong password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                  minLength={4}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={savingProfile}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all mt-8"
            >
              {savingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {savingProfile ? "Updating Settings..." : "Save Settings"}
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PAYMENT METHOD ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="text-red-500" size={22} />
                  {editingIndex !== null ? "Edit Payment Method" : "Add Payment Method"}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Fill in the payment method details for user deposits.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMethodForm} className="space-y-4">
              {/* Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Quick Select Method
                </label>
                <div className="flex flex-wrap gap-2">
                  {METHOD_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setMethodForm({ ...methodForm, name: p.name })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        methodForm.name.toLowerCase() === p.name.toLowerCase()
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Name (can type custom) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Method Name *
                </label>
                <input
                  type="text"
                  value={methodForm.name}
                  onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                  placeholder="e.g. bKash, Nagad, Rocket, Bank"
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Account Number / Phone *
                </label>
                <input
                  type="text"
                  value={methodForm.number}
                  onChange={(e) => setMethodForm({ ...methodForm, number: e.target.value })}
                  placeholder="e.g. 017XXXXXXXX or Bank AC"
                  className="w-full bg-black border border-white/10 rounded-xl p-3 font-mono text-white text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              {/* Account Type */}
              <div className="grid grid-cols-3 gap-2">
                {(["Personal", "Agent", "Merchant"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMethodForm({ ...methodForm, type })}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      methodForm.type === type
                        ? "bg-red-600/20 border-red-500 text-red-400"
                        : "bg-black border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Deposit Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Min Deposit (৳)
                  </label>
                  <input
                    type="number"
                    value={methodForm.minDeposit ?? ""}
                    onChange={(e) => setMethodForm({ ...methodForm, minDeposit: Number(e.target.value) })}
                    placeholder="e.g. 100"
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Max Deposit (৳)
                  </label>
                  <input
                    type="number"
                    value={methodForm.maxDeposit ?? ""}
                    onChange={(e) => setMethodForm({ ...methodForm, maxDeposit: Number(e.target.value) })}
                    placeholder="e.g. 25000"
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Instruction */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Instruction / Note for User
                </label>
                <textarea
                  rows={2}
                  value={methodForm.instruction}
                  onChange={(e) => setMethodForm({ ...methodForm, instruction: e.target.value })}
                  placeholder="e.g. Send Money (Personal) করবেন। রেফারেন্সে আপনার ফোন নম্বর দিন।"
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-white/10">
                <span className="text-sm font-medium text-gray-300">Method Status</span>
                <button
                  type="button"
                  onClick={() => setMethodForm({ ...methodForm, isActive: !methodForm.isActive })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    methodForm.isActive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {methodForm.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  {savingPayment ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {editingIndex !== null ? "Update Method" : "Add Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
