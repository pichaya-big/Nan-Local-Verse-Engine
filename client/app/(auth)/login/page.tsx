"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Compass, Lock, User, ArrowRight, Sparkles, MessageCircle, Globe, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function LoginPage() {
    const router = useRouter();
    // สถานะเลือกบทบาท: 'operator' = ผู้ประกอบการ, 'tourist' = นักท่องเที่ยว
    const [role, setRole] = useState<"operator" | "tourist">("operator");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. ลงชื่อเข้าใช้ด้วย Email และ Password
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert(error.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                setLoading(false);
                return;
            }

            if (!data.user) {
                alert("ไม่พบข้อมูลผู้ใช้");
                setLoading(false);
                return;
            }

            // 2. ดึงข้อมูล Profile เพื่อตรวจดูบทบาท (Role) ในระบบจริง
            const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("role")
                .eq("id", data.user.id)
                .single();

            if (profileError || !profile) {
                alert("ไม่พบข้อมูลโปรไฟล์ผู้ใช้งานในระบบ");
                setLoading(false);
                return;
            }

            // 3. เซ็ต Cookie 'auth_token' เพื่อให้ผ่านการตรวจสอบของ Middleware
            if (data.session) {
                document.cookie = `auth_token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}`;
            }

            // 4. นำทางผู้ใช้ไปยังหน้าเพจที่ตรงตาม Role จริงในฐานข้อมูล
            if (profile.role === "operator") {
                router.push("/dashboard");
            } else {
                router.push("/quests");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialClick = () => {
        alert("ระบบล็อกอินผ่านโซเชียลยังไม่เปิดใช้งาน กรุณากดสมัครสมาชิกด้านล่างก่อน");
    };

    return (
        <div className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">

            {/* 🌌 แสงออร่าหลังฉากแบบซอฟท์ๆ เพิ่มความน่าตื่นเต้น */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none transition-all" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none transition-all" />

            <div className="w-full max-w-md space-y-6 relative z-10">

                {/* หัวข้อระบบหลัก */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-white border border-slate-200/80 rounded-2xl text-emerald-650 shadow-md mb-1 animate-bounce [animation-duration:3s]">
                        <Sparkles className="w-6 h-6 text-emerald-650" />
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 bg-clip-text text-transparent tracking-tight">
                        NAN LOCAL-VERSE
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        แพลตฟอร์มขับเคลื่อนเศรษฐกิจเมืองน่านด้วยพลัง AI & Gamification
                    </p>
                </div>

                {/* กล่องล็อกอินหลัก โทนสว่างคลีนๆ มีมิติ */}
                <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-5">

                    {/* 🎛️ TAB SWITCHER: สลับบทบาทผู้ใช้งาน */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-255">
                        <button
                            type="button"
                            onClick={() => setRole("operator")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${role === "operator"
                                ? "bg-white text-emerald-700 shadow-sm border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            <Store className="w-3.5 h-3.5 text-emerald-600" />
                            ผู้ประกอบการ
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("tourist")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${role === "tourist"
                                ? "bg-white text-amber-700 shadow-sm border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            <Compass className="w-3.5 h-3.5 text-amber-600" />
                            นักท่องเที่ยว
                        </button>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xs font-bold text-slate-700">
                            {role === "operator"
                                ? "เข้าสู่ระบบจัดการร้านค้า & เสกแคมเปญ AI"
                                : "เข้าสู่ระบบกระดานเกมผจญภัยเมืองน่าน"}
                        </h2>
                    </div>

                    {/* 🌟 ช่องทางการล็อกอินด่วน (Social Login Integration) */}
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={handleSocialClick}
                            className="w-full flex items-center justify-center gap-2.5 py-2 rounded-xl text-xs font-bold bg-[#06C755] text-white hover:bg-[#05b34c] transition-all shadow-sm"
                        >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            เข้าสู่ระบบด้วย LINE Account
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={handleSocialClick}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all bg-white"
                            >
                                <Globe className="w-3.5 h-3.5 text-blue-500" /> Google
                            </button>
                            <button
                                type="button"
                                onClick={handleSocialClick}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all bg-white"
                            >
                                <svg className="w-3.5 h-3.5 text-blue-600 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                        </div>
                    </div>

                    {/* เส้นแบ่งทางเลือก */}
                    <div className="flex items-center my-3">
                        <div className="flex-1 border-t border-slate-200"></div>
                        <span className="px-3 text-[10px] text-slate-400 font-mono uppercase">หรือใช้บัญชีระบบ</span>
                        <div className="flex-1 border-t border-slate-200"></div>
                    </div>

                    {/* ฟอร์มกรอก Username/Password ดั้งเดิม */}
                    <form onSubmit={handleLogin} className="space-y-3.5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">อีเมลผู้ใช้งาน</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="your-email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">รหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-450 hover:text-slate-650 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* ปุ่มล็อกอินหลัก */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 mt-4 ${role === "operator"
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-700/10"
                                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 shadow-amber-500/10"
                                }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    เข้าสู่ระบบระบบผจญภัยน่าน
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </form>
                    {/* แทนที่เส้นแบ่งและฟอร์มเดิม ด้วยโครงสร้างนี้ */}
                    <div className="space-y-4">
                        {/* ปุ่ม Social */}
                        <button
                            type="button"
                            onClick={handleSocialClick}
                            className="w-full py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-xs font-bold"
                        >
                            <Globe className="w-4 h-4 text-blue-500" /> สมัครสมาชิกด้วย Google
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 border-t border-slate-200"></div>
                            <span className="text-[10px] text-slate-400">หรือ</span>
                            <div className="flex-1 border-t border-slate-200"></div>
                        </div>

                        {/* ปุ่ม Register ใหม่ */}
                        <div className="text-center text-xs text-slate-600">
                            ยังไม่มีบัญชี?{" "}
                            <button
                                onClick={() => router.push(`/register?role=${role}`)}
                                className="text-emerald-600 font-bold hover:underline"
                            >
                                สมัครสมาชิกที่นี่
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}