"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  BookOpen,
  Store,
  Sparkles,
  Zap,
  Gift,
  Bell,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
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
    description: "งานฝีมือทำด้วยรักจากผู้สูงอายุชุมชนบ่อเกลือ เสริมรายได้สู่ผู้สูงวัยและสนับสนุนการใช้วัสดุธรรมชาติ",
    cost: 350,
    icon: "Gift",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40",
    badge: "🎁 ของดีชุมชน"
  },
  {
    id: "tree_donation",
    title: "สนับสนุนการปลูกป่าทดแทน 1 ต้น",
    description: "ร่วมฟื้นฟูธรรมชาติป่าต้นน้ำน่านด้วยการสละสิทธิ์เหรียญเพื่อแปลงเป็นเงินสมทบทุนจัดหาและดูแลกล้าไม้จริงจ้าว",
    cost: 100,
    icon: "TreePine",
    color: "text-green-600 bg-green-50 dark:bg-green-950/40",
    badge: "🌳 ร่วมปลูกต้นไม้"
  }
];

const normalizeDistrict = (dist: string | null | undefined): string => {
  if (!dist) return "ปัว";
  const d = dist.trim().toLowerCase();
  if (d === "pua" || d === "ปัว" || d.includes("ปัว")) return "ปัว";
  if (d === "boklaeo" || d === "bo_kluea" || d === "บ่อเกลือ" || d.includes("บ่อเกลือ")) return "บ่อเกลือ";
  if (d === "mueang" || d === "mueang_nan" || d === "เมืองน่าน" || d.includes("เมือง")) return "เมืองน่าน";
  if (d === "เชียงกลาง" || d === "chiang_klang" || d.includes("เชียงกลาง")) return "เชียงกลาง";
  if (d === "นาน้อย" || d === "na_noi" || d.includes("นาน้อย")) return "นาน้อย";
  return dist;
};

const generateVoucherCode = (rewardId: string): string => {
  return `NAN-${rewardId.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
};

// แยกประเภทเควสสำหรับคัดกรองในหน้า UI
const getQuestCategory = (quest: any) => {
  const text = (quest.title + " " + quest.description).toLowerCase();
  if (text.includes("eco") || text.includes("รักษ์โลก") || text.includes("ขยะ") || text.includes("ต้นไม้") || text.includes("ธรรมชาติ") || text.includes("คาร์บอน")) {
    return "eco";
  }
  if (text.includes("shop") || text.includes("ซื้อ") || text.includes("ร้านค้า") || text.includes("โอทอป") || text.includes("otop") || text.includes("ชุมชน") || text.includes("ผลิตภัณฑ์")) {
    return "shop";
  }
  if (text.includes("food") || text.includes("กิน") || text.includes("อาหาร") || text.includes("ข้าวซอย") || text.includes("โกโก้") || text.includes("กาแฟ") || text.includes("คาเฟ่")) {
    return "food";
  }
  return "other";
};

export default function AdvancedTouristQuestsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States สำหรับ Database
  const [quests, setQuests] = useState<any[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<number>>(new Set());
  const [totalCoins, setTotalCoins] = useState(0);

  // States สำหรับ UI
  const [simulatedWeather, setSimulatedWeather] = useState<"Rainy" | "Sunny">("Rainy");
  const [weatherToast, setWeatherToast] = useState<string | null>(null);

  const changeWeather = (weather: "Rainy" | "Sunny") => {
    setSimulatedWeather(weather);
    const msg = weather === "Rainy"
      ? "🌧️ พยากรณ์อากาศแจ้งเตือน: ฝนกำลังตกในน่านช่วงนี้ ระบบเปิดแนะนำกิจกรรมในร่มทดแทนแล้วจ้าว!"
      : "☀️ พยากรณ์อากาศแจ้งเตือน: ท้องฟ้าแจ่มใสในจังหวัดน่านแล้ว ขอให้เพลิดเพลินกับกิจกรรมกลางแจ้งจ้าว!";
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

  // States สำหรับ Radar
  const [scannedStores, setScannedStores] = useState<any[]>([]);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

  // States สำหรับ Level Up
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

  // States สำหรับ Leaderboard และ Pre-trip Demo
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [showPreTripModal, setShowPreTripModal] = useState(false);
  const [preTripClaimedId, setPreTripClaimedId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("All");

  // ดึงข้อมูล Leaderboard/Ranking สะสมเหรียญ
  const fetchLeaderboardData = useCallback(async (currentUserId: string | null, currentUserScore: number) => {
    setIsLeaderboardLoading(true);
    try {
      // 1. ดึงผู้ใช้งานทั้งหมด
      const { data: dbUsers, error: userError } = await supabase
        .from("users")
        .select("id, name, email, role");

      if (userError) {
        console.error("fetchLeaderboardData - userError:", userError);
      }

      // แปลงข้อมูลเป็น Array เพื่อรองรับการทำงานในทั้งโหมดจำลอง (Mock Demo) และฐานข้อมูลจริง (Real DB)
      let usersArray: any[] = [];
      if (Array.isArray(dbUsers)) {
        usersArray = dbUsers;
      } else if (dbUsers && typeof dbUsers === "object") {
        usersArray = [dbUsers];
      }

      // 2. ดึงคูปองของทุกคนเพื่อรวมแต้ม
      const { data: dbCoupons, error: couponError } = await supabase
        .from("user_coupons")
        .select("user_id, quest_id");

      if (couponError) {
        console.error("fetchLeaderboardData - couponError:", couponError);
      }

      // 3. ดึงแต้มภารกิจทั้งหมด
      const { data: dbQuests, error: questError } = await supabase
        .from("quests")
        .select("id, points");

      if (questError) {
        console.error("fetchLeaderboardData - questError:", questError);
      }

      // สร้าง Map หาคะแนนแต่ละเควส
      const questPointsMap = new Map<number, number>();
      dbQuests?.forEach((q: any) => {
        questPointsMap.set(Number(q.id), Number(q.points || 0));
      });

      // รวมคะแนนรายคน
      const userPointsMap = new Map<string, number>();
      dbCoupons?.forEach((c: any) => {
        const pts = questPointsMap.get(Number(c.quest_id)) || 0;
        userPointsMap.set(c.user_id, (userPointsMap.get(c.user_id) || 0) + pts);
      });

      const realTourists = usersArray
        .filter((u: any) => u.role === "tourist" || !u.role)
        .map((u: any) => {
          const score = userPointsMap.get(u.id) || 0;
          return {
            id: u.id,
            name: u.name || u.email?.split("@")[0] || "นักท่องเที่ยวไร้นาม",
            score: score,
            avatar: "👤",
            isCurrentUser: u.id === currentUserId
          };
        });

      // รายชื่อนักเดินทางจำลองพรีเมียม (Mock Explorers) เพื่อความสนุก
      const mockExplorers = [
        { id: "mock-1", name: "น้องน่าน ตะลอนเหนือ 🎒", score: 850, avatar: "🦊", isCurrentUser: false },
        { id: "mock-2", name: "ป๋าอุ๊ย นักเก็บแต้ม 🏆", score: 680, avatar: "🐻", isCurrentUser: false },
        { id: "mock-3", name: "สายหมอก ทุ่งนาสีทอง 🌾", score: 520, avatar: "🐼", isCurrentUser: false },
        { id: "mock-4", name: "แบ็คแพ็คเกอร์ บ่อเกลือ 🗻", score: 410, avatar: "🦁", isCurrentUser: false },
        { id: "mock-5", name: "กิ่วม่อง สโลว์ไลฟ์ ☕", score: 320, avatar: "🐿️", isCurrentUser: false }
      ];

      // รวมรายชื่อจริงกับ mock
      const combined = [...realTourists];
      
      const currentInList = combined.find(u => u.id === currentUserId);
      if (!currentInList && currentUserId) {
        const currentUserProfile = usersArray.find((u: any) => u.id === currentUserId);
        combined.push({
          id: currentUserId,
          name: currentUserProfile?.name || currentUserProfile?.email?.split("@")[0] || "คุณ (นักเดินทาง)",
          score: currentUserScore,
          avatar: "⭐",
          isCurrentUser: true
        });
      }

      mockExplorers.forEach(mock => {
        if (!combined.some(c => c.name === mock.name)) {
          combined.push(mock);
        }
      });

      // จัดเรียงลำดับคะแนนจากมากไปน้อย
      combined.sort((a, b) => b.score - a.score);

      // กำหนดอันดับ Rank
      const ranked = combined.map((u, index) => ({
        ...u,
        rank: index + 1
      }));

      setLeaderboard(ranked.slice(0, 6));
    } catch (e) {
      console.error("Error building leaderboard:", e);
      setLeaderboard([
        { rank: 1, name: "น้องน่าน ตะลอนเหนือ 🎒", score: 850, avatar: "🦊", isCurrentUser: false },
        { rank: 2, name: "ป๋าอุ๊ย นักเก็บแต้ม 🏆", score: 680, avatar: "🐻", isCurrentUser: false },
        { rank: 3, name: "สายหมอก ทุ่งนาสีทอง 🌾", score: 520, avatar: "🐼", isCurrentUser: false },
        { rank: 4, name: "แบ็คแพ็คเกอร์ บ่อเกลือ 🗻", score: 410, avatar: "🦁", isCurrentUser: false },
        { rank: 5, name: "กิ่วม่อง สโลว์ไลฟ์ ☕", score: 320, avatar: "🐿️", isCurrentUser: false },
        { rank: 6, name: "คุณ (นักเดินทาง)", score: currentUserScore, avatar: "⭐", isCurrentUser: true }
      ].sort((a, b) => b.score - a.score).map((u, i) => ({ ...u, rank: i + 1 })));
    } finally {
      setIsLeaderboardLoading(false);
    }
  }, []);

  // ดึงข้อมูลนักท่องเที่ยว เลเวล เหรียญ และเควสจาก Supabase
  const fetchTouristData = useCallback(async () => {
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

      const finalCoins = Math.max(0, coins - spent);
      setCompletedQuestIds(completedIds);
      setTotalCoins(finalCoins);

      if (dbQuests && !questError) {
        setQuests(dbQuests);
      }

      // ดึง Leaderboard พร้อมส่งค่า coins ของตนเองไปอัปเดตแบบเรียลไทม์
      await fetchLeaderboardData(user.id, finalCoins);
    } catch (err) {
      console.error("Error loading tourist data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLeaderboardData]);

  useEffect(() => {
    fetchTouristData();
  }, [fetchTouristData]);

  // ฟังก์ชันคำนวณข้อมูลระดับเลเวลนักท่องเที่ยวแบบไดนามิกจากแต้มสะสม
  const getLevelInfo = (points: number) => {
    const current = LEVEL_THRESHOLDS.find(
      (threshold) => points >= threshold.minPoints && points <= threshold.maxPoints
    ) || LEVEL_THRESHOLDS[0];
    
    const next = LEVEL_THRESHOLDS.find((threshold) => threshold.level === current.level + 1) || null;
    
    // คำนวณเปอร์เซ็นต์ค่าประสบการณ์สะสม (XP)
    let percent = 100;
    if (next) {
      const range = next.minPoints - current.minPoints;
      const progress = points - current.minPoints;
      percent = Math.min(Math.round((progress / range) * 100), 100);
    }
    
    return { current, next, percent };
  };

  const { current: currentLevel, next: nextLevel, percent: xpPercent } = getLevelInfo(totalCoins);

  // วงล้อเสี่ยงทายกิจกรรม
  const spinWheel = () => {
    setIsSpinning(true);
    setLuckyResult("กำลังหมุนวงล้อนำทางล้านนา...");
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * RANDOM_IDEAS.length);
      setLuckyResult(RANDOM_IDEAS[randomIndex]);
      setIsSpinning(false);
    }, 1000);
  };

  // Effect สำหรับคูปองรางวัล
  useEffect(() => {
    let interval: any;
    if (showRedeemModal && voucherTimer > 0) {
      interval = setInterval(() => {
        setVoucherTimer((prev) => prev - 1);
      }, 1000);
    } else if (voucherTimer === 0) {
      setShowRedeemModal(false);
      alert("⚠️ บัตรสิทธิประโยชน์หมดอายุการใช้งานชั่วคราวแล้วจ้าว กรุณากดดำเนินการรับรหัสบัตรใหม่อีกครั้งภายใน 15 นาทีหลังจากแลกเหรียญจ้าว");
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
      const currentSpent = Number(localStorage.getItem("demo_spent_coins") || "0");
      const newSpent = currentSpent + selectedReward.cost;
      localStorage.setItem("demo_spent_coins", String(newSpent));

      await fetchTouristData();

      alert(`🎉 แลกรางวัลสำเร็จ! คูปองสิทธิ์แลกซื้อ ${selectedReward.title} รหัสคูปองคือ ${voucherCode} กรุณาใช้บริการภายในเวลาที่กำหนดจ้าว`);
      setShowRedeemModal(false);
      setSelectedReward(null);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการแลกคูปองสิทธิประโยชน์");
    } finally {
      setIsRedeeming(false);
    }
  };

  const startSimulatedScanner = (triggerCode: string) => {
    console.log("Simulating scan for trigger code:", triggerCode);
    setIsScanningSimulated(true);
    setScanSuccess(false);
    
    setTimeout(() => {
      setScanSuccess(true);
      
      setTimeout(() => {
        setIsScanningSimulated(false);
        setScanSuccess(false);
        setIsVerifyingPhoto(true);
        setVerifyStep(1);

        setTimeout(() => {
          setVerifyStep(2);
          
          setTimeout(() => {
            setVerifyStep(3);

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
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-450" />
          <p className="text-sm text-slate-500">กำลังเชื่อมฐานข้อมูลนักท่องเที่ยว...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-between relative bg-slate-50 dark:bg-slate-950/20">
      <div className="p-4 md:p-8 relative overflow-hidden flex-1">
        
        {/* Background glow dynamic gradient */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 dark:hidden ${
          simulatedWeather === "Rainy" 
            ? "bg-blue-100/40" 
            : "bg-amber-100/40"
        }`} />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          
          {/* Main Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-cyan-950 p-6 rounded-3xl border border-emerald-800/40 relative overflow-hidden shadow-lg text-white">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <Compass className="w-64 h-64 translate-x-20 -translate-y-10" />
            </div>
            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] bg-emerald-450/20 text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full font-black uppercase tracking-widest inline-block">
                Lanna Quest Hub 🌿
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                กระดานภารกิจนักเดินทางแห่งขุนเขาน่าน
              </h1>
              <p className="text-xs text-emerald-200/80 font-light">
                สะสมเหรียญรางวัลจากการทำภารกิจที่เป็นมิตรต่อสิ่งแวดล้อมและช่วยเหลือชุมชนน่านยั่งยืน
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="text-[11px] font-semibold text-emerald-300">ระบบเชื่อมต่อสำเร็จ</span>
            </div>
          </div>

          {/* Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Column (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Pre-trip Weather Recommendation Hub */}
              <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-slate-855 dark:text-white flex items-center gap-1.5">
                      <CloudRain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ศูนย์ข้อมูลสภาพอากาศและการแนะนำทริป (Weather Hub)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ระบบสแกนสภาพอากาศจำลองเพื่อเตรียมพร้อมก่อนเดินทางจริง</p>
                  </div>
                  
                  {/* Weather simulation triggers */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-850 w-fit shrink-0">
                    <button 
                      onClick={() => changeWeather("Rainy")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        simulatedWeather === "Rainy" 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      <CloudRain className="w-3.5 h-3.5" /> ฝนตก
                    </button>
                    <button 
                      onClick={() => changeWeather("Sunny")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        simulatedWeather === "Sunny" 
                          ? "bg-amber-500 text-slate-950 shadow-sm" 
                          : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      <CloudSun className="w-3.5 h-3.5" /> แดดออก
                    </button>
                  </div>
                </div>

                {/* Condition Box */}
                {simulatedWeather === "Rainy" ? (
                  <div className="bg-blue-50/80 dark:bg-blue-955/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-550/10 text-blue-600 dark:text-blue-400 rounded-xl h-fit shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-blue-800 dark:text-blue-300">แจ้งเตือนฝนตก: เตรียมความพร้อมสำหรับทริปน่าน</h4>
                        <p className="text-[10.5px] text-blue-700/80 dark:text-blue-400/90 leading-relaxed font-light">
                          พยากรณ์อากาศคาดการณ์ว่าจะมีฝนตกในพื้นที่ อำเภอปัว และ อำเภอบ่อเกลือ ในอีก 1-2 วันนี้ เพื่อความสุขและความปลอดภัยในการเดินทาง แพลตฟอร์มขอมอบข้อเสนอพิเศษสปาในร่มและเวิร์กชอปของกินหลบฝนเพื่อประคองทริปของคุณจ้าว!
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowPreTripModal(true)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 active:scale-95 animate-pulse"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                      📢 Demo แจ้งล่วงหน้า 1-2 วัน (Pre-trip Recommendation)
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl h-fit shrink-0">
                      <CloudSun className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-amber-800 dark:text-amber-350">ท้องฟ้าแจ่มใส (Sunny Weather)</h4>
                      <p className="text-[10.5px] text-slate-550 dark:text-slate-450 leading-relaxed font-light">
                        สภาพอากาศโปร่งแสงแดดส่องสว่าง เหมาะสำหรับกิจกรรมปีนดอย ชมวิวทุ่งนาสีเขียว และท่องเที่ยวกลางแจ้งอย่างมีความสุข
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Interactive Quest Board */}
              <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b dark:border-slate-850 pb-3 flex-wrap">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-slate-855 dark:text-white flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-600" />
                      บอร์ดภารกิจชุมชนน่าน (Quest Board)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">เลือกทำภารกิจรักษ์โลกหรือแวะชิมอาหารท้องถิ่นเพื่อสะสมเหรียญ NAN</p>
                  </div>
                  
                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["All", "Eco", "Shop", "Food"].map((tab) => {
                      let label = tab;
                      if (tab === "All") label = "ทั้งหมด";
                      if (tab === "Eco") label = "🌳 Eco";
                      if (tab === "Shop") label = "🛍️ ช้อปชุมชน";
                      if (tab === "Food") label = "🍲 ของกินหลบฝน";

                      const isActive = selectedTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setSelectedTab(tab)}
                          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition-all border ${
                            isActive
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quest List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quests.length > 0 ? (
                    (() => {
                      const filtered = quests.filter((quest) => {
                        // Weather Filter
                        const questWeather = getQuestWeatherTrigger(quest);
                        if (questWeather === "Rainy" && simulatedWeather !== "Rainy") return false;
                        if (questWeather === "Sunny" && simulatedWeather !== "Sunny") return false;

                        // District Filter
                        const normQuestDist = normalizeDistrict(quest.district);
                        if (selectedDistrict !== "All" && normQuestDist !== selectedDistrict) return false;

                        // Tab Filter
                        if (selectedTab !== "All") {
                          const questCat = getQuestCategory(quest);
                          if (selectedTab === "Eco" && questCat !== "eco") return false;
                          if (selectedTab === "Shop" && questCat !== "shop") return false;
                          if (selectedTab === "Food" && questCat !== "food") return false;
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center col-span-2 py-12 text-slate-400 dark:text-slate-550 text-xs italic">
                            ไม่มีเควสสำหรับหมวดหมู่หรือเขตพื้นที่ที่คุณเลือกในสภาพอากาศนี้จ้าว
                          </div>
                        );
                      }

                      return filtered.map((quest) => {
                        const questWeather = getQuestWeatherTrigger(quest);
                        const normQuestDist = normalizeDistrict(quest.district);
                        const isCompleted = completedQuestIds.has(Number(quest.id));

                        return (
                          <div 
                            key={quest.id} 
                            className={`bg-white border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/20 hover:shadow-md transition-all shadow-sm relative group overflow-hidden ${
                              isCompleted ? "bg-emerald-50/10 dark:bg-emerald-955/5 opacity-80" : ""
                            }`}
                          >
                            {isCompleted && (
                              <div className="absolute top-0 right-0 bg-emerald-500 text-white rounded-bl-2xl p-1.5 shadow-sm">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400 rounded-lg">
                                  {quest.district ? "Community Quest" : "General"}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                  questWeather === "Rainy" ? "bg-blue-50 text-blue-750 dark:bg-blue-950/45 dark:text-blue-400" : "bg-amber-50 text-amber-850 dark:bg-amber-950/45 dark:text-amber-400"
                                }`}>
                                  {questWeather === "Rainy" ? "🌧️ ของกินเที่ยวหลบฝน" : "☀️ เควสแดดแจ่มใส"}
                                </span>
                              </div>

                              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{quest.title}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">{quest.description}</p>
                              
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                <span>พื้นที่: {normQuestDist}</span>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-505 block">เหรียญสะสมเมื่อทำสำเร็จ</span>
                                <span className="text-xs font-black text-amber-500 font-mono">+{quest.points} NAN</span>
                              </div>

                              {isCompleted ? (
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ทำสำเร็จแล้วจ้าว
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setSelectedQuest(quest);
                                    setShowQrModal(true);
                                  }} 
                                  className="text-[11px] font-bold px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-655 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                                >
                                  <QrCode className="w-3.5 h-3.5" /> เช็กอินพิกัดเควส 📸
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()
                  ) : (
                    <div className="text-center col-span-2 py-12 text-slate-400 dark:text-slate-550 text-sm">
                      กำลังโหลดข้อมูลเควสชุมชนน่าน...
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Premium Reward Marketplace */}
              <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b dark:border-slate-850 pb-3 flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-sm text-slate-855 dark:text-white flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-455 animate-pulse" />
                      ร้านค้าแลกรางวัลสิทธิประโยชน์ (NAN Redemptions)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ใช้เหรียญสะสม NAN Coins ของคุณมาแลกของรางวัลหรือส่วนลดสไตล์น่านยั่งยืน</p>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-3 py-1.5 rounded-full border border-amber-550/20 flex items-center gap-1 font-mono">
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
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${reward.color}`}>
                              {reward.badge}
                            </span>
                            <span className="text-xs font-black font-mono text-amber-500">{reward.cost} Coins</span>
                          </div>
                          <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white leading-tight">{reward.title}</h4>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">{reward.description}</p>
                        </div>

                        <div>
                          <button
                            onClick={() => handleRedeemClick(reward)}
                            disabled={!hasEnough}
                            className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                              hasEnough
                                ? "bg-gradient-to-r from-amber-450 to-amber-550 hover:from-amber-500 hover:to-amber-650 text-slate-950"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-505 cursor-not-allowed active:scale-100"
                            }`}
                          >
                            {hasEnough ? (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                แลกรับสิทธิ์พิเศษ 🎉
                              </>
                            ) : (
                              <>
                                สะสมเหรียญขาดอีก {reward.cost - totalCoins} NAN 🪙
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column (Sidebar Explorer Control Panel - 1 col) */}
            <div className="space-y-6">
              
              {/* A. Player RPG Profile Card */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden border border-emerald-500/25">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 pointer-events-none">
                  <Compass className="w-48 h-48" />
                </div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="bg-amber-450 text-slate-950 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase inline-flex items-center gap-1 shadow-sm">
                        {currentLevel.badge} Level {currentLevel.level}
                      </span>
                      <h4 className="text-lg font-black tracking-tight leading-tight">{currentLevel.title}</h4>
                    </div>
                    
                    {/* Badge Icon / Balance */}
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl flex flex-col items-end border border-white/20">
                      <span className="text-[8px] text-emerald-100 font-bold uppercase tracking-wider">NAN Balance</span>
                      <span className="text-base font-black text-amber-300 font-mono leading-none">{totalCoins} <span className="text-[10px] font-normal text-white">NAN</span></span>
                    </div>
                  </div>

                  {/* Level Up progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[9px] text-emerald-100 font-bold">
                      <span>{xpPercent}% สู่ระดับถัดไป</span>
                      <span>{totalCoins} / {nextLevel ? nextLevel.minPoints : 'MAX'} NAN</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden border border-white/10 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-yellow-350 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${xpPercent}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-yellow-200 italic pt-1 flex items-center gap-0.5">
                      <Zap size={10} className="fill-current text-amber-300 animate-bounce" /> สิทธิ์พิเศษ: {currentLevel.perks}
                    </p>
                  </div>
                </div>
              </div>

              {/* B. ทำเนียบผู้กล้าสะสมเหรียญ (Leaderboard / Ranking Board) */}
              <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="border-b dark:border-slate-850 pb-2.5">
                  <h3 className="font-black text-sm text-slate-855 dark:text-white flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                    ทำเนียบผู้กล้าสะสมเหรียญ (Leaderboard)
                  </h3>
                  <p className="text-[10px] text-slate-550 dark:text-slate-400">นักเดินทางคาร์บอนต่ำที่สะสมเหรียญ NAN สูงสุด</p>
                </div>

                <div className="space-y-2">
                  {isLeaderboardLoading ? (
                    <div className="flex flex-col items-center py-6 gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                      <p className="text-[10px] text-slate-400">กำลังอัปเดตกระดานคะแนน...</p>
                    </div>
                  ) : (
                    leaderboard.map((player) => {
                      let rankBadge = "";
                      let rankStyle = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                      
                      if (player.rank === 1) {
                        rankBadge = "🥇";
                        rankStyle = "bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 shadow-md";
                      } else if (player.rank === 2) {
                        rankBadge = "🥈";
                        rankStyle = "bg-slate-300 text-slate-900 font-bold ring-2 ring-slate-200 shadow-sm";
                      } else if (player.rank === 3) {
                        rankBadge = "🥉";
                        rankStyle = "bg-amber-600 text-white font-bold ring-2 ring-amber-700/20";
                      }

                      return (
                        <div 
                          key={player.id}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                            player.isCurrentUser 
                              ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/80 shadow-sm" 
                              : "bg-slate-50/50 border-slate-100 dark:bg-slate-950/30 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Rank Icon */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${rankStyle}`}>
                              {rankBadge ? rankBadge : player.rank}
                            </div>

                            {/* Avatar icon */}
                            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs shrink-0 shadow-inner border border-slate-300/20">
                              {player.avatar}
                            </div>

                            {/* Explorer details */}
                            <div>
                              <p className={`text-xs font-bold leading-none ${player.isCurrentUser ? "text-emerald-700 dark:text-emerald-450" : "text-slate-800 dark:text-slate-200"}`}>
                                {player.name}
                              </p>
                              <p className="text-[8px] text-slate-450 pt-0.5">
                                {player.rank <= 3 ? "Lanna Guardian" : "Explorer"}
                              </p>
                            </div>
                          </div>

                          {/* Player Score */}
                          <div className="text-right">
                            <p className="text-xs font-black text-amber-500 font-mono">
                              {player.score} <span className="text-[8px] text-slate-400 font-normal">NAN</span>
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* C. แผงควบคุมเรดาร์และสุ่มหมุนของกิน (Radar & Random Control widgets) */}
              <div className="grid grid-cols-1 gap-4">
                
                {/* Radar Widget */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between items-center text-center shadow-sm transition-all hover:shadow-md">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-855 dark:text-white flex items-center justify-center gap-1.5">
                      <Navigation className="w-4 h-4 text-emerald-600" /> เรดาร์ค้นหาจุดเช็กอิน
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ค้นหาพิกัดร้านค้าชุมชนและรับเควสรอบตัว</p>
                  </div>

                  <div className="my-4 relative w-28 h-28 bg-slate-900 border-2 border-emerald-500/30 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)] select-none shrink-0">
                    <div className="absolute w-20 h-20 border border-emerald-500/10 rounded-full pointer-events-none" />
                    <div className="absolute w-12 h-12 border border-emerald-500/15 rounded-full pointer-events-none" />
                    <div className="absolute w-full h-[0.5px] bg-emerald-500/10 pointer-none" />
                    <div className="absolute h-full w-[0.5px] bg-emerald-500/10 pointer-none" />

                    <div 
                      className={`absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0.3)_0deg,rgba(16,185,129,0.05)_90deg,transparent_180deg)] rounded-full ${
                        radarScanning ? "animate-spin [animation-duration:1.5s]" : "hidden"
                      }`}
                    />

                    {radarScanning && (
                      <>
                        <div className="absolute inset-2 border border-emerald-400/35 rounded-full animate-ping [animation-duration:1.8s] pointer-events-none" />
                        <div className="absolute inset-5 border border-emerald-500/20 rounded-full animate-ping [animation-duration:2.5s] [animation-delay:0.5s] pointer-events-none" />
                        <div className="absolute w-2 h-2 bg-emerald-400 rounded-full top-6 left-12 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] [animation-delay:0.3s]" />
                        <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full bottom-8 right-6 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)] [animation-delay:0.8s]" />
                        <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full top-10 right-10 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)] [animation-delay:1.2s]" />
                      </>
                    )}

                    <Compass 
                      className={`w-7 h-7 text-emerald-500/40 relative z-10 transition-all duration-300 ${
                        radarScanning ? "text-emerald-450 scale-110 rotate-12" : "dark:text-emerald-500/30"
                      }`} 
                    />
                  </div>

                  <button 
                    onClick={handleRadarScan}
                    disabled={radarScanning}
                    className="w-full text-xs font-bold px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95"
                  >
                    {radarScanning ? "📡 กำลังค้นหา..." : "📡 สแกนพิกัดรอบตัว"}
                  </button>
                </div>

                {/* Random Wheel Widget */}
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-855 dark:text-white flex items-center gap-1.5">
                      <Dices className="w-4 h-4 text-amber-500" /> วงล้อสุ่มกิจกรรมท้าสายฝน
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">สุ่มกิจกรรมกินเที่ยวหลบฝนเพื่อประคองทริป</p>
                  </div>

                  <div className="my-3 p-4 bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 rounded-2xl min-h-[60px] flex items-center justify-center text-center shadow-inner">
                    {luckyResult ? (
                      <p className="text-xs font-bold text-emerald-600 dark:text-amber-405 animate-fade-in">{luckyResult}</p>
                    ) : (
                      <p className="text-xs text-slate-405 dark:text-slate-500 italic">กดปุ่มสุ่มเพื่อดูแนวทางกิจกรรมหลบฝน</p>
                    )}
                  </div>

                  <button 
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className="w-full text-xs font-bold py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-95"
                  >
                    {isSpinning ? "💫 กำลังสุ่ม..." : "✨ สุ่มไอเดียกินเที่ยววันนี้"}
                  </button>
                </div>

              </div>

              {/* D. คู่มือเหรียญสะสม (NAN Coins Guide) */}
              <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-xs text-slate-850 dark:text-white flex items-center gap-1.5 border-b dark:border-slate-850 pb-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  ประโยชน์ของเหรียญสะสม NAN
                </h3>
                <ul className="space-y-2 text-[10.5px] text-slate-550 dark:text-slate-400 leading-relaxed font-light">
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-500 shrink-0">🌱</span>
                    <span><strong>แลกส่วนลดที่พัก/คาเฟ่:</strong> ลดสูงสุด 30% ทั่วร้านค้าในเครือข่ายจังหวัดน่าน</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-amber-500 shrink-0">🎁</span>
                    <span><strong>ของดีชุมชน:</strong> แลกรับผลิตภัณฑ์ออร์แกนิกหรือเครื่องเงินโบราณทำมือ</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-sky-505 shrink-0">🌳</span>
                    <span><strong>รักษ์โลก:</strong> โหวตสนับสนุนโครงการจัดการดูแลขยะป่าไม้ยั่งยืน</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Modals and Notifications */}

      {/* A. Radar Modal */}
      {showRadarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-card-foreground">
            
            <div className="flex justify-between items-center border-b dark:border-slate-855 pb-3">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Navigation className="w-5 h-5 text-emerald-600" /> เรดาร์ร้านค้าชุมชนใกล้ตัว
              </h3>
              <button 
                onClick={() => setShowRadarModal(false)}
                className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              ระบบแสกนหาตำแหน่งพันธมิตรผู้สนับสนุนการท่องเที่ยวคาร์บอนต่ำ ตรวจพบร้านค้าจำนวน <strong>{scannedStores.length} ร้านค้า</strong> ในขอบเขตบริการ กดเลือกพื้นที่ด้านล่างเพื่อเน้นรับภารกิจเจาะจง:
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
                          <MapPin size={10} className="text-rose-500" /> พิกัด: {storeDist} | ประเภท: {store.type || 'ร้านค้าชุมชน'}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedDistrict(storeDist);
                          setShowRadarModal(false);
                        }}
                        className="w-full text-center py-1.5 bg-emerald-50 dark:bg-emerald-955/30 text-emerald-700 dark:text-emerald-455 rounded-lg text-[10px] font-bold border border-emerald-150 dark:border-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        🎯 กรองภารกิจเฉพาะเขต {storeDist}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-400">
                  ไม่พบพิกัดร้านค้าพันธมิตรภายนอกในขณะนี้
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

      {/* B. QR Code Check-in Simulation Modal */}
      {showQrModal && selectedQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/80 backdrop-blur-sm p-4 animate-fade-in">
          
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
              animation: scan-laser 2s infinite linear;
            }
          `}</style>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-white space-y-6 relative overflow-hidden">
            
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <QrCode className="text-emerald-455 w-5 h-5" />
                <h3 className="font-bold text-sm">จำลองการสแกนเช็กอินเควส</h3>
              </div>
              <button 
                onClick={() => {
                  setShowQrModal(false);
                  setQrCodeInput("");
                  setIsScanningSimulated(false);
                  setIsVerifyingPhoto(false);
                }}
                disabled={isCheckingIn}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5 text-center">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">ภารกิจที่เลือก</h4>
              <p className="font-bold text-sm text-white leading-tight">{selectedQuest.title}</p>
              <p className="text-[10px] text-slate-400 font-light">{selectedQuest.description}</p>
            </div>

            {!isScanningSimulated && !isVerifyingPhoto && (
              <div className="space-y-4">
                <form onSubmit={handleConfirmCheckin} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">พิมพ์รหัสผ่านเช็กอิน (สำหรับทดสอบ: พิมพ์รหัสคำใบ้ร้านค้า)</label>
                    <input 
                      type="text" 
                      placeholder={`คำใบ้รหัสผ่าน: ${selectedQuest.qr_code_trigger}`}
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-all text-center font-bold"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      disabled={isCheckingIn}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      เช็กอินด้วยรหัสผ่าน ⌨️
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => startSimulatedScanner(selectedQuest.qr_code_trigger)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <QrCode size={14} />
                      จำลองมือถือสแกนคิวอาร์ 📸
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isScanningSimulated && !isVerifyingPhoto && (
              <div className="space-y-4">
                <div className="relative w-full h-56 rounded-2xl bg-black overflow-hidden flex flex-col items-center justify-center border border-slate-800">
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-[8px] font-mono font-bold text-white">CAMERA LIVE</span>
                  </div>

                  {scanSuccess ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-2 z-10">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                      <p className="text-sm font-black text-white">ตรวจพบคิวอาร์โค้ดแล้ว!</p>
                      <p className="text-[10px] text-emerald-350">กำลังดำเนินการตรวจอัปโหลดไฟล์หลักฐาน...</p>
                    </div>
                  ) : (
                    <div className="w-full h-full relative flex flex-col items-center justify-center text-center space-y-2">
                      <div className="laser-line" />
                      
                      <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/40" />
                      <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/40" />
                      <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/40" />
                      <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/40" />

                      <QrCode className="w-14 h-14 text-white/20 animate-pulse" />
                      <p className="text-xs text-white font-mono animate-pulse">หันกล้องไปที่คิวอาร์โค้ดของร้านค้า...</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-mono italic">
                    {scanSuccess ? "วิเคราะห์รูปภาพผ่านเครือข่ายสำเร็จ" : "ระบบความปลอดภัยตรวจสอบค่าพิกัด GPS เพื่อป้องกันการกรอกข้อมูลเท็จล่วงหน้า"}
                  </span>
                </div>
              </div>
            )}

            {isVerifyingPhoto && (
              <div className="space-y-5">
                <div className="relative w-full h-44 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src="/CAMP.jpg"
                    alt="หลักฐานถ่ายภาพโดยกล้องสแกน"
                    width={400}
                    height={176}
                    className="w-full h-full object-cover rounded-xl opacity-60 filter saturate-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent pointer-events-none" />
                  
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

                  <div className="absolute top-3 right-3 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 text-[9px] font-mono text-cyan-300 flex items-center gap-1 z-10">
                    <Loader2 size={10} className="animate-spin" />
                    <span>AI ANALYZING...</span>
                  </div>
                </div>

                <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border dark:border-slate-855">
                  <span className="text-[10px] font-bold text-slate-450 uppercase block mb-1">ขั้นตอนการตรวจสอบโดยระบบ AI</span>
                  
                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-350">
                    <div className="flex items-center gap-2">
                      {verifyStep >= 1 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 animate-pulse animate-spin" />
                      )}
                      <span className={verifyStep === 1 ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}>
                        อัปโหลดไฟล์ภาพเข้าระบบตรวจสอบ {verifyStep === 1 ? "(กำลังดำเนินการ...)" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {verifyStep >= 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 animate-pulse" />
                      )}
                      <span className={verifyStep === 2 ? "font-bold text-slate-900 dark:text-white text-cyan-600" : "text-slate-500"}>
                        AI วิเคราะห์วัตถุในภาพว่าตรงกับร้านค้าพันธมิตรจริงหรือไม่ {verifyStep === 2 ? "(กำลังวิเคราะห์...)" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {verifyStep >= 3 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 animate-pulse" />
                      )}
                      <span className={verifyStep === 3 ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}>
                        ตรวจสอบความถูกต้องพิกัดตำแหน่ง GPS ล้านนา {verifyStep === 3 ? "(กำลังยืนยันพิกัด...)" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* C. Level Up celebration Modal */}
      {showLevelUpModal && levelUpData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/80 backdrop-blur-md p-4 animate-fade-in">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="bg-gradient-to-b from-slate-900 via-slate-955 to-slate-900 border border-amber-550/30 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-6 relative overflow-hidden text-white">
            
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

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

            <div className="space-y-1">
              <p className="text-[10px] text-amber-450 font-extrabold tracking-widest uppercase text-amber-400">LEVEL UP CELEBRATION</p>
              <h3 className="text-xl font-black text-white">ยินดีด้วยคุณเลื่อนระดับเลเวล!</h3>
              <p className="text-xs text-slate-350">{levelUpData.title}</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-2">
              <div className="flex gap-2 text-xs">
                <span className="text-amber-400 font-bold shrink-0">✨ โบนัสพิเศษ:</span>
                <span className="text-slate-300 font-light">{levelUpData.perks}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-light">{levelUpData.description}</p>
            </div>

            <button
              onClick={() => {
                setShowLevelUpModal(false);
                setLevelUpData(null);
              }}
              className="relative z-10 w-full py-3 bg-gradient-to-r from-amber-450 to-amber-550 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-400/10 transition-all active:scale-95"
            >
              รับทราบความยินดี & ปิดหน้าต่างจ้าว 🎉
            </button>

          </div>
        </div>
      )}

      {/* D. Redeem Voucher Ticket Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6 text-white text-center relative overflow-hidden">
            
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-950 rounded-full border border-slate-800 border-r-transparent" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-955 rounded-full border border-slate-800 border-l-transparent" />

            <div className="space-y-1 pb-4 border-b border-dashed border-slate-800">
              <span className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase">CONGRATULATIONS REDEEM</span>
              <h3 className="text-base font-black text-white">{selectedReward.title}</h3>
              <p className="text-[10.5px] text-slate-400 font-light leading-relaxed">{selectedReward.description}</p>
            </div>

            <div className="space-y-4 py-2">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 relative">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">VOUCHER SECURE CODE</span>
                
                <div className="flex gap-1.5 h-6 items-center justify-center bg-slate-900 border border-slate-850 px-3 py-1 rounded">
                  {[12, 8, 14, 18, 6].map((w, i) => (
                    <div 
                      key={i}
                      className="bg-slate-900 h-full rounded-sm"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono tracking-[4px] text-slate-350 font-bold">{voucherCode}</span>
              </div>

              <div className="space-y-1 border-t border-slate-850 pt-3">
                <span className="text-[9px] text-slate-500 block uppercase">นับเวลาถอยหลังการรับสิทธิ์ล่วงหน้าคูปองหมดอายุภายใน</span>
                <p className="text-xl font-black font-mono text-emerald-450 tracking-wider flex items-center justify-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  {formatTimer(voucherTimer)}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
              💡 <strong>ข้อแนะนำ:</strong> แสดงรหัสบัตรคูปองและเช็กอินที่ร้านค้าเป้าหมายกับผู้ให้บริการชุมชนน่านภายในเวลา 15 นาทีหลังจากกด เพื่อป้องกันการเคลมสิทธิ์หมดอายุก่อนนำคูปองไปใช้งานจริงจ้าว
            </p>

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
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-655 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isRedeeming ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>ยืนยันการแลกคูปอง</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* E. Pre-trip Recommendation Modal */}
      {showPreTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/80 backdrop-blur-sm p-4 animate-fade-in">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-6 text-white text-left relative overflow-hidden">
            
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-850 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <CloudRain className="text-blue-400 w-5 h-5 animate-bounce" />
                <h3 className="font-bold text-base text-white">ข้อแนะนำการเดินทางล่วงหน้า (Pre-trip Guide)</h3>
              </div>
              <button 
                onClick={() => setShowPreTripModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-850"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 bg-blue-500/10 border border-blue-500/25 p-4 rounded-2xl shrink-0">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-blue-300">อย่าเพิ่งยกเลิกทริปน่านนะจ้าว! ⛰️</h4>
                  <p className="text-[10.5px] text-slate-300 leading-relaxed font-light">
                    พยากรณ์อากาศพบฝนตกในพื้นที่น่านช่วงวันที่เดินทางของคุณ เพื่อให้คุณเพลิดเพลินกับการท่องเที่ยวได้อย่างต่อเนื่อง ระบบได้คัดสรรกิจกรรมทดแทนในร่มระดับพรีเมียมพร้อมสิทธิประโยชน์พิเศษมาให้คุณเป็นทางเลือกหลบฝนจ้าว
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              
              {/* Offer 1 */}
              <div className="bg-slate-955/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-emerald-500/20 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                      🍵 สปาในร่มพรีเมียม
                    </span>
                    <span className="text-[9.5px] text-amber-400 font-bold font-mono">ส่วนลด 20%</span>
                  </div>
                  <h5 className="font-bold text-xs text-white">เวิร์กชอปสปาสมุนไพรเมืองน่านโบราณ</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                    ผ่อนคลายกับกลิ่นอโรมาสมุนไพรพื้นบ้านน่านท่ามกลางสายฝน พร้อมรับน้ำชาอุ่นฟรีจ้าว
                  </p>
                </div>
                <button
                  onClick={() => setPreTripClaimedId("spa")}
                  disabled={preTripClaimedId === "spa"}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] font-black shrink-0 transition-all ${
                    preTripClaimedId === "spa"
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-gradient-to-r from-emerald-555 to-teal-555 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm active:scale-95"
                  }`}
                >
                  {preTripClaimedId === "spa" ? "✓ รับสิทธิ์เรียบร้อย" : "รับสิทธิ์ล่วงหน้า 🎟️"}
                </button>
              </div>

              {/* Offer 2 */}
              <div className="bg-slate-955/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-emerald-500/20 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] bg-amber-550/10 text-amber-450 border border-amber-550/20 px-2 py-0.5 rounded-full font-bold">
                      🍫 ของกินหลบฝน
                    </span>
                    <span className="text-[9.5px] text-amber-400 font-bold font-mono">ส่วนลด 15%</span>
                  </div>
                  <h5 className="font-bold text-xs text-white">Cocoa Valley Chocolate Workshop</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                    ทำช็อกโกแลตโฮมเมดสกัดสดอร่อยๆ อบอุ่นฟินท่ามกลางสายฝนที่ตกลงมาจ้าว
                  </p>
                </div>
                <button
                  onClick={() => setPreTripClaimedId("cocoa")}
                  disabled={preTripClaimedId === "cocoa"}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] font-black shrink-0 transition-all ${
                    preTripClaimedId === "cocoa"
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-gradient-to-r from-emerald-555 to-teal-555 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm active:scale-95"
                  }`}
                >
                  {preTripClaimedId === "cocoa" ? "✓ รับสิทธิ์เรียบร้อย" : "รับสิทธิ์ล่วงหน้า 🎟️"}
                </button>
              </div>

              {/* Offer 3 */}
              <div className="bg-slate-955/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-emerald-500/20 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                      🎨 ศิลปะ & กาแฟดริป
                    </span>
                    <span className="text-[9.5px] text-amber-400 font-bold font-mono">ฟรี! โปสการ์ดทำมือ</span>
                  </div>
                  <h5 className="font-bold text-xs text-white">พิพิธภัณฑ์ศิลปะริมน่าน & Coffee Drip</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                    เดินชมงานศิลปะพื้นถิ่นน่านในแกลเลอรีในร่มรื่น พร้อมดื่มด่ำกาแฟดริปออร์แกนิกฟรีจ้าว
                  </p>
                </div>
                <button
                  onClick={() => setPreTripClaimedId("art")}
                  disabled={preTripClaimedId === "art"}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] font-black shrink-0 transition-all ${
                    preTripClaimedId === "art"
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-gradient-to-r from-emerald-555 to-teal-555 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm active:scale-95"
                  }`}
                >
                  {preTripClaimedId === "art" ? "✓ รับสิทธิ์เรียบร้อย" : "รับสิทธิ์ล่วงหน้า 🎟️"}
                </button>
              </div>

            </div>

            {/* Success Claim Alert message */}
            {preTripClaimedId && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-[11px] font-bold text-center animate-bounce shrink-0">
                🎉 บันทึกสิทธิพิเศษและคูปองกิจกรรมหลบฝนลงบัญชีของคุณเรียบร้อยแล้วจ้าว! สามารถใช้งานเช็กอินได้ในวันท่องเที่ยว
              </div>
            )}

            <div className="flex gap-2 shrink-0 border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowPreTripModal(false)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 transition-all text-center"
              >
                ยืนยันที่จะเดินทางต่อ & ปิดหน้าต่างจ้าว 🎉
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

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-12 border-t border-slate-800 relative z-20 text-xs transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-left md:text-left">

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Nan Local Verse Engine</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              ระบบวิศวกรรมซอฟต์แวร์แพลตฟอร์มเพื่อการท่องเที่ยวและยกระดับชุมชนน่าน พัฒนาขึ้นเป็นพิเศษเพื่อการแข่งขัน <span className="text-amber-400 font-medium">Nan Beyond Seasons Hackathon</span>
            </p>
            <div className="text-[10px] text-slate-500 pt-2 font-mono">
              © 2569 คณะวิทยาศาสตร์และเทคโนโลยีการเกษตร • All Rights Reserved
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Affiliation</h4>
            <p className="text-slate-300 font-medium font-sans">มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา น่าน</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Rajamangala University of Technology Lanna Nan<br />
              สาขาวิทยาการคอมพิวเตอร์ (Computer Science)
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Solo Developer
            </h4>
            <p className="text-slate-200 font-medium text-[13px]">พิชยะ สารเถื่อนแก้ว (HKM TEAM)</p>

            <div className="space-y-1.5 pt-1 text-slate-400 text-[11px] ">
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