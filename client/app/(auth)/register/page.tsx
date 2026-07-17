"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Lock, Mail, Store, Compass, ArrowLeft } from "lucide-react";

// สร้าง Component แยกเพื่อใช้ useSearchParams
function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role") || "operator";

    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // ดึงค่าจากฟอร์มโดยใช้ FormData
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
            name: formData.get("name") || formData.get("storeName"), // ดึงชื่อเล่นหรือชื่อร้าน
            role: role,
            storeName: role === "operator" ? formData.get("storeName") : null,
        };

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                // สมัครสำเร็จ
                alert("🎉 สมัครสมาชิกสำเร็จแล้วจ้าว!\n\nระบบได้ส่งอีเมลยืนยันตัวตน (Confirmation Email) ไปยังที่อยู่อีเมลของคุณเรียบร้อยแล้ว กรุณาเข้าตรวจสอบในกล่องข้อความ (รวมถึงโฟลเดอร์จดหมายขยะ/Spam) และคลิกเปิดลิงก์ยืนยันตัวตนก่อนทำการเข้าสู่ระบบนะจ๊ะ");
                router.push("/login");
            } else {
                // กรณีเกิด Error (เช่น อีเมลซ้ำ)
                alert(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
            }
        } catch (error) {
            console.error("Register connection error:", error);
            alert("ไม่สามารถเชื่อมต่อกับระบบได้");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleRegister} className="space-y-4">
            {/* หัวข้อเปลี่ยนตาม Role */}
            <div className="mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {role === "operator" ? <Store className="text-emerald-600" /> : <Compass className="text-amber-600" />}
                    สมัครสมาชิก{role === "operator" ? "ผู้ประกอบการ" : "นักท่องเที่ยว"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน NAN LOCAL-VERSE</p>
            </div>

            {/* ฟิลด์พื้นฐาน (เหมือนกันทุก role) */}
            <div className="space-y-3">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" name="email" placeholder="อีเมลของคุณ" className="w-full pl-9 py-2.5 bg-slate-50 border rounded-xl text-xs" required />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" name="password" placeholder="รหัสผ่าน" className="w-full pl-9 py-2.5 bg-slate-50 border rounded-xl text-xs" required />
                </div>

                {/* ฟิลด์เฉพาะ Role */}
                {role === "operator" ? (
                    <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" name="storeName" placeholder="ชื่อร้านค้า / ชื่อโฮมสเตย์" className="w-full pl-9 py-2.5 bg-slate-50 border rounded-xl text-xs" required />
                    </div>
                ) : (
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" name="name" placeholder="ชื่อเล่นของคุณ" className="w-full pl-9 py-2.5 bg-slate-50 border rounded-xl text-xs" required />
                    </div>
                )}
            </div>

            <button disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                {loading ? "กำลังสมัคร..." : "สร้างบัญชีผู้ใช้งาน"}
            </button>
        </form>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <button onClick={() => window.history.back()} className="text-slate-400 hover:text-slate-700 mb-6 flex items-center gap-1 text-xs font-semibold">
                    <ArrowLeft size={14} /> ย้อนกลับ
                </button>
                {/* Suspense จำเป็นเพราะใช้ useSearchParams */}
                <Suspense fallback={<div>Loading...</div>}>
                    <RegisterForm />
                </Suspense>
            </div>
        </div>
    );
}