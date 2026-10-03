"use client";

import Link from "next/link";
import { LayoutDashboard, Users, ShieldAlert, ArrowDownToLine, ArrowUpFromLine, Settings, LogOut, Package, ListTodo, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.user?.role !== 'admin') {
          router.push('/dashboard');
        } else {
          setIsAuthorized(true);
        }
      } catch (e) {
        console.error(e);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      router.push('/login');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex h-screen bg-[#050505] text-white items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white print:bg-white print:h-auto print:text-black">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black flex flex-col justify-between print:hidden">
        <div>
          <div className="p-6 flex items-center gap-2 border-b border-white/10 bg-indigo-950/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <span className="text-xl font-bold tracking-tight text-red-100">Admin Panel</span>
          </div>

          <nav className="p-4 space-y-2">
            <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
            <NavItem href="/admin/users" icon={<Users size={20} />} label="Manage Users" />
            <NavItem href="/admin/kyc-approvals" icon={<ShieldAlert size={20} />} label="KYC Approvals" />
            <NavItem href="/admin/deposits" icon={<ArrowDownToLine size={20} />} label="Deposit Requests" />
            <NavItem href="/admin/withdrawals" icon={<ArrowUpFromLine size={20} />} label="Withdrawal Requests" />
            <NavItem href="/admin/packages" icon={<Package size={20} />} label="Manage Packages" />
            <NavItem href="/admin/tasks" icon={<ListTodo size={20} />} label="Manage Tasks" />
            <NavItem href="/admin/settings" icon={<Settings size={20} />} label="System Settings" />
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors">
            <LogOut size={20} />
            Admin Logout
          </button>
        </div>
      </aside>

      {/* Admin Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative print:overflow-visible print:block">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10 print:hidden">
          <h1 className="text-lg font-medium text-gray-200">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold">
              ADMIN MODE
            </span>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">A</div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 relative z-0 print:overflow-visible print:p-0">
          {/* Ambient glow for admin */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none print:hidden"></div>
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active 
          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
