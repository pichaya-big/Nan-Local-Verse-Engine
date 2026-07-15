"use client";

import React, { useState, useEffect } from "react";
import { Compass, Moon, Sun, User, LogOut } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function QuestsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [theme, setTheme] = useState<"dark" | "light">("light");
    const [userName, setUserName] = useState("กำลังโหลด...");

    // ⚡ เพิ่มจุดนี้: เมื่อมีการเปลี่ยน State ให้ไปเปลี่ยน Class ที่ระดับโครงสร้างเว็บเลย
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        return () => {
            root.classList.remove("dark");
        };
    }, [theme]);

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from("users")
                        .select("name")
                        .eq("id", user.id)
                        .single();
                    if (profile && profile.name) {
                        setUserName(profile.name);
                    } else {
                        setUserName(user.email || "นักท่องเที่ยว");
                    }
                } else {
                    setUserName("บุคคลทั่วไป");
                }
            } catch (err) {
                console.error("Error loading userName:", err);
                setUserName("นักท่องเที่ยว");
            }
        };
        fetchUserName();
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

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

    return (
        // เปลี่ยนตรงนี้ให้ใช้ class dark จาก tailwind คุมด้วย
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme}`}>
            <div className="w-full min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">

                {/* Navbar */}
                <header className="h-16 border-b sticky top-0 z-40 backdrop-blur-md bg-white/80 border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 transition-colors">
                    <div className="max-w-4xl mx-auto h-full px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                                <Compass className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-black tracking-tight text-sm md:text-base bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                                    NAN LOCAL-VERSE
                                </span>
                                <span className="text-[9px] block text-slate-450 dark:text-slate-400 font-mono">PLAYER APP</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 bg-slate-100 border-slate-200 text-slate-650 dark:bg-slate-800 dark:border-slate-700 dark:text-amber-400"
                            >
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                <span className="text-xs font-medium">{userName}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450 flex items-center justify-center"
                                title="ออกจากระบบ"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 w-full">
                    {children}
                </main>
             </div>
        </div>
    );
}