"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  LayoutDashboard, 
  Sparkles, 
  Gamepad2, 
  Settings, 
  TreePine,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  // รายการเมนูบน Sidebar
  const menuItems = [
    { name: 'หน้าหลัก', href: '/dashboard', icon: LayoutDashboard },
    { name: 'เสกแคมเปญด้วย AI', href: '/dashboard/generator', icon: Sparkles },
    { name: 'ภารกิจชุมชน', href: '/dashboard/quests', icon: Gamepad2 },
    { name: 'ตั้งค่าระบบ', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex w-full min-h-screen transition-colors duration-200 bg-background text-foreground">
      
      {/* 1. SIDEBAR PANEL (แถบควบคุมด้านซ้าย) */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-card-border p-5 justify-between shrink-0">
        <div className="space-y-6">
          {/* โลโก้โครงการดักคะแนนความกรีน */}
          <div className="flex items-center space-x-2 px-2 text-emerald-600 dark:text-emerald-400">
            <TreePine size={28} />
            <span className="font-bold text-lg tracking-tight text-foreground">Nan Local-Verse</span>
          </div>

          {/* เมนูการนำทาง (Navigation Links) */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-text hover:text-foreground'
                  }`}
                >
                  <IconComponent size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ส่วนท้ายของ Sidebar: ปุ่มสลับโหมดและเครดิต */}
        <div className="pt-4 border-t border-card-border space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
          </button>

          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-text">โหมดธีมระบบ</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg border border-card-border bg-slate-50 dark:bg-slate-900 text-card-foreground shadow-sm hover:opacity-80 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
            </button>
          </div>
          <div className="text-[10px] text-center text-muted-text font-mono">
            One-Man Army {process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0.0'}
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (พื้นที่แสดงผลฝั่งขวา) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* แถบ Topbar สำหรับแสดงผลบน Mobile App จอเล็ก */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-card-border">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <TreePine size={24} />
            <span className="font-bold text-base text-foreground">Nan Local-Verse</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-card-border bg-slate-50 dark:bg-slate-900"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg border border-card-border bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 flex items-center justify-center"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* ตัวเรนเดอร์เนื้อหาหลักของแต่ละเพจย่อย */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}