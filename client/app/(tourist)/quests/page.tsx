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
  Zap,
  TreePine,
  UtensilsCrossed,
  Gift
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

// รายการของรางวัลสำหรับระบบสิทธิประโยชน์ NAN Coins
const REWARDS = [
  {
    id: "cocoa",
    title: "โกโก้น่านร้อนออร์แกนิก 1 แก้ว",
    description: "จิบโกโก้แท้เข้มข้น ผลผลิตจากไร่เกษตรกรอำเภอปัว ฟรี 1 แก้ว ณ ร้านค้าพันธมิตร",
    cost: 200,
    icon: "UtensilsCrossed",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    badge: "🍵 ฟรีเครื่องดื่ม"
  },
  {
    id: "homestay_discount",
    title: "ส่วนลดโฮมสเตย์ในปัว/บ่อเกลือ 15%",
    description: "ใช้ลดราคาค่าห้องพักหรือลานกางเต็นท์ริมน้ำ ในร้านพักผ่อนที่เข้าร่วมโครงการช่วงฤดูฝน",
    cost: 450,
    icon: "Store",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
    badge: "🏷️ คูปองส่วนลด"
  },
  {
    id: "handicraft",
    title: "พวงกุญแจจักสานหรือกระเป๋าผ้าฝ้ายทำมือ",
    description: "งานฝีมือทำด้วยรักจากผู้สูงอายุชุมชนบ่อเกลือ เสริมรายได้สู่กลุ่มแม่บ้านชุมชนย่อย",
    cost: 350,
    icon: "Gift",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40",
    badge: "🎁 ของที่ระลึก"
  },
  {
    id: "tree_donation",
    title: "บริจาคปลูกป่าต้นน้ำน่าน 1 ต้น",
    description: "แปลงแต้มสะสมร่วมสนับสนุนการปลูกและฟื้นฟูป่าต้นน้ำน่าน โดยคุณจะได้รับใบบันทึกผู้พิทักษ์ป่าดิจิทัล",
    cost: 100,
    icon: "TreePine",
    color: "text-green-600 bg-green-50 dark:bg-green-950/40",
    badge: "🌱 ท่องเที่ยวสีเขียว"
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

const generateVoucherCode = (rewardId: string): string => {
  return `NAN-${rewardId.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
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
  const [weatherToast, setWeatherToast] = useState<string | null>(null);

  const changeWeather = (weather: "Rainy" | "Sunny") => {
    setSimulatedWeather(weather);
    const msg = weather === "Rainy"
      ? "🌧️ สภาพอากาศเปลี่ยนเป็นฝนตก: ระบบคัดกรองแนะนำเควสในร่มและร้านค้าหลบฝนจ้าว!"
      : "☀️ สภาพอากาศเปลี่ยนเป็นแดดออก: ระบบคัดกรองแนะนำเควสผจญภัยกลางแจ้งและยอดดอยจ้าว!";
    setWeatherToast(msg);
    setTimeout(() => {
      setWeatherToast((current) => current === msg ? null : current);
    }, 3000);
  };

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

  // States สำหรับ Coin Redemption Shop
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any | null>(null);
  const [voucherTimer, setVoucherTimer] = useState(900); // 15 mins
  const [voucherCode, setVoucherCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  // States สำหรับการจำลองกล้องสแกน QR
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isVerifyingPhoto, setIsVerifyingPhoto] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);

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

      let spent = 0;
      if (typeof window !== "undefined") {
        spent = Number(localStorage.getItem("demo_spent_coins") || "0");
      }

      setCompletedQuestIds(completedIds);
      setTotalCoins(Math.max(0, coins - spent));

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

  // Effect สำหรับคุมเวลานับถอยหลังตั๋วรางวัล
  useEffect(() => {
    let interval: any;
    if (showRedeemModal && voucherTimer > 0) {
      interval = setInterval(() => {
        setVoucherTimer((prev) => prev - 1);
      }, 1000);
    } else if (voucherTimer === 0) {
      setShowRedeemModal(false);
      alert("⚠️ คูปองของคุณหมดอายุแล้วเนื่องจากไม่มีการสแกนสิทธิ์ภายใน 15 นาที");
    }
    return () => clearInterval(interval);
  }, [showRedeemModal, voucherTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRedeemClick = (reward: any) => {
    if (totalCoins < reward.cost) return;
    
    // ตั้งค่ารหัสตั๋วสุ่มและเริ่มนับถอยหลังใหม่
    const code = generateVoucherCode(reward.id);
    setSelectedReward(reward);
    setVoucherCode(code);
    setVoucherTimer(900);
    setShowRedeemModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    setIsRedeeming(true);

    try {
      // หักแต้มผ่าน localStorage
      const currentSpent = Number(localStorage.getItem("demo_spent_coins") || "0");
      const newSpent = currentSpent + selectedReward.cost;
      localStorage.setItem("demo_spent_coins", String(newSpent));

      // โหลดแต้มใหม่
      await fetchTouristData();

      alert(`🎉 แลกรางวัลสำเร็จแล้วจ้าว! ระบบได้ทำการยืนยันสิทธิ์และหักเหรียญรางวัลจำนวน ${selectedReward.cost} NAN เรียบร้อยแล้ว`);
      setShowRedeemModal(false);
      setSelectedReward(null);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการแลกรางวัล");
    } finally {
      setIsRedeeming(false);
    }
  };

  const startSimulatedScanner = (triggerCode: string) => {
    setIsScanningSimulated(true);
    setScanSuccess(false);
    
    // ตั้งเวลา 1.8 วินาทีสำหรับการจำลองการแสกนคิวอาร์โค้ด
    setTimeout(() => {
      setScanSuccess(true);
      
      // หลังจากสแกนเสร็จ 0.6 วินาที จะสลับไปจำลองการถ่ายภาพและตรวจโดย AI
      setTimeout(() => {
        setIsScanningSimulated(false);
        setScanSuccess(false);
        setIsVerifyingPhoto(true);
        setVerifyStep(1);

        // จำลอง Step 1 -> Step 2 (อัปโหลด -> ตรวจวัด)
        setTimeout(() => {
          setVerifyStep(2);
          
          // จำลอง Step 2 -> Step 3 (ตรวจวัด -> GPS)
          setTimeout(() => {
            setVerifyStep(3);

            // จำลอง Step 3 -> ยิงลงฐานข้อมูลจริง
            setTimeout(async () => {
              setIsVerifyingPhoto(false);
              setIsCheckingIn(true);
              const oldCoins = totalCoins;
              
              try {
                const { error } = await supabase
                  .from("user_coupons")
                  .insert({
                    user_id: userId,
                    quest_id: selectedQuest.id,
                    status: "claimed"
                  });

                if (error) throw error;

                alert(`🎉 สแกน QR & วิเคราะห์ภาพถ่ายสำเร็จ! ยินดีด้วยคุณได้รับ +${selectedQuest.points} NAN Coins`);
                setShowQrModal(false);
                setQrCodeInput("");
                
                await fetchTouristData();

                const newCoins = oldCoins + selectedQuest.points;
                const oldLevelDetails = getLevelInfo(oldCoins).current;
                const newLevelDetails = getLevelInfo(newCoins).current;

                if (newLevelDetails.level > oldLevelDetails.level) {
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
                console.error(err);
                alert("เกิดข้อผิดพลาดในการบันทึกสแกน");
              } finally {
                setIsCheckingIn(false);
              }
            }, 800);
          }, 800);
        }, 800);
      }, 600);
    }, 1800);
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
    <div className="w-full min-h-screen flex flex-col justify-between relative bg-slate-50 dark:bg-slate-950/20">
      <div className="p-4 md:p-8 relative overflow-hidden flex-1">
      
      {/* แสงออร่าด้านหลังแบบซอฟท์ๆ ตามสภาพอากาศ */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 dark:hidden ${
        simulatedWeather === "Rainy" 
          ? "bg-blue-100/40" 
          : "bg-amber-100/40"
      }`} />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* สภาพอากาศจำลอง */}
        <div className="flex justify-end gap-2 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-2 rounded-2xl w-fit ml-auto shadow-sm">
          <span className="text-xs flex items-center px-2 text-slate-500 dark:text-slate-400 font-medium">🌡️ สภาพอากาศจำลอง:</span>
          <button 
            onClick={() => changeWeather("Rainy")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${simulatedWeather === "Rainy" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
          >
            <CloudRain className="w-3.5 h-3.5" /> ฝนตก
          </button>
          <button 
            onClick={() => changeWeather("Sunny")}
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

            <div className="my-4 relative w-28 h-28 bg-slate-900 border-2 border-emerald-500/30 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)] select-none shrink-0">
              {/* Concentric Grid Rings */}
              <div className="absolute w-20 h-20 border border-emerald-500/10 rounded-full pointer-events-none" />
              <div className="absolute w-12 h-12 border border-emerald-500/15 rounded-full pointer-events-none" />
              
              {/* Crosshair Lines */}
              <div className="absolute w-full h-[0.5px] bg-emerald-500/10 pointer-events-none" />
              <div className="absolute h-full w-[0.5px] bg-emerald-500/10 pointer-events-none" />

              {/* Sweeper (Rotating conic sector) */}
              <div 
                className={`absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0.3)_0deg,rgba(16,185,129,0.05)_90deg,transparent_180deg)] rounded-full ${
                  radarScanning ? "animate-spin [animation-duration:1.5s]" : "hidden"
                }`}
              />

              {/* Pulsating Expanding Waves */}
              {radarScanning && (
                <>
                  <div className="absolute inset-2 border border-emerald-400/35 rounded-full animate-ping [animation-duration:1.8s] pointer-events-none" />
                  <div className="absolute inset-5 border border-emerald-500/20 rounded-full animate-ping [animation-duration:2.5s] [animation-delay:0.5s] pointer-events-none" />
                  
                  {/* Blips (Simulated Detected Points) */}
                  <div className="absolute w-2 h-2 bg-emerald-400 rounded-full top-6 left-12 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] [animation-delay:0.3s]" />
                  <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full bottom-8 right-6 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)] [animation-delay:0.8s]" />
                  <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full top-10 right-10 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)] [animation-delay:1.2s]" />
                </>
              )}

              {/* Center icon */}
              <Compass 
                className={`w-7 h-7 text-emerald-500/40 relative z-10 transition-all duration-300 ${
                  radarScanning ? "text-emerald-450 scale-110 rotate-12" : "dark:text-emerald-500/30"
                }`} 
              />
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

        {/* 🎁 ร้านค้าแลกรางวัลสิทธิประโยชน์ (NAN Premium Redemptions) */}
        <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b dark:border-slate-850 pb-3">
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-450 animate-pulse" />
                ร้านค้าแลกรางวัลสิทธิประโยชน์ (NAN Redemptions)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">ใช้เหรียญสะสม NAN Coins ของคุณมาแลกของรางวัลหรือส่วนลดสไตล์น่านยั่งยืน</p>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-550/20 flex items-center gap-1 font-mono">
              <Coins className="w-3.5 h-3.5" />
              มีอยู่: {totalCoins} NAN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REWARDS.map((reward) => {
              const hasEnough = totalCoins >= reward.cost;
              return (
                <div
                  key={reward.id}
                  className="bg-slate-50 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md hover:border-emerald-500/10 transition-all text-card-foreground"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${reward.color}`}>
                        {reward.badge}
                      </span>
                      <span className="text-xs font-black font-mono text-amber-500">{reward.cost} Coins</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{reward.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{reward.description}</p>
                  </div>

                  <div>
                    <button
                      onClick={() => handleRedeemClick(reward)}
                      disabled={!hasEnough}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                        hasEnough
                          ? "bg-gradient-to-r from-amber-450 to-amber-550 hover:from-amber-500 hover:to-amber-600 text-slate-950"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed active:scale-100"
                      }`}
                    >
                      {hasEnough ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          กดแลกรับสิทธิ์เลยจ้าว 🎉
                        </>
                      ) : (
                        <>
                          ต้องการเหรียญเพิ่มอีก {reward.cost - totalCoins} NAN 🔒
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          
          {/* Keyframe สลักหมุนเลเซอร์ */}
          <style>{`
            @keyframes scan-laser {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
            .laser-line {
              position: absolute;
              left: 0;
              right: 0;
              height: 2px;
              background-color: #10b981;
              box-shadow: 0 0 8px #10b981, 0 0 15px #10b981;
              animation: scan-laser 2s infinite ease-in-out;
            }
          `}</style>

          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up text-card-foreground">
            
            <div className="flex justify-between items-start border-b dark:border-slate-850 pb-3">
              <div className="space-y-1">
                <span className="text-[9px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 rounded">
                  ภารกิจเช็กอิน +{selectedQuest.points} NAN Coins
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight pt-1">
                  {selectedQuest.title}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowQrModal(false);
                  setQrCodeInput("");
                  setIsScanningSimulated(false);
                  setScanSuccess(false);
                  setIsVerifyingPhoto(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {!isScanningSimulated && !isVerifyingPhoto && (
              // โหมดที่ 1: แสดงคิวอาร์โค้ดจำลองที่หน้าร้านค้า
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed text-center">
                  ระบบได้สร้างป้าย **QR Code** สำหรับสแกนรับสิทธิ์ ณ หน้าร้านค้าพันธมิตรเรียบร้อยแล้ว
                </p>

                {/* ป้าย QR หน้าร้านผู้ประกอบการ */}
                <div className="bg-slate-50 dark:bg-slate-950/30 p-6 rounded-2xl border dark:border-slate-850 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">ป้ายคิวอาร์ตั้งโต๊ะหน้าร้าน</span>
                  
                  {/* เจน QR จริงด้วย api.qrserver.com */}
                  <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200/50">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=059669&data=${encodeURIComponent(selectedQuest.qr_code_trigger)}`} 
                      alt="Shopfront Generated QR Code" 
                      className="w-36 h-36"
                    />
                  </div>
                  
                  <span className="text-[10px] font-mono bg-white dark:bg-slate-900 px-3 py-1 rounded border dark:border-slate-800 text-slate-500 dark:text-slate-455 font-semibold">
                    {selectedQuest.qr_code_trigger}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowQrModal(false);
                      setQrCodeInput("");
                    }}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl transition-all"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button 
                    onClick={() => startSimulatedScanner(selectedQuest.qr_code_trigger)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <QrCode size={14} />
                    จำลองมือถือสแกนคิวอาร์ 📸
                  </button>
                </div>
              </div>
            )}

            {isScanningSimulated && !isVerifyingPhoto && (
              // โหมดที่ 2: จำลองกล้องสแกนคิวอาร์ของนักท่องเที่ยว
              <div className="space-y-4">
                <div className="relative w-full h-56 rounded-2xl bg-black overflow-hidden flex flex-col items-center justify-center border border-slate-800">
                  
                  {/* Flashing RED record indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-[8px] font-mono font-bold text-white">CAMERA LIVE</span>
                  </div>

                  {scanSuccess ? (
                    // หน้าจอแสกนสำเร็จ
                    <div className="flex flex-col items-center justify-center text-center space-y-2 z-10">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                      <p className="text-sm font-black text-white">ตรวจพบคิวอาร์โค้ดแล้ว!</p>
                      <p className="text-[10px] text-emerald-350">กำลังดำเนินการตรวจอัปโหลดไฟล์หลักฐาน...</p>
                    </div>
                  ) : (
                    // หน้าจอกำลังแสกน
                    <div className="w-full h-full relative flex flex-col items-center justify-center text-center space-y-2">
                      {/* Laser Line */}
                      <div className="laser-line" />
                      
                      {/* Viewfinder brackets */}
                      <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/40" />
                      <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/40" />
                      <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/40" />
                      <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/40" />

                      <QrCode className="w-14 h-14 text-white/20 animate-pulse" />
                      <p className="text-xs text-white font-mono animate-pulse">เล็งกล้องไปที่คิวอาร์โค้ดหน้าร้าน...</p>
                    </div>
                  )}

                  {/* ลำแสงแอร่าความลึกสีเขียว */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-mono italic">
                    {scanSuccess ? "✅ วิเคราะห์รหัสผ่านเสร็จสิ้น" : "⏳ กำลังจับคู่ตำแหน่ง GPS และยืนยันรหัสประจำเขต"}
                  </span>
                </div>
              </div>
            )}

            {isVerifyingPhoto && (
              // โหมดที่ 3: จำลองการอัปโหลดและวิเคราะห์รูปภาพด้วย AI
              <div className="space-y-5">
                <div className="relative w-full h-44 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                  {/* แสดงรูปภาพหลักฐาน มีเส้นสแกนสีฟ้าลอยผ่าน */}
                  <img
                    src="/CAMP.jpg"
                    alt="หลักฐานภาพถ่ายกิจกรรม"
                    className="w-full h-full object-cover rounded-xl opacity-60 filter saturate-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent pointer-events-none" />
                  
                  {/* เส้นเล็งแสกนสีฟ้าของ AI */}
                  <style>{`
                    @keyframes ai-laser {
                      0% { top: 10%; }
                      50% { top: 90%; }
                      100% { top: 10%; }
                    }
                    .ai-laser-line {
                      position: absolute;
                      left: 10%;
                      right: 10%;
                      height: 2px;
                      background-color: #06b6d4;
                      box-shadow: 0 0 8px #06b6d4, 0 0 12px #06b6d4;
                      animation: ai-laser 1.6s infinite ease-in-out;
                    }
                  `}</style>
                  <div className="ai-laser-line" />

                  {/* ป้ายสแกนวัตถุแบบ HUD */}
                  <div className="absolute top-3 right-3 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 text-[9px] font-mono text-cyan-300 flex items-center gap-1 z-10">
                    <Loader2 size={10} className="animate-spin" />
                    <span>AI ANALYZING...</span>
                  </div>
                </div>

                {/* แสดงความคืบหน้าการวิเคราะห์ภาพ */}
                <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-450 uppercase block mb-1">ความคืบหน้าการวิเคราะห์</span>
                  
                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-350">
                    <div className="flex items-center gap-2">
                      {verifyStep >= 1 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 animate-pulse animate-spin" />
                      )}
                      <span className={verifyStep === 1 ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}>
                        📤 อัปโหลดรูปภาพหลักฐาน {verifyStep === 1 ? "(กำลังส่ง...)" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {verifyStep >= 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 animate-pulse" />
                      )}
                      <span className={verifyStep === 2 ? "font-bold text-slate-900 dark:text-white text-cyan-600" : "text-slate-500"}>
                        🧠 ตรวจสอบวัตถุด้วย AI {verifyStep === 2 ? "(กำลังวิเคราะห์...)" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {verifyStep >= 3 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 animate-pulse" />
                      )}
                      <span className={verifyStep === 3 ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}>
                        📍 ยืนยันตำแหน่งร้านและ GPS {verifyStep === 3 ? "(กำลังตรวจคู่...)" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-mono italic animate-pulse">
                  {verifyStep === 2 ? "พบวัตถุ: แก้วเครื่องดื่ม, ทุ่งนา, และสายฝน..." : verifyStep === 1 ? "กำลังอัปโหลดรูปภาพไปยัง CDN ดิจิทัล..." : "ตรวจสอบพิกัดความปลอดภัย GPS สำเร็จ!"}
                </div>
              </div>
            )}

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

      {/* 🎫 Voucher Ticket Modal (ลูกเล่นการแลกเหรียญและเคลมสิทธิ์ตั๋วเดินทาง) */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          {/* แสงวิบวับข้างหลังตั๋ว */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* ดีไซน์โครงสร้าง Ticket ดึงดูดสายตา */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6 text-white text-center relative overflow-hidden">
            
            {/* โบว์และพลุด้านหลัง */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            {/* รอยเจาะตั๋วขอบข้างจำลองความเสมือนจริงของบัตรกำนัล */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-950 rounded-full border border-slate-800 border-r-transparent" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-950 rounded-full border border-slate-800 border-l-transparent" />

            <div className="space-y-1">
              <span className="text-[10px] text-emerald-450 font-extrabold tracking-widest uppercase flex items-center justify-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400 animate-spin" /> NAN COIN PREMIUM VOUCHER
              </span>
              <h3 className="font-black text-lg leading-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                คูปองสิทธิ์ของคุณเปิดใช้งานแล้ว!
              </h3>
            </div>

            {/* ส่วนตัวตั๋วหลัก */}
            <div className="bg-slate-950/85 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="space-y-1">
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-550/30">
                  {selectedReward.badge}
                </span>
                <p className="font-bold text-sm text-white pt-1">{selectedReward.title}</p>
                <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                  {selectedReward.description}
                </p>
              </div>

              {/* Barcode จำลองทำจาก CSS เส้นตั้งขีดขวางแบบเก๋ๆ */}
              <div className="bg-white p-3.5 rounded-xl space-y-1 border border-slate-850 flex flex-col items-center">
                <div className="w-full flex items-center justify-center gap-[2.5px] h-12 overflow-hidden opacity-90">
                  {[2,4,1,3,1,4,2,1,3,2,4,1,2,3,1,4,2,3,1,2,4,2,1,3,2,1,4,3,1,2,3].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full rounded-sm"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono tracking-[4px] text-slate-800 font-bold">{voucherCode}</span>
              </div>

              {/* เวลานับถอยหลัง */}
              <div className="space-y-1 border-t border-slate-850 pt-3">
                <span className="text-[9px] text-slate-500 block uppercase">รหัสคูปองนี้จะหมดอายุภายใน</span>
                <p className="text-xl font-black font-mono text-emerald-400 tracking-wider flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  {formatTimer(voucherTimer)}
                </p>
              </div>
            </div>

            {/* คำเตือนในการใช้งาน */}
            <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
              💡 <strong>คำแนะนำ:</strong> แสดงหน้าจอนี้กับพนักงานประจำร้านค้าพันธมิตร เพื่อกดยืนยันการหักเหรียญรางวัลสะสมต่อหน้าพนักงานเน้อจ้าว
            </p>

            {/* ปุ่มยืนยันแลกแต้ม (หน้าร้านกดยืนยัน) */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setSelectedReward(null);
                }}
                className="flex-1 py-3 border border-slate-800 hover:bg-slate-850 text-slate-400 rounded-xl text-xs font-bold transition-all"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={isRedeeming}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isRedeeming ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>ยืนยันสิทธิ์ ณ หน้าร้าน</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Weather Change Notification */}
      {weatherToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-800/95 border border-slate-750 dark:border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 max-w-sm animate-bounce text-xs font-semibold backdrop-blur text-center">
          <span>{weatherToast}</span>
        </div>
      )}

      </div>

      {/* 🧭 Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-12 border-t border-slate-800 relative z-20 text-xs transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-left md:text-left">

          {/* ส่วนที่ 1: ข้อมูลโปรเจกต์และการประกวด */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Nan Local Verse Engine</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              ระบบวิศวกรรมซอฟต์แวร์แพลตฟอร์มเพื่อการท่องเที่ยวและยกระดับชุมชนน่าน
              พัฒนาขึ้นเป็นพิเศษเพื่อการแข่งขัน <span className="text-amber-400 font-medium">Nan Beyond Seasons Hackathon</span>
            </p>
            <div className="text-[10px] text-slate-500 pt-2">
              © 2569 คณะวิทยาศาสตร์และเทคโนโลยีการเกษตร • All Rights Reserved
            </div>
          </div>

          {/* ส่วนที่ 2: ข้อมูลสถาบันการศึกษา */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Affiliation</h4>
            <p className="text-slate-300 font-medium">มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา น่าน</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Rajamangala University of Technology Lanna Nan<br />
              สาขาวิทยาการคอมพิวเตอร์ (Computer Science)
            </p>
          </div>

          {/* ส่วนที่ 3: ข้อมูลผู้พัฒนา (Solo Developer) */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Solo Developer
            </h4>
            <p className="text-slate-200 font-medium text-[13px]">พิชยะ สารเถื่อนแก้ว (HKM TEAM)</p>

            {/* Contact Items */}
            <div className="space-y-1.5 pt-1 text-slate-400 text-[11px]">
              <div className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8m-9 11h3a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:pichayasanthuenkaew@gmail.com" className="hover:underline">pichayasanthuenkaew@gmail.com</a>
              </div>

              <div className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:0623894070" className="hover:underline">062-389-4070</a>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}