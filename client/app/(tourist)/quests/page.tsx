"use client";

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  MapPin, 
  CloudRain, 
  CheckCircle2, 
  QrCode, 
  Coins,
  CloudSun,
  Dices,
  Navigation,
  Loader2,
  X,
  Award,
  ArrowRight,
  BookOpen,
  Store,
  Sparkles,
  Zap
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const RANDOM_IDEAS = [
  "☕ ลาเต้มะไฟจีน กาแฟสูตรพิเศษน่าน",
  "🍲 ข้าวซอยไก่ร้อนๆ หลบฝนที่ปัว",
  "🥢 ลาบคั่วเมืองน่านสูตรโบราณ",
  "🚲 ปั่นจักรยานชมหมอกยามเช้าที่ทุ่งนา"
];

// เกณฑ์การให้เลเวลนักท่องเที่ยวสไตล์ RPG ล้านนา
interface LevelThreshold {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  badge: string;
  perks: string;
  description: string;
}

const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { 
    level: 1, 
    title: "กระรอกน้อยป่าด่าน (Nan Rookie)", 
    minPoints: 0, 
    maxPoints: 199, 
    badge: "🐿️", 
    perks: "เริ่มออกท่องเที่ยวเรียนรู้ชุมชน",
    description: "นักเดินทางหน้าใหม่ที่เพิ่งเริ่มต้นก้าวเข้าสู่อ้อมกอดของผืนป่าและขุนเขาเมืองน่าน"
  },
  { 
    level: 2, 
    title: "ผู้ตามรอยดอยน่าน (Lanna Pathfinder)", 
    minPoints: 200, 
    maxPoints: 499, 
    badge: "🦌", 
    perks: "รับเหรียญโบนัสพิเศษ +5% เมื่อเช็กอินภารกิจ",
    description: "ผู้เริ่มมีความชำนาญทาง เดินทางลึกเข้าไปสู่ชุมชนดั้งเดิมและโฮมสเตย์ต่างๆ"
  },
  { 
    level: 3, 
    title: "ผู้พิทักษ์ขุนเขาน่าน (Green Guardian)", 
    minPoints: 500, 
    maxPoints: 999, 
    badge: "🦅", 
    perks: "รับเหรียญโบนัส +10%, แลกรับกระบอกน้ำรักษ์โลก Nan Eco ฟรี",
    description: "ยอดนักเดินทางหัวใจสีเขียว ผู้สนับสนุนการท่องเที่ยวคาร์บอนต่ำและกระจายรายได้"
  },
  { 
    level: 4, 
    title: "เทพอารักษ์น่านท้องถิ่น (Nan Legend)", 
    minPoints: 1000, 
    maxPoints: 999999, 
    badge: "🐉", 
    perks: "รับเหรียญโบนัส +15%, ได้รับการจารึกชื่อบนบอร์ดผู้มีพระคุณต่อชุมชน",
    description: "ตำนานผู้พิทักษ์เมืองน่านอย่างยั่งยืน เดินทางพิชิตครบทุกภารกิจกระจายรายได้สู่ร้านค้าย่อย"
  }
];

const normalizeDistrict = (dist: string | null | undefined): string => {
  if (!dist) return "ปัว";
  const d = dist.trim().toLowerCase();
  if (d === "pua" || d === "ปัว" || d.includes("ปัว")) return "ปัว";
  if (d === "boklaeo" || d === "bo_kluea" || d === "บ่อเกลือ" || d.includes("บ่อเกลือ")) return "บ่อเกลือ";
  if (d === "mueang" || d === "mueang_nan" || d === "เมืองน่าน" || d.includes("เมือง")) return "เมืองน่าน";
  if (d === "เชียงกลาง" || d === "chiang_klang" || d.includes("เชียง")) return "เชียงกลาง";
  if (d === "นาน้อย" || d === "na_noi" || d.includes("นาน้อย")) return "นาน้อย";
  return dist;
};

export default function AdvancedTouristQuestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States สำหรับข้อมูลจาก Database
  const [quests, setQuests] = useState<any[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<number>>(new Set());
  const [totalCoins, setTotalCoins] = useState(0);

  // States สำหรับ UI
  const [simulatedWeather, setSimulatedWeather] = useState<"Rainy" | "Sunny">("Rainy");
  const [radarScanning, setRadarScanning] = useState(false);
  const [luckyResult, setLuckyResult] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);

  // States สำหรับ QR Check-in Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // States สำหรับ Radar สแกนพิกัดรอบตัวจริง
  const [scannedStores, setScannedStores] = useState<any[]>([]);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

  // States สำหรับป็อปอัปแสดงการเฉลิมฉลอง Level Up 🎉
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<any>(null);

  // ดึงข้อมูลนักท่องเที่ยว เลเวล เหรียญ และเควสจาก Supabase
  const fetchTouristData = async () => {
    try {
      // 1. ดึงผู้ใช้งานปัจจุบัน
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      // 2. ดึงข้อมูลเควสที่ทำสำเร็จแล้วจากตาราง user_coupons
      const { data: coupons, error: couponError } = await supabase
        .from("user_coupons")
        .select("quest_id")
        .eq("user_id", user.id);

      // 3. ดึงข้อมูลเควสทั้งหมดจากระบบ
      const { data: dbQuests, error: questError } = await supabase
        .from("quests")
        .select("*")
        .order("created_at", { ascending: false });

      let coins = 0;
      const completedIds = new Set<number>();

      if (coupons && !couponError && dbQuests) {
        // สร้าง Map เพื่อหาแต้มของเควสแต่ละตัวอย่างรวดเร็ว
        const questPointsMap = new Map<number, number>();
        dbQuests.forEach((q: any) => {
          questPointsMap.set(Number(q.id), Number(q.points || 0));
        });

        coupons.forEach((coupon: any) => {
          if (coupon.quest_id) {
            const qId = Number(coupon.quest_id);
            completedIds.add(qId);
            const pts = questPointsMap.get(qId) || 0;
            coins += pts;
          }
        });
      }

      setCompletedQuestIds(completedIds);
      setTotalCoins(coins);

      if (dbQuests && !questError) {
        setQuests(dbQuests);
      }
    } catch (err) {
      console.error("Error loading tourist data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTouristData();
  }, []);

  // ฟังก์ชันคำนวณข้อมูลระดับเลเวลนักท่องเที่ยวแบบไดนามิกจากแต้มสะสม
  const getLevelInfo = (points: number) => {
    const current = LEVEL_THRESHOLDS.find(
      (threshold) => points >= threshold.minPoints && points <= threshold.maxPoints
    ) || LEVEL_THRESHOLDS[0];
    
    const next = LEVEL_THRESHOLDS.find((threshold) => threshold.level === current.level + 1) || null;
    
    // คำนวณเปอร์เซ็นต์ XP บาร์สะสม
    let percent = 100;
    if (next) {
      const range = next.minPoints - current.minPoints;
      const progress = points - current.minPoints;
      percent = Math.min(Math.round((progress / range) * 100), 100);
    }
    
    return { current, next, percent };
  };

  const { current: currentLevel, next: nextLevel, percent: xpPercent } = getLevelInfo(totalCoins);

  // ดักจับการสุ่มกิจกรรม
  const spinWheel = () => {
    setIsSpinning(true);
    setLuckyResult("กำลังวิเคราะห์ทริปที่เหมาะกับคุณ...");
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * RANDOM_IDEAS.length);
      setLuckyResult(RANDOM_IDEAS[randomIndex]);
      setIsSpinning(false);
    }, 1000);
  };

  // แยกบริบทสภาพอากาศจำลองตามความเหมาะสมของภารกิจ
  const getQuestWeatherTrigger = (quest: any) => {
    const text = (quest.title + " " + quest.description).toLowerCase();
    if (text.includes("ฝน") || text.includes("หมอก") || text.includes("rain") || text.includes("fog")) {
      return "Rainy";
    }
    return "Sunny";
  };

  // ฟังก์ชันยิงเคลมคูปองภารกิจเมื่อสแกนถูกต้อง
  const handleConfirmCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuest || !userId) return;

    if (qrCodeInput.trim() !== selectedQuest.qr_code_trigger) {
      alert("❌ รหัส QR Code ไม่ถูกต้อง กรุณาตรวจสอบหรือลองพิมพ์รหัสคำใบ้อีกครั้งจ้าว");
      return;
    }

    setIsCheckingIn(true);
    const oldCoins = totalCoins; // เก็บแต้มเดิมก่อนเพิ่มคะแนน

    try {
      const { error } = await supabase
        .from("user_coupons")
        .insert({
          user_id: userId,
          quest_id: selectedQuest.id,
          status: "claimed"
        });

      if (error) throw error;

      alert(`🎉 เช็กอินสำเร็จ! ยินดีด้วยคุณได้รับ +${selectedQuest.points} NAN Coins`);
      setShowQrModal(false);
      setQrCodeInput("");
      
      // ดึงข้อมูลใหม่เพื่อรีเฟรชแต้มในตัวแปร state
      // (Supabase บันทึกเสร็จแล้ว โหลดกลับมาใหม่เพื่อให้แต้มจริงเป็นปัจจุบัน)
      await fetchTouristData();

      // ดึงข้อมูลหลังเคลมสำเร็จเพื่อตรวจสอบเงื่อนไขการเลื่อนขั้น (Level Up)
      const newCoins = oldCoins + selectedQuest.points;
      const oldLevelDetails = getLevelInfo(oldCoins).current;
      const newLevelDetails = getLevelInfo(newCoins).current;

      if (newLevelDetails.level > oldLevelDetails.level) {
        // ยินดีด้วย! ระดับเลเวลอัปขึ้นสูงขึ้นจริง
        setLevelUpData({
          oldLevel: oldLevelDetails.level,
          newLevel: newLevelDetails.level,
          title: newLevelDetails.title,
          badge: newLevelDetails.badge,
          perks: newLevelDetails.perks,
          description: newLevelDetails.description
        });
        setTimeout(() => {
          setShowLevelUpModal(true);
        }, 600);
      }

    } catch (err) {
      console.error("Error checking in:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกงานเช็กอิน");
    } finally {
      setIsCheckingIn(false);
    }
  };

  // ฟังก์ชันสแกนหาพิกัดร้านค้าจริงรอบตัวคุณจาก Supabase
  const handleRadarScan = async () => {
    setRadarScanning(true);
    try {
      const { data: dbStores, error } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      setTimeout(() => {
        setRadarScanning(false);
        if (dbStores) {
          setScannedStores(dbStores);
          setShowRadarModal(true);
        }
      }, 2000);
    } catch (err) {
      console.error("Error scanning stores:", err);
      setRadarScanning(false);
      alert("เกิดข้อผิดพลาดในการสแกนจุดเช็กอินรอบตัว");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-slate-500">กำลังเชื่อมฐานข้อมูลนักท่องเที่ยว...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 relative overflow-hidden">
      
      {/* แสงออร่าด้านหลังแบบซอฟท์ๆ */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none dark:hidden" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* สภาพอากาศจำลอง */}
        <div className="flex justify-end gap-2 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-2 rounded-2xl w-fit ml-auto shadow-sm">
          <span className="text-xs flex items-center px-2 text-slate-500 dark:text-slate-400 font-medium">🌡️ สภาพอากาศจำลอง:</span>
          <button 
            onClick={() => setSimulatedWeather("Rainy")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${simulatedWeather === "Rainy" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
          >
            <CloudRain className="w-3.5 h-3.5" /> ฝนตก
          </button>
          <button 
            onClick={() => setSimulatedWeather("Sunny")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${simulatedWeather === "Sunny" ? "bg-amber-500 text-slate-950 shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
          >
            <CloudSun className="w-3.5 h-3.5" /> แดดออก
          </button>
        </div>

        {/* 🌟 การ์ดตัวละครหลัก (ระบบยศ เลเวล และแถบสะสม XP จริง) */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
            <Compass className="w-48 h-48" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-center">
            
            {/* ฝั่งซ้าย: ยศเลเวลและยศตำแหน่ง */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-900 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                  {currentLevel.badge} Level {currentLevel.level}
                </span>
                <span className="bg-white/20 text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                  {currentLevel.title}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                กระดานภารกิจของนักท่องเที่ยว 🗺️
              </h1>
              
              {/* แถบสะสม XP แร๊งก์แบบเกมเมอร์ */}
              <div className="pt-2 max-w-sm space-y-1">
                <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-100">
                  <span>{xpPercent}% สู่ระดับถัดไป</span>
                  <span className="font-mono">{totalCoins} / {nextLevel ? nextLevel.minPoints : 'MAX'} NAN</span>
                </div>
                <p className="text-[10px] text-yellow-200 italic pt-1 flex items-center gap-0.5">
                  <Zap size={10} className="fill-current text-amber-300" /> สิทธิ์ปัจจุบัน: {currentLevel.perks}
                </p>
              </div>
            </div>

            {/* ฝั่งขวา: จำนวนเหรียญในบัญชีสะสมจริง */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 shadow-inner md:justify-self-end w-full md:w-fit min-w-[200px]">
              <div className="p-3 bg-amber-400 text-slate-900 rounded-xl shadow-md shrink-0">
                <Coins className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-100 font-medium tracking-wide uppercase">เหรียญรางวัลสะสม</p>
                <p className="text-2xl font-black text-amber-300">{totalCoins} <span className="text-xs text-white font-normal">NAN</span></p>
              </div>
            </div>

          </div>
        </div>

        {/* Radar & Wheel Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* กล่องเรดาร์ */}
          <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-sm transition-all">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center justify-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600" /> เรดาร์ค้นหาจุดเช็กอิน
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">ค้นหาพิกัดร้านค้าชุมชนรอบตัวคุณ</p>
            </div>

            <div className="my-4 relative w-24 h-24 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
              <div className={`absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full ${radarScanning ? "animate-spin" : ""}`} />
              <Compass className={`w-7 h-7 text-slate-400 transition-colors ${radarScanning ? "text-emerald-500" : "dark:text-emerald-400"}`} />
            </div>

            <button 
              onClick={handleRadarScan}
              disabled={radarScanning}
              className="w-full text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {radarScanning ? "📡 กำลังค้นหา..." : "📡 สแกนพิกัดรอบตัว"}
            </button>
          </div>

          {/* กล่องวงล้อสุ่ม */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-amber-600" /> วงล้อสุ่มกิจกรรมท้าสายฝน
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">ให้ AI แนะนำพิกัดหลบฝนหรือเมนูลับประจำวัน</p>
            </div>

            <div className="my-3 p-4 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 rounded-xl min-h-[60px] flex items-center justify-center text-center shadow-inner">
              {luckyResult ? (
                <p className="text-sm font-bold text-emerald-600 dark:text-amber-300 animate-fade-in">{luckyResult}</p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">กดปุ่มด้านล่างเพื่อเริ่มหมุนเสี่ยงทาย</p>
              )}
            </div>

            <button 
              onClick={spinWheel}
              className="w-full text-xs font-bold py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-md shadow-amber-500/10"
            >
              ✨ สุ่มไอเดียกินเที่ยววันนี้
            </button>
          </div>
        </div>

        {/* 📚 ส่วนขยายความเข้าใจ: NAN Coins Guide */}
        <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5 border-b dark:border-slate-850 pb-2">
            <BookOpen className="w-4 h-4 text-emerald-600" /> คู่มือเหรียญรางวัลสะสม (NAN Coins) มีไว้ทำอะไร?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            เหรียญรางวัล **NAN** หรือดิจิทัลโทเค็นชุมชนน่าน คือแต้มสะสมการท่องเที่ยวแบบยั่งยืนที่คุณได้รับหลังจากเช็กอินเคลมความสำเร็จในกิจกรรมต่างๆ เพื่อนำไปต่อยอดใช้ประโยชน์ได้จริง 3 ด้านดังนี้จ้าว:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850/60 space-y-1.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                🏷️ 1. แลกส่วนลดร้านค้า
              </span>
              <p className="text-[10.5px] text-slate-450 dark:text-slate-400 leading-relaxed">
                นำแต้มไปใช้เป็นส่วนลด 10% - 30% ณ โฮมสเตย์ ร้านอาหาร คาเฟ่ และวิสาหกิจทอผ้าพื้นเมืองในพื้นที่จังหวัดน่านที่ร่วมรายการ
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850/60 space-y-1.5">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                🎁 2. แลกของรางวัลชุมชน
              </span>
              <p className="text-[10.5px] text-slate-450 dark:text-slate-400 leading-relaxed">
                ใช้สะสมแลกรับสินค้าชุมชน ผลิตภัณฑ์ชุมชน โกโก้น่านออร์แกนิก ของฝากทำมือ หรือเครื่องเงินโบราณจากศูนย์บริการนักท่องเที่ยวได้ฟรี
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850/60 space-y-1.5">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                🌱 3. สนับสนุนกิจกรรมสีเขียว
              </span>
              <p className="text-[10.5px] text-slate-450 dark:text-slate-400 leading-relaxed">
                ใช้ร่วมบริจาคโหวตเพื่อสนับสนุนแคมเปญจัดการดูแลขยะและการฟื้นฟูธรรมชาติป่าไม้เพื่อฟื้นฟูเมืองน่านให้เป็นเมืองท่องเที่ยวสีเขียว
              </p>
            </div>
          </div>
        </div>

        {/* เควสบอร์ดดึงข้อมูลเรียลไทม์จากระบบ */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              ⚔️ รายการเควสประจำพื้นที่ {selectedDistrict !== "All" && `(อ.${selectedDistrict})`}
            </h2>
            <div className="flex items-center gap-2">
              {selectedDistrict !== "All" && (
                <button 
                  onClick={() => setSelectedDistrict("All")}
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  ❌ ล้างตัวกรองพื้นที่
                </button>
              )}
              <button 
                onClick={fetchTouristData}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                🔄 รีเฟรชกระดาน
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.length > 0 ? (
              quests.map((quest) => {
                const questWeather = getQuestWeatherTrigger(quest);
                if (questWeather === "Rainy" && simulatedWeather !== "Rainy") return null;
                if (questWeather === "Sunny" && simulatedWeather !== "Sunny") return null;

                const normQuestDist = normalizeDistrict(quest.district);
                if (selectedDistrict !== "All" && normQuestDist !== selectedDistrict) return null;

                const isCompleted = completedQuestIds.has(Number(quest.id));

                return (
                  <div 
                    key={quest.id} 
                    className={`bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/20 hover:shadow-md transition-all shadow-sm ${
                      isCompleted ? "opacity-75 relative overflow-hidden" : ""
                    }`}
                  >
                    {isCompleted && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 rounded">
                          {quest.district ? "Community Quest" : "General"}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          questWeather === "Rainy" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400" : "bg-amber-50 text-amber-850 dark:bg-amber-950/45 dark:text-amber-400"
                        }`}>
                          {questWeather === "Rainy" ? "🌧️ หน้าฝน" : "☀️ หน้าแดด"}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{quest.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{quest.description}</p>
                      
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>อำเภอ{normQuestDist}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block">ของรางวัล</span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">+{quest.points} NAN</span>
                      </div>

                      {isCompleted ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> ทำสำเร็จแล้ว
                        </span>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedQuest(quest);
                            setShowQrModal(true);
                          }} 
                          className="text-[11px] font-bold px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg flex items-center gap-0.5 shadow-sm"
                        >
                          <QrCode className="w-3 h-3" /> เช็กอินส่งงาน
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center col-span-2 py-12 text-slate-400 dark:text-slate-500 text-sm">
                🏜️ ยังไม่มีข้อมูลเควสการเดินทางในอำเภอนี้ของระบบจริง
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 📡 Radar Scanned Stores Modal */}
      {showRadarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scale-up text-card-foreground">
            
            <div className="flex justify-between items-center border-b dark:border-slate-850 pb-3">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Navigation className="w-5 h-5 text-emerald-600" /> พิกัดจุดเช็กอินชุมชนรอบตัวคุณที่ตรวจพบ (ระบบจริง)
              </h3>
              <button 
                onClick={() => setShowRadarModal(false)}
                className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              พบจุดพิกัดร้านค้าพันธมิตรล้านนาทั้งหมด <strong>{scannedStores.length} แห่ง</strong> ใกล้ตัวคุณ คุณสามารถเลือกฟิลเตอร์เฉพาะจุดเพื่อดูเควสและรับคะแนนพิเศษได้จ้าว:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {scannedStores.length > 0 ? (
                scannedStores.map((store) => {
                  const storeDist = normalizeDistrict(store.district);
                  return (
                    <div key={store.id} className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850/60 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <p className="font-bold text-sm flex items-center gap-1 text-slate-900 dark:text-white">
                          <Store size={14} className="text-emerald-600" /> {store.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin size={10} className="text-rose-500" /> อำเภอ{storeDist} • ประเภท: {store.type || 'ทั่วไป'}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedDistrict(storeDist);
                          setShowRadarModal(false);
                        }}
                        className="w-full text-center py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 rounded-lg text-[10px] font-bold border border-emerald-150 dark:border-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        🎯 กรองเฉพาะอำเภอนี้ ({storeDist})
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-400">
                  ไม่พบจุดประกอบการในระบบ
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t dark:border-slate-850">
              <button 
                onClick={() => setShowRadarModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📱 QR Code Check-in Simulation Modal */}
      {showQrModal && selectedQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up text-card-foreground">
            
            <div className="flex justify-between items-start border-b dark:border-slate-850 pb-3">
              <div className="space-y-1">
                <span className="text-[9px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 rounded">
                  เช็กอินรับรางวัล +{selectedQuest.points} NAN
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {selectedQuest.title}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowQrModal(false);
                  setQrCodeInput("");
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckin} className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/40 border dark:border-slate-850/60 rounded-2xl relative overflow-hidden">
                <QrCode className="w-28 h-28 text-slate-350 dark:text-emerald-600/50" />
                <div className="absolute w-28 h-0.5 bg-emerald-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce [animation-duration:2s]" />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 italic text-center">
                  สแกนคิวอาร์โค้ดที่ตั้งอยู่หน้าร้านเพื่อรับเหรียญรางวัล
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">รหัสสแกน QR Code (สำหรับการสาธิต)</label>
                <input 
                  type="text" 
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  placeholder="กรอกรหัส หรือ สแกน..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  required
                />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-mono bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-100/50 dark:border-amber-900/30">
                  💡 คำใบ้สำหรับเดโมสแกน: รหัสของพิกัดนี้คือ <strong>{selectedQuest.qr_code_trigger}</strong>
                </span>
              </div>

              <button 
                type="submit" 
                disabled={isCheckingIn}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isCheckingIn ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                ยืนยันการเช็กอินภารกิจ
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 🎉 LEVEL UP CELEBRATION MODAL (แสดงผลการอัปเวลสวยงาม) */}
      {showLevelUpModal && levelUpData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          
          {/* ออร่าสะท้อนแสงสีเหลืองทองเฉลิมฉลอง */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-6 relative overflow-hidden text-white">
            
            {/* โบว์และพลุด้านหลัง */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* โลโก้แอนิเมชันปังๆ */}
            <div className="relative flex justify-center pt-4">
              <div className="relative">
                <div className="w-20 h-20 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-5xl">{levelUpData.badge}</span>
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-1.5 shadow-md">
                  <Sparkles size={16} className="fill-current animate-spin [animation-duration:8s]" />
                </div>
              </div>
            </div>

            {/* หัวข้อระดับเลเวลใหม่ */}
            <div className="space-y-1">
              <p className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase">LEVEL UP CELEBRATION</p>
              <h2 className="text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent leading-none">
                เลเวลอัปแล้วจ้าว!
              </h2>
              <p className="text-xs text-slate-400 pt-1">
                ระดับของคุณเพิ่มขึ้นจากเลเวล {levelUpData.oldLevel} → <strong className="text-amber-400 text-sm">เลเวล {levelUpData.newLevel}</strong>
              </p>
            </div>

            {/* การ์ดยศตำแหน่งใหม่ */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1.5 shadow-inner">
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                ฉายาตำแหน่งใหม่
              </span>
              <p className="font-bold text-base text-white">{levelUpData.title}</p>
              <p className="text-[10.5px] text-slate-400 leading-relaxed font-normal italic">
                &ldquo;{levelUpData.description}&rdquo;
              </p>
            </div>

            {/* ปลดล็อกสิทธิประโยชน์ใหม่ */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
                🎁 ปลดล็อกสิทธิ์พิเศษประจำขั้น:
              </p>
              <p className="text-xs text-slate-200 bg-emerald-950/40 border border-emerald-900/30 py-2.5 px-4 rounded-xl inline-block leading-relaxed">
                {levelUpData.perks}
              </p>
            </div>

            {/* ปุ่มปิดเพื่อเล่นต่อ */}
            <button 
              onClick={() => {
                setShowLevelUpModal(false);
                setLevelUpData(null);
              }}
              className="relative z-10 w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-400/10 transition-all active:scale-95"
            >
              รับทราบสิทธิ์ & เดินทางต่อจ้าว!
            </button>

          </div>
        </div>
      )}

    </div>
  );
}