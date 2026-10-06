"use client";

import Link from "next/link";
import { Home, ListTodo, Wallet, User as UserIcon, LogOut, Package, ArrowUpFromLine, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [initial, setInitial] = useState<string>("U");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setBalance(Number(data.user.walletBalance) || 0);
          setInitial(data.user.fullName.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error("Failed to fetch user data");
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 border-r border-white/10 bg-black flex-col justify-between">
        <div>
          <div className="p-6 flex items-center gap-2 border-b border-white/10">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-lg shadow-yellow-500/20" />
            <span className="text-xl font-bold tracking-tight">ProfitZoneBD</span>
          </div>

          <nav className="p-4 space-y-2">
            <NavItem href="/dashboard" icon={<Home size={20} />} label="Overview" />
            <NavItem href="/dashboard/packages" icon={<Package size={20} />} label="Packages" />
            <NavItem href="/dashboard/tasks" icon={<ListTodo size={20} />} label="Tasks" />
            <NavItem href="/dashboard/wallet" icon={<Wallet size={20} />} label="Wallet" />
            <NavItem href="/dashboard/withdrawals" icon={<ArrowUpFromLine size={20} />} label="Withdrawals" />
            <NavItem href="/dashboard/kyc" icon={<ShieldAlert size={20} />} label="KYC Verification" />
            <NavItem href="/dashboard/profile" icon={<UserIcon size={20} />} label="Profile" />
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/50 backdrop-blur-md sticky top-0 z-20">
          <h1 className="text-base md:text-lg font-medium text-gray-200 truncate pr-2 flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="md:hidden w-6 h-6 rounded-full object-cover shadow-lg shadow-yellow-500/20" />
            Dashboard
          </h1>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <span className="text-xs md:text-sm text-gray-400 hidden sm:inline">Balance:</span>
            <span className="font-bold text-green-400 text-sm md:text-base">৳ {balance.toFixed(2)}</span>
            <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-500 rounded-full ml-1 md:ml-4 flex items-center justify-center text-xs md:text-sm font-medium shrink-0">{initial}</div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8 relative z-0 w-full">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50 flex items-center justify-around p-2 pb-safe overflow-x-auto">
        <MobileNavItem href="/dashboard" icon={<Home size={20} />} label="Home" />
        <MobileNavItem href="/dashboard/packages" icon={<Package size={20} />} label="Packages" />
        <MobileNavItem href="/dashboard/tasks" icon={<ListTodo size={20} />} label="Tasks" />
        <MobileNavItem href="/dashboard/wallet" icon={<Wallet size={20} />} label="Wallet" />
        <MobileNavItem href="/dashboard/withdrawals" icon={<ArrowUpFromLine size={20} />} label="Withdraw" />
        <MobileNavItem href="/dashboard/profile" icon={<UserIcon size={20} />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  // In a real app you'd use usePathname from next/navigation to determine active state. 
  // We'll keep it simple for now since it's just layout UI.
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10"
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center justify-center w-full p-2 text-gray-400 hover:text-white active:scale-95 transition-transform"
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-medium truncate">{label}</span>
    </Link>
  );
}
