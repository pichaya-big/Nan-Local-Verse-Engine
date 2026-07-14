"use client";

import React, { useState, useEffect } from "react";
import {
    Store,
    MapPin,
    Bell,
    CheckCircle,
    Save,
    MessageSquare,
    Key,
    Loader2
} from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";

export default function SettingsPage() {
    // สถานะฟอร์มข้อมูลร้านค้า
    const [shopName, setStoreName] = useState("");
    const [district, setDistrict] = useState("pua");
    const [shopType, setBusinessType] = useState("homestay");

    // รหัสร้านค้าและผู้ใช้
    const [storeId, setStoreId] = useState<number | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isPageLoading, setIsPageLoading] = useState(true);

    // สถานะการเปิด/ปิดการแจ้งเตือน AI
    const [aiAlerts, setAiAlerts] = useState(true);
    const [flashCampaign, setFlashCampaign] = useState(true);

    // ข้อความแจ้งเตือนบันทึกสำเร็จ
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    // โหลดข้อมูลร้านค้าจริงจาก Supabase
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                // 1. ดึงผู้ใช้งานปัจจุบัน
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsPageLoading(false);
                    return;
                }
                setUserId(user.id);

                // 2. ดึงข้อมูล User Profile เพื่อเอา associated_store_id
                const { data: profile, error: profileError } = await supabase
                    .from("users")
                    .select("associated_store_id")
                    .eq("id", user.id)
                    .single();

                if (profileError || !profile || !profile.associated_store_id) {
                    setIsPageLoading(false);
                    return;
                }
                const assocStoreId = profile.associated_store_id;
                setStoreId(assocStoreId);

                // 3. ดึงข้อมูลร้านค้าจริงจากตาราง stores
                const { data: store, error: storeError } = await supabase
                    .from("stores")
                    .select("name, type, district")
                    .eq("id", assocStoreId)
                    .single();

                if (store && !storeError) {
                    setStoreName(store.name);
                    setDistrict(store.district || "pua");
                    setBusinessType(store.type || "homestay");
                }
            } catch (err) {
                console.error("Error loading settings:", err);
            } finally {
                setIsPageLoading(false);
            }
        };

        fetchStoreData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopName.trim()) {
            alert("กรุณากรอกชื่อร้านค้า");
            return;
        }
        setSaving(true);

        try {
            if (storeId) {
                // 1. อัปเดตข้อมูลร้านค้าเดิม
                const { error } = await supabase
                    .from("stores")
                    .update({
                        name: shopName,
                        type: shopType,
                        district: district
                    })
                    .eq("id", storeId);

                if (error) throw error;
            } else if (userId) {
                // 2. หากยังไม่มีร้านค้า ให้สร้างร้านค้าใหม่ก่อน
                const { data: newStore, error: storeError } = await supabase
                    .from("stores")
                    .insert({
                        name: shopName,
                        type: shopType,
                        district: district
                    })
                    .select("id")
                    .single();

                if (storeError) throw storeError;

                // อัปเดต associated_store_id ใน users profile
                const { error: userError } = await supabase
                    .from("users")
                    .update({ associated_store_id: newStore.id })
                    .eq("id", userId);

                if (userError) throw userError;

                setStoreId(newStore.id);
            }

            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        } catch (err) {
            console.error("Error saving settings:", err);
            alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setSaving(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">กำลังโหลดการตั้งค่า...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-6 space-y-8 transition-colors duration-200 text-card-foreground">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    ⚙️ ตั้งค่าระบบ
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    จัดการข้อมูลผู้ประกอบการ และตั้งค่าโมเดลตัวช่วยการตลาด AI ประจำร้านของคุณ
                </p>
            </div>

            {savedSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-sm transition-all animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>บันทึกการตั้งค่าทั้งหมดเรียบร้อยแล้ว ระบบ AI ได้ทำการอัปเดตบริบท (Context) ของร้านค้าแล้ว</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* ส่วนที่ 1: ข้อมูลผู้ประกอบการ */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">ข้อมูลร้านค้า / วิสาหกิจชุมชน</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อสถานประกอบการ</label>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setStoreName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ประเภทธุรกิจ</label>
                            <select
                                value={shopType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >
                                <option value="homestay">ที่พัก / โฮมสเตย์</option>
                                <option value="cafe">ร้านอาหาร / คาเฟ่</option>
                                <option value="souvenir">ร้านของฝาก / ผลิตภัณฑ์ชุมชน</option>
                                <option value="workshop">กิจกรรมการท่องเที่ยวเชิงสร้างสรรค์</option>
                            </select>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">พื้นที่ตั้งประกอบการ (เพื่อดึง Weather & TAT API แหล่งท่องเที่ยวใกล้เคียง)</label>
                            </div>
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >
                                <option value="เมืองน่าน">อำเภอเมืองน่าน</option>
                                <option value="ปัว">อำเภอปัว</option>
                                <option value="บ่อเกลือ">อำเภอบ่อเกลือ</option>
                                <option value="เชียงกลาง">อำเภอเชียงกลาง</option>
                                <option value="นาน้อย">อำเภอนาน้อย</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ส่วนที่ 2: ตั้งค่าการแจ้งเตือนและการทำงานของ AI อัจฉริยะ */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">ระบบแจ้งเตือนการตลาด AI (Smart Alert)</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-slate-900 dark:text-white block">การแนะนำตามสภาพอากาศเรียลไทม์</label>
                                <span className="text-xs text-slate-500 dark:text-slate-400">อนุญาตให้ AI แจ้งเตือนสร้างแคมเปญทันทีเมื่อมีฝนตกหนักหรืออากาศเปลี่ยนแปลงในพื้นที่เพื่อดึงดูดลูกค้าหลบฝน</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={aiAlerts}
                                onChange={(e) => setAiAlerts(e.target.checked)}
                                className="w-10 h-6 bg-slate-200 dark:bg-slate-700 checked:bg-emerald-600 rounded-full cursor-pointer accent-emerald-600"
                            />
                        </div>

                        <div className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-slate-900 dark:text-white block">แคมเปญด่วน Gamification (Flash Quests)</label>
                                <span className="text-xs text-slate-500 dark:text-slate-400">แนะนำเควสชุมชนอัตโนมัติเมื่อปริมาณนักท่องเที่ยวช่วง Low Season ในพื้นที่ต่ำกว่าเกณฑ์สถิติเฉลี่ยของ ททท.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={flashCampaign}
                                onChange={(e) => setFlashCampaign(e.target.checked)}
                                className="w-10 h-6 bg-slate-200 dark:bg-slate-700 checked:bg-emerald-600 rounded-full cursor-pointer accent-emerald-600"
                            />
                        </div>
                    </div>
                </div>

                {/* ส่วนที่ 3: ระบบเชื่อมต่อมาร์เก็ตติ้งภายนอก (Integration เผื่อสเกลจริง) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">ช่องทางการตลาดภายนอก (Social Media Integration)</h2>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        * ฟีเจอร์นี้สำหรับส่งมอบแผนการสเกลระบบ (Scalability Plan) เพื่อเชื่อมต่อ API และกดกระจายโพสต์แคมเปญลงเพจจริงได้ทันที
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-lg">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-5 h-5"
                                    >
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Facebook Page</h3>
                                    <p className="text-xs text-slate-400">ไม่ได้เชื่อมต่อ</p>
                                </div>
                            </div>
                            <button type="button" className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Connect
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-lg">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">LINE Official Account</h3>
                                    <p className="text-xs text-slate-400">ไม่ได้เชื่อมต่อ</p>
                                </div>
                            </div>
                            <button type="button" className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                                Connect
                            </button>
                        </div>
                    </div>
                </div>

                {/* ปุ่มบันทึก */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                    </button>
                </div>
            </form>
        </div>
    );
}