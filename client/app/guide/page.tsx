"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Coins,
  Gift,
  Compass,
  Store,
  HelpCircle,
  CloudRain,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Laptop,
  Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GuidePage() {
  // 1. Role Toggle State ('operator' or 'tourist')
  const [activeRole, setActiveRole] = useState<"operator" | "tourist">("operator");

  // 2. Stepper States
  const [operatorStep, setOperatorStep] = useState(0);
  const [touristStep, setTouristStep] = useState(0);

  // 3. NAN Coin Calculator State
  const [checkIns, setCheckIns] = useState(3); // Default 3 check-ins

  // 4. Mini Lanna AI Campaign Simulator State
  const [simBusinessType, setSimBusinessType] = useState("cafe");
  const [simSeason, setSimSeason] = useState("rainy");

  // Mock Lanna AI Simulation Matrix
  const campaignDatabase: Record<string, Record<string, { title: string; caption: string; quest: string }>> = {
    cafe: {
      rainy: {
        title: "🌧️ กลิ่นฝนโชยมา จิ๊บโกโก้หอมๆ ตี้ปัวเน้อจ้าว",
        caption: "ฝนตกซ่าๆ แวะหลบฝนจิบโกโก้อุ่นๆ กลิ่นหอมฟุ้งริมทุ่งนาสีเขียว ต้อนรับลมฝนกรีนซีซั่น มีโปรพิเศษตี้คาเฟ่เปิ้นเน้อจ้าว ☕💚",
        quest: "ถ่ายรูปแก้วเครื่องดื่มคู่กับทิวเขาหน้าฝน รับ 150 NAN Coins ทันที!"
      },
      summer: {
        title: "☀️ คลายฮ้อน จิบน้ำสมุนไพรเย็นๆ ชื่นใจ๋ตี้เมืองน่าน",
        caption: "แดดฮ้อนๆ จะไปลืมแวะเติมความสดชื่นด้วยน้ำมะแขว่นโซดาหอมซ่า หรือชาเก๊กฮวยป่าเย็นฉ่ำตี้คาเฟ่ชุมชน แอ่วม่วนตลอดทริปจ้าว 🥤🌴",
        quest: "เช็คอินคาเฟ่ช่วงเวลา 12.00 - 15.00 น. รับ 150 NAN Coins!"
      },
      autumn: {
        title: "🍂 ปลายฝนต้นหนาว ดริปกาแฟสายหมอกตี้บ่อเกลือ",
        caption: "สัมผัสไอเย็นแรกของปี นั่งดริปกาแฟอาราบิก้าแท้ คลอเคล้าสายหมอกยามเช้า บรรยากาศโรแมนติกขนาดนี้ ต้องชวนคนตี้ฮักมาเน้อจ้าว ☕🌫️",
        quest: "ถ่ายภาพวิวดริปกาแฟยามเช้า รับ 150 NAN Coins!"
      }
    },
    homestay: {
      rainy: {
        title: "🌾 นอนฟังเสียงฝน ตื่นมาชมทะเลหมอกปัวหน้าฝน",
        caption: "หนีบรีฟงานมานอนสโลว์ไลฟ์ สูดกลิ่นดินกลิ่นหญ้าหน้าฝน ยามเจ๊าตื่นมาดูหมอกลอยต่ำผ่านระเบียงที่พัก โฮมสเตย์ชุมชนอบอุ่นเหมือนบ้านเน้อจ้าว 🏡🌧️",
        quest: "แชร์คลิปเสียงฝนตกตกระเบียงโฮมสเตย์ รับ 200 NAN Coins!"
      },
      summer: {
        title: "☀️ แคมป์ปิ้งริมธารน้ำใส ดับฮ้อนตี้บ่อเกลือ",
        caption: "หน้าร้อนนี้เปลี่ยนบรรยากาศมานอนโฮมสเตย์ติดลำธาร เอาเท้าจุ่มน้ำใสๆ เย็นเฉียบ สัมผัสวิถีชีวิตดั้งเดิมที่เรียบง่าย นอนหลับสบายเสียงน้ำไหลจ้าว ⛺🌊",
        quest: "เช็คอินริมธารน้ำโฮมสเตย์ รับ 150 NAN Coins!"
      },
      autumn: {
        title: "🍂 ก่อกองไฟ ผิงดาวท้าลมหนาวที่ยอดดอยน่าน",
        caption: "เริ่มสัมผัสลมหนาวมาเยือน นั่งล้อมวงผิงไฟย่างข้าวจี่อุ่นๆ นอนดูดาวเต็มท้องฟ้าแจ่มใสปอยๆ บนโฮมสเตย์วิวหลักล้าน ปลายปีนี้เจอกันเน้อจ้าว 🌟🌌",
        quest: "เช็คอินโฮมสเตย์ช่วงปลายฝนต้นหนาว รับ 150 NAN Coins!"
      }
    },
    workshop: {
      rainy: {
        title: "🌾 กิจกรรมดำนาเรียนรู้วิถีชุมชน อ.ปัว",
        caption: "มาต้วยกันเต๊อะจ้าว! ชวนลงแปลงดำนาข้าวขั้นบันไดช่วงหน้าฝน เรียนรู้วิถีเกษตรอินทรีย์ ดำนาเปื้อนโคลนเล็กน้อยแต่สนุกสนานและได้ความรู้ขนาดเน้อ 🌾🌱",
        quest: "ลงมือดำนาขั้นบันไดและถ่ายรูปคู่กับป้ายสวนเกษตร รับ 250 NAN Coins!"
      },
      summer: {
        title: "☀️ เก็บเกี่ยวพืชผลการเกษตร ชิมผลไม้สดๆ จากต้น",
        caption: "แอ่วสวนชุมชนหน้าผลไม้ ดมกลิ่นเสาวรสสดๆ หรือช่วยเก็บผลผลิตออร์แกนิกในโรงเรือน ช้อปสินค้าเกษตรแปรรูปฝีมือชาวบ้านกลับบ้านต้วยกันเน้อจ้าว 🍊🥭",
        quest: "ซื้อสินค้าชุมชนครบ 200 บาทพร้อมเช็คอิน รับ 150 NAN Coins!"
      },
      autumn: {
        title: "🍂 ต้มเกลือสินเธาว์โบราณแบบดั้งเดิมที่บ่อเกลือ",
        caption: "เรียนรู้เคล็ดลับการต้มเกลือภูเขาหนึ่งเดียวในโลก ลองหยิบฟืน ตักน้ำเกลือต้มในกระทะยักษ์ รับฟังประวัติศาสตร์พันปีจากพ่ออุ้ยแม่อุ้ยในชุมชนจ้าว 🧂🔥",
        quest: "ถ่ายภาพคู่กับกระทะต้มเกลือโบราณ รับ 200 NAN Coins!"
      }
    }
  };

  const selectedCampaign = campaignDatabase[simBusinessType]?.[simSeason] || campaignDatabase.cafe.rainy;

  // Stepper Content Arrays
  const operatorSteps = [
    {
      title: "1. เข้าสู่ระบบ Command Center",
      desc: "ผู้ประกอบการลงชื่อเข้าใช้งานด้วยสิทธิ์ผู้จัดการร้านค้า ระบบจะผูกบัญชีเข้ากับหน้าร้านของคุณโดยอัตโนมัติ (เช่น ปัว หรือ บ่อเกลือ) เพื่อดึงพิกัดที่ตั้งสำหรับการแจกเควสพิกัดล้อมรั้ว",
      tip: "สามารถเปิดใช้สิทธิ์เดโมเพื่อข้ามการสมัครใช้งานได้ทันที"
    },
    {
      title: "2. กรอกคีย์เวิร์ดของร้านและเลือกบริบท",
      desc: "ป้อนข้อมูลประเภทธุรกิจ (โฮมสเตย์, คาเฟ่, ร้านอาหาร) พร้อมเลือกบริบทฤดูกาลที่ต้องการกระตุ้นยอดขาย และพิมพ์คีย์เวิร์ดเด่นของร้าน เช่น 'โกโก้น่านออร์แกนิก', 'มีดริปกาแฟริมทุ่ง'",
      tip: "พิมพ์คีย์เวิร์ดกระชับจะช่วยให้ AI เสกคำโฆษณาได้เจาะจงมากขึ้น"
    },
    {
      title: "3. เสกแคมเปญอัจฉริยะ (AI Summons)",
      desc: "กดปุ่มเสกแคมเปญ AI จะดึงโมเดล Gemini มาวิเคราะห์ สรรค์สร้างชื่อแคมเปญ แคปชั่นภาษาล้านนาสุดน่ารักอบอุ่น และออกแบบเควสกิจกรรมเช็คอิน พร้อมแสดงภาพแคมเปญโฆษณาและส่งต่อ Prompt ภาพ",
      tip: "คัดลอกแคปชั่นคำเมืองไปลงโซเชียลเพื่อเรียกแขกได้ทันที"
    },
    {
      title: "4. ส่งกิจกรรมเข้าแอปนักท่องเที่ยว",
      desc: "เมื่อพอใจกับแคมเปญ กดปุ่ม 'ส่งกิจกรรมนี้เข้าสู่ App นักท่องเที่ยว' ระบบจะแปลงแคมเปญเป็นภารกิจ (Quest) นำไปแสดงผลบนแผนที่และบอร์ดนักท่องเที่ยว พร้อมฝังระบบสะสมแต้ม 150 NAN Coins ทันที",
      tip: "นักท่องเที่ยวจะเห็นกิจกรรมของคุณผ่านระบบพิกัด GPS"
    }
  ];

  const touristSteps = [
    {
      title: "1. เปิดบอร์ดภารกิจ & แผนที่น่าน",
      desc: "นักท่องเที่ยวเข้าสู่หน้าจอกิจกรรม (B2C Gamification App) เพื่อสำรวจรายการเควสต่างๆ ที่เปิดใช้งานในจังหวัดน่าน โดยสามารถเลือกกรองพื้นที่ตามอำเภอ เช่น ปัว, บ่อเกลือ หรือเมืองน่าน",
      tip: "เปิดใช้ฟังก์ชั่นวงล้อสุ่มไอเดียเที่ยวหากยังไม่รู้จะไปไหนดี"
    },
    {
      title: "2. ทำกิจกรรมและรับ Weather Alert",
      desc: "ออกเดินทางไปสัมผัสเสน่ห์น่าน หากฝนตกหนัก ระบบตรวจจับสภาพอากาศ (Weather AI) จะยิงแจ้งเตือนภารกิจฉุกเฉิน 'หลบฝนจิบชาอุ่น' ตามพิกัดใกล้ตัว ดึงดูดให้เข้าไปพักผ่อนและช่วยเหลือยอดขายร้านย่อย",
      tip: "กิจกรรมสีเขียวจะให้ผลตอบแทนแต้ม NAN Coins สูงเป็นพิเศษ"
    },
    {
      title: "3. เช็คอิน & สแกนรับเหรียญ NAN Coins",
      desc: "เมื่อไปถึงร้านค้า ให้ทำกิจกรรมตามกำหนด (เช่น ถ่ายรูปวิวกินข้าวซอย หรือลงมือต้มเกลือ) จากนั้นกดปุ่มเช็คอินเพื่อสแกน QR Code ประจำร้านค้าเพื่อยืนยันภารกิจ และรับเหรียญสะสมเข้ากระเป๋าดิจิทัล",
      tip: "เหรียญจะอัปเดตเข้าระบบแบบเรียลไทม์พร้อมเสียงเหรียญเด้งน่ารัก"
    },
    {
      title: "4. แลกสิทธิประโยชน์สุดว้าว",
      desc: "นำเหรียญสะสม NAN Coins ในบัญชีไปใช้แลกรางวัลที่หน้าบอร์ด ไม่ว่าจะเป็นคูปองส่วนลด 10%-30% แลกช็อกโกแลตร้อน แลกของที่ระลึกเครื่องเงิน หรือจะบริจาคแต้มเพื่อช่วยสมทบทุนโครงการปลูกป่าต้นน้ำ",
      tip: "ยิ่งเลเวลนักท่องเที่ยวสูง จะยิ่งปลดล็อกของรางวัลลิมิเต็ดมากขึ้น"
    }
  ];

  const currentSteps = activeRole === "operator" ? operatorSteps : touristSteps;
  const currentStepIndex = activeRole === "operator" ? operatorStep : touristStep;
  const setStepIndex = activeRole === "operator" ? setOperatorStep : setTouristStep;

  // NAN Coin Calculator logic
  const calculatedCoins = checkIns * 150;
  const getCalculatorMilestones = (coins: number) => {
    return [
      { min: 100, label: "🌱 โหวตโครงการปลูกป่าน่านยั่งยืน", status: coins >= 100 },
      { min: 300, label: "☕ ส่วนลดเครื่องดื่มคาเฟ่ 10%", status: coins >= 300 },
      { min: 600, label: "🏠 ส่วนลดโฮมสเตย์หน้าฝน 20%", status: coins >= 600 },
      { min: 900, label: "🍫 ฟรี ผลิตภัณฑ์โกโก้น่านออร์แกนิก 1 กล่อง", status: coins >= 900 },
      { min: 1200, label: "💍 ฟรี งานจักสานหรือเครื่องเงินทำมือโบราณ", status: coins >= 1200 },
    ];
  };

  const milestones = getCalculatorMilestones(calculatedCoins);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center relative overflow-hidden transition-all select-none pb-12">
      {/* 🌫️ ลูกเล่นสายหมอก */}
      <div className="fog-layer absolute top-20 left-0 right-0 h-40 bg-gradient-to-r from-emerald-100/10 via-slate-200/30 to-teal-100/10 blur-2xl pointer-events-none z-0" />

      {/* แสงออร่าธรรมชาติ */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* 🧭 Header */}
      <header className="w-full max-w-5xl h-16 px-6 flex items-center justify-between border-b border-slate-200/60 relative z-20 backdrop-blur-md bg-white/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black tracking-tight text-slate-900 text-sm md:text-base block">
              NAN BEYOND SEAS
            </span>
            <span className="text-[9px] font-mono text-emerald-700 block tracking-widest -mt-0.5">LOCAL-VERSE ENGINE</span>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs font-bold px-4 py-2 border border-slate-200 hover:bg-slate-55 bg-white text-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          กลับหน้าหลัก
        </Link>
      </header>

      {/* 🌾 Main Container */}
      <main className="flex flex-col flex-1 w-full max-w-4xl items-center py-12 px-6 space-y-12 relative z-10">
        
        {/* หัวข้อคู่มือ */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-250 text-slate-650 text-[10px] font-bold shadow-sm">
            📖 คู่มือท่องเที่ยวและจัดการระบบนิเวศน่านอินเตอร์แอกทีฟ
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
            เที่ยวสนุก จัดการง่าย <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              ด้วยระบบเกมคู่หู AI ลุ่มลึก
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            มาร่วมเจาะลึกวิธีการเล่น วิธีเสกแคมเปญ และทำความเข้าใจกลยุทธ์ขับเคลื่อนการท่องเที่ยวสีเขียว ผ่านตัวสอดส่องและคำนวณรางวัลจำลองด้านล่างได้เลยเน้อจ้าว
          </p>
        </div>

        {/* 🎭 1. INTERACTIVE SLIDER TAB (สลับสิทธิ์การเรียนรู้) */}
        <div className="w-full max-w-md bg-white border border-slate-200 p-1.5 rounded-2xl shadow-md flex relative">
          {/* Active indicator background */}
          <div
            className={`absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-300 pointer-events-none z-0 ${
              activeRole === "operator" ? "left-1.5 w-[calc(50%-6px)]" : "left-[calc(50%+3px)] w-[calc(50%-6px)]"
            }`}
          />
          <button
            onClick={() => {
              setActiveRole("operator");
            }}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all relative z-10 flex items-center justify-center gap-2 ${
              activeRole === "operator" ? "text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Store className="w-4 h-4" />
            สำหรับผู้ประกอบการ
          </button>
          <button
            onClick={() => {
              setActiveRole("tourist");
            }}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all relative z-10 flex items-center justify-center gap-2 ${
              activeRole === "tourist" ? "text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Compass className="w-4 h-4" />
            สำหรับนักท่องเที่ยว
          </button>
        </div>

        {/* 📝 2. INTERACTIVE STEPPER BOARD (วิซาร์ดการใช้งาน) */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
          
          {/* แถบข้างซ้าย: รายการสเต็ป (5 columns) */}
          <div className="md:col-span-5 bg-slate-50 border-r border-slate-200/80 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {activeRole === "operator" ? "🟢 Operator Steps" : "🟠 Tourist Quests"}
              </span>
              <h3 className="font-black text-lg text-slate-800">ขั้นตอนการใช้งาน</h3>
              <div className="space-y-2.5">
                {currentSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStepIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between text-xs font-bold ${
                      currentStepIndex === idx
                        ? "bg-white border-emerald-500 text-emerald-700 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span>{step.title.split(".")[1] || step.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${
                        currentStepIndex === idx ? "translate-x-1 text-emerald-600" : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ปุ่มนำทางขั้นตอน */}
            <div className="flex gap-2 pt-4 border-t border-slate-200/60 mt-4">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                className="flex-1 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-900 transition-all text-[11px] font-bold disabled:opacity-40 flex items-center justify-center gap-1"
              >
                ย้อนกลับ
              </button>
              <button
                disabled={currentStepIndex === currentSteps.length - 1}
                onClick={() => setStepIndex((prev) => Math.min(currentSteps.length - 1, prev + 1))}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-[11px] font-bold disabled:opacity-40 flex items-center justify-center gap-1"
              >
                ถัดไป
              </button>
            </div>
          </div>

          {/* แถบข้างขวา: รายละเอียดภาพประกอบ / คำอธิบาย (7 columns) */}
          <div className="md:col-span-7 p-8 flex flex-col justify-between space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex + "-" + activeRole}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    activeRole === "operator" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-250" 
                      : "bg-amber-50 text-amber-705 border border-amber-250"
                  }`}>
                    STEP {currentStepIndex + 1}
                  </span>
                </div>
                
                <h4 className="text-xl font-black text-slate-900">
                  {currentSteps[currentStepIndex].title}
                </h4>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  {currentSteps[currentStepIndex].desc}
                </p>

                {/* คำแนะนำเสริม */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-650 flex items-start gap-2 italic">
                  <HelpCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>เคล็ดลับเด็ด:</strong> {currentSteps[currentStepIndex].tip}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ท้ายสเต็ปแสดงลิงก์เชื่อมต่อไปยังระบบจริง */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">พร้อมเริ่มทดสอบฟีเจอร์นี้รึยังจ้าว?</span>
              <Link
                href={activeRole === "operator" ? "/login" : "/quests"}
                className={`font-black flex items-center gap-1 hover:underline ${
                  activeRole === "operator" ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {activeRole === "operator" ? "เข้าห้องควบคุมผู้ประกอบการ" : "กระดานเควสท่องเที่ยว"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 🧮 3. INTERACTIVE COIN CALCULATOR (ลูกเล่นจำลองการคำนวณแต้ม NAN Coins) */}
        <div className="w-full bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden text-left">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">เครื่องคำนวณสิทธิ์ & แลกรางวัล NAN Coins</h3>
                <p className="text-[10px] text-slate-400">คำนวณสิทธิประโยชน์จากแผนทริปท่องเที่ยวเมืองน่านของคุณ</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-amber-300 font-mono self-start sm:self-auto">
              1 Check-in / Quest = 150 NAN Coins
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* ฝั่งสไลเดอร์อินพุต (5 columns) */}
            <div className="md:col-span-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex justify-between">
                  <span>จำนวนสถานที่เช็คอิน / เควสที่วางแผนทำ:</span>
                  <span className="text-amber-400 text-sm font-black">{checkIns} แห่ง</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkIns}
                  onChange={(e) => setCheckIns(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* แสดงผลแต้มที่ได้รับ */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase">คะแนนสะสมที่จะได้รับ</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">{calculatedCoins} <span className="text-xs text-white font-normal">NAN Coins</span></span>
                </div>
                <Coins className="w-8 h-8 text-amber-400/80 animate-bounce" />
              </div>
            </div>

            {/* ฝั่งรางวัลที่ปลดล็อกได้ (7 columns) */}
            <div className="md:col-span-7 space-y-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">🎁 สิทธิประโยชน์ที่ปลดล็อกได้</span>
              <div className="space-y-2">
                {milestones.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all duration-300 ${
                      item.status
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                        : "bg-slate-900/40 border-slate-800 text-slate-500"
                    }`}
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <span>{item.label}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{item.min} Coins</span>
                      {item.status ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-700 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 🪄 4. MINI AI CAMPAIGN SIMULATOR (ลูกเล่นเสกแคมเปญจำลองให้ทดสอบในคู่มือ) */}
        <div className="w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6 text-left">
          
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ทดลองเสกแคมเปญจำลอง (Lanna AI Simulator)</h3>
              <p className="text-[10px] text-slate-400">เข้าใจการทำงานการคิดสร้างสรรค์แคมเปญของ AI ก่อนเข้าสู่ระบบจริง</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* ซ้าย: เลือกบรีฟจำลอง */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-650">1. เลือกประเภทธุรกิจ:</label>
                <select
                  value={simBusinessType}
                  onChange={(e) => setSimBusinessType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-205 outline-none text-xs font-semibold focus:border-emerald-500"
                >
                  <option value="cafe">☕ คาเฟ่ / ร้านชากลางทุ่งนา</option>
                  <option value="homestay">🏠 โฮมสเตย์ / รีสอร์ตชุมชนบนดอย</option>
                  <option value="workshop">🌾 วิสาหกิจชุมชน / สวนเกษตรต้มเกลือ</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-650">2. เลือกช่วงเวลากระตุ้นท่องเที่ยว:</label>
                <select
                  value={simSeason}
                  onChange={(e) => setSimSeason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-205 outline-none text-xs font-semibold focus:border-emerald-500"
                >
                  <option value="rainy">🌧️ หน้าฝนกรีนซีซั่น (สถิติคนน้อย)</option>
                  <option value="summer">☀️ หน้าร้อนเมษายน (ช่วงคนเที่ยวรอง)</option>
                  <option value="autumn">🍂 ปลายฝนต้นหนาว (ช่วงหมอกเริ่มจับตัว)</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-[10.5px] text-emerald-800">
                <Smile className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>กลยุทธ์ AI:</strong> AI จะดึงคำเมืองดั้งเดิมผสมความอบอุ่นล้านนา และแปลงคุณค่าสภาพอากาศมาเป็นภารกิจให้สอดคล้องกับพิกัดร้านค้าของคุณ
                </p>
              </div>
            </div>

            {/* ขวา: ผลลัพธ์จำลองของ AI */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-150 space-y-4">
              <div>
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">ผลลัพธ์จาก AI จำลอง</span>
                <h4 className="font-bold text-sm text-slate-900">{selectedCampaign.title}</h4>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block">แคปชั่นโซเชียลมีเดีย:</span>
                <p className="text-xs italic bg-white p-3 rounded-lg border border-slate-100 text-slate-750 leading-relaxed">
                  "{selectedCampaign.caption}"
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block">เควสกิจกรรมชุมชน (Gamification Quest):</span>
                <p className="text-xs bg-white p-3 rounded-lg border border-slate-100 text-emerald-800 leading-relaxed font-semibold">
                  🎮 {selectedCampaign.quest}
                </p>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* 🧭 Footer */}
      <footer className="w-full bg-slate-900 text-slate-450 py-12 border-t border-slate-800 relative z-20 text-xs transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-[11px] text-slate-500">
            ระบบวิศวกรรมซอฟต์แวร์แพลตฟอร์มเพื่อการท่องเที่ยวและยกระดับชุมชนน่าน • Nan Beyond Seasons Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
}
