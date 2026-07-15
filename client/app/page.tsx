"use client";

import Link from "next/link";
import {
  Sparkles,
  CloudRain,
  ArrowRight,
  Compass,
  Store,
  TreePine,
  Heart,
  UtensilsCrossed,
  Coins,
  Gift,
  TrendingUp,
  MapPin,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useEffect } from "react";

// Component นกกระยางน่านขยายปีกพริ้วของจริง (ไม่แกงแล้วครับเดฟ 555)
function AnimatedBird({ delay, duration, startY }: { delay: number; duration: number; startY: string }) {
  return (
    <motion.div
      initial={{ x: "-10vw", y: startY, opacity: 0, scale: 0.5 }}
      animate={{
        x: "110vw",
        y: ["20vh", "17vh", "24vh", "15vh"],
        opacity: [0, 0.9, 0.9, 0],
        scale: [0.5, 0.8, 0.8, 0.5]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute left-0 z-10 text-slate-400/40 filter drop-shadow-md"
    >
      {/* ขยับปีกขึ้นลงนุ่มนวลสมจริง */}
      <motion.svg
        width="48"
        height="36"
        viewBox="0 0 64 64"
        fill="currentColor"
        animate={{
          scaleY: [1, 0.3, 1.1, 1], // จังหวะกาง-หุบ-ตีปีกผ่อนแรงแบบนกจริง
          y: [0, -3, 1, 0]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* ปรับโครงสร้าง Path ใหม่เป็นโมเดลนกกระยางกางปีกร่อน */}
        <path d="M32,24 C26,12 12,6 2,16 C12,18 22,24 28,28 C29,26 31,25 32,25 C33,25 35,26 36,28 C42,24 52,18 62,16 C52,6 38,12 32,24 Z M32,26 C31,28 30,34 32,42 C34,34 33,28 32,26 Z" />
      </motion.svg>
    </motion.div>
  );
}


export default function Home() {
  useEffect(() => {
    async function testConnection() {
      console.log("⏳ กำลังทดสอบเชื่อมต่อ Supabase...");

      // ลองดึงข้อมูลจากตาราง quests (หรือตารางอะไรก็ได้ที่เดฟสร้างไว้)
      const { data, error } = await supabase.from("quests").select("*").limit(1);

      if (error) {
        console.error("❌ เชื่อมต่อพัง! Error:", error.message);
      } else {
        console.log("✅ เชื่อมต่อสำเร็จฉลุย! ข้อมูลที่ได้:", data);
      }
    }

    testConnection();
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center relative overflow-hidden transition-all select-none">

      {/* 🐦 ================= CSS ANIMATION STYLE ================= */}
      <style jsx global>{`
        @keyframes fly-horizontal {
          0% { transform: translate(-10%, 10vh) scale(0.6); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(110vw, -10vh) scale(1); opacity: 0; }
        }
        @keyframes cloud-drift {
          0% { transform: translateX(-20%); opacity: 0.2; }
          50% { opacity: 0.4; }
          100% { transform: translateX(20%); opacity: 0.2; }
        }
        .bird-1 { animation: fly-horizontal 25s linear infinite; }
        .bird-2 { animation: fly-horizontal 35s linear infinite; animation-delay: 7s; }
        .bird-3 { animation: fly-horizontal 28s linear infinite; animation-delay: 15s; }
        .fog-layer { animation: cloud-drift 40s ease-in-out infinite alternate; }
      `}</style>

      {/* 🌫️ ลูกเล่นสายหมอก */}
      <div className="fog-layer absolute top-20 left-0 right-0 h-40 bg-gradient-to-r from-emerald-100/10 via-slate-200/30 to-teal-100/10 blur-2xl pointer-events-none z-0" />

      {/* 🐦 ลูกเล่นฝูงนกกระยางขาว */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[
          { delay: 0, duration: 22, startY: "15vh" },
          { delay: 3, duration: 26, startY: "25vh" },
          { delay: 6, duration: 20, startY: "18vh" },
          { delay: 9, duration: 29, startY: "35vh" },
          { delay: 13, duration: 24, startY: "22vh" },
          { delay: 17, duration: 27, startY: "28vh" },
        ].map((bird, index) => (
          <AnimatedBird
            key={index}
            delay={bird.delay}
            duration={bird.duration}
            startY={bird.startY}
          />
        ))}
      </div>

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
        <div className="flex items-center gap-3">
          <Link
            href="/guide"
            className="text-xs font-bold px-3.5 py-2 border border-slate-200 hover:bg-slate-100 bg-white text-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>คู่มือระบบ</span>
          </Link>
          <Link
            href="/login"
            className="text-xs font-bold px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl transition-all shadow-sm"
          >
            เปิดระบบเดโม
          </Link>
        </div>
      </header>

      {/* 🌾 Main Section */}
      <main className="flex flex-col flex-1 w-full max-w-5xl items-center justify-center py-16 px-6 text-center space-y-16 relative z-10">

        {/* สโลแกนหลัก */}
        <div className="space-y-4 max-w-4xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold shadow-sm">
            ⛰️ ยินดีต้อนรับสู่ดินแดนแห่งขุนเขาและสายหมอก
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-[1.2] tracking-tight text-slate-900 py-1">
            เปลี่ยนเสียงกระซิบรักหน้าฝน <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent py-1 px-2 inline-block">
              ให้เป็นพลังเศรษฐกิจชุมชนน่านตลอดปี
            </span>
          </h1>
          <p className="text-sm md:text-base leading-relaxed text-slate-500 max-w-2xl mx-auto">
            เพราะเสน่ห์ของน่านไม่ได้มีแค่หน้าหนาว <strong>Nan Local-Verse Engine</strong> คือซอฟต์แวร์ B2B2C อัจฉริยะที่ใช้ข้อมูลสภาพอากาศและพลัง AI เพื่อขับเคลื่อนการท่องเที่ยวเมืองรอง ดึงนักท่องเที่ยวสายลุยเข้าสู่ร้านค้าย่อยในอำเภอปัว บ่อเกลือ และเมืองน่านในช่วง Green Season
          </p>
        </div>

        {/* 🧭 การเลือกประตูทางเข้า */}
        <div className="w-full max-w-3xl bg-white/70 backdrop-blur border border-slate-200 p-6 rounded-3xl shadow-xl space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">🏆 เลือกสถานะเพื่อเริ่มต้นการผจญภัยระบบทดสอบ</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/login"
              className="flex items-center justify-between p-5 border border-slate-200 hover:border-emerald-500 rounded-2xl hover:bg-emerald-50/20 transition-all group bg-white shadow-sm"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block tracking-wider">B2B COMMAND CENTER</span>
                  <span className="text-sm font-bold text-slate-800">ผู้ประกอบการ / วิสาหกิจย่อย</span>
                  <p className="text-[11px] text-slate-400">เข้าหน้า Dashboard คุม AI เสกแคมเปญ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/quests"
              className="flex items-center justify-between p-5 border border-slate-200 hover:border-amber-500 rounded-2xl hover:bg-amber-50/20 transition-all group bg-white shadow-sm"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase block tracking-wider">B2C GAMIFICATION APP</span>
                  <span className="text-sm font-bold text-slate-800">นักท่องเที่ยว / สายลุยหน้าฝน</span>
                  <p className="text-[11px] text-slate-400">เข้ากระดานเกมสุ่มวงล้อสแกนล่าเควส</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* 💰 ================= SECTION ระบบเหรียญรางวัล NAN Coins & ฟีเจอร์หลักของระบบ ================= */}
        <div className="w-full max-w-5xl space-y-10 pt-4">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 text-[10px] font-bold shadow-sm">
              <Coins className="w-3.5 h-3.5 animate-pulse text-amber-500" /> NAN COIN ECOSYSTEM
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              เจาะลึกระบบแต้มท่องเที่ยวสะสม & ฟีเจอร์อัจฉริยะ
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
              แพลตฟอร์มที่เชื่อมโยงเทคโนโลยี AI เข้ากับเศรษฐกิจท้องถิ่นน่าน ให้ทุกการท่องเที่ยวของคุณเปลี่ยนเป็นมูลค่ากลับคืนสู่ชุมชน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* กล่องซ้าย: NAN Coins & สิทธิประโยชน์ (แลกรางวัล) */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
              {/* แสงออร่าในกล่อง */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 text-amber-300 rounded-2xl shadow-inner">
                    <Coins className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">เหรียญสะสม NAN Coins</h3>
                    <p className="text-[10px] font-mono text-emerald-300 tracking-wider">LOCAL GREEN TOKEN SYSTEM</p>
                  </div>
                </div>

                <p className="text-xs text-emerald-100/85 leading-relaxed">
                  เหรียญรางวัลสะสมหรือดิจิทัลโทเค็นประจำท้องถิ่น ที่นักท่องเที่ยวจะได้รับจากการทำกิจกรรม/เควสในพื้นที่ เช่น การเช็กอินในร้านค้าในหุบเขา คาเฟ่ริมทุ่ง หรือสนับสนุนร้านค้าชุมชน เพื่อนำไปแลกเปลี่ยนเป็นสิทธิพิเศษที่ใช้งานได้จริงในน่าน
                </p>

                {/* รายละเอียดการแลก 3 มิติ */}
                <div className="space-y-3.5 pt-3">
                  {/* แลกส่วนลด */}
                  <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="text-amber-400 mt-0.5">🏷️</div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-350">แลกรับส่วนลดร้านค้าท้องถิ่น (10% - 30%)</h4>
                      <p className="text-[10px] text-emerald-100/70 leading-normal">
                        ใช้แลกเป็นส่วนลดค่าเข้าพักโฮมสเตย์ปัว บ่อเกลือ ร้านอาหารพื้นเมือง หรือคาเฟ่กาแฟดริปที่ร่วมรายการ
                      </p>
                    </div>
                  </div>

                  {/* แลกของรางวัล */}
                  <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="text-amber-400 mt-0.5">🎁</div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-350">แลกผลิตภัณฑ์ชุมชนและสินค้าแฮนด์เมด</h4>
                      <p className="text-[10px] text-emerald-100/70 leading-normal">
                        สะสมแต้มแลกฟรีโกโก้น่านออร์แกนิก ชาเมี่ยงโบราณ งานจักสาน หรือเครื่องเงินจากศูนย์หัตถกรรม
                      </p>
                    </div>
                  </div>

                  {/* บริจาคสีเขียว */}
                  <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="text-emerald-400 mt-0.5">🌱</div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-350">ร่วมโหวตสนับสนุนกิจกรรมสีเขียว (Green Vote)</h4>
                      <p className="text-[10px] text-emerald-100/70 leading-normal">
                        บริจาคเหรียญสะสมเพื่อสนับสนุนการฟื้นฟูผืนป่าต้นน้ำและการบริหารขยะยั่งยืนของโครงการในน่าน
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 relative z-10">
                <Link
                  href="/quests"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl transition-all shadow-md group"
                >
                  <Gift className="w-3.5 h-3.5" />
                  ไปที่บอร์ดเควส & แลกรางวัล
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* กล่องขวา: ฟีเจอร์และภาพรวมระบบ (Platform Capabilities) */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl flex flex-col justify-between min-h-[420px] text-slate-800">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-650 rounded-2xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">ฟีเจอร์เด่นของแพลตฟอร์ม</h3>
                    <p className="text-[10px] font-mono text-emerald-650 tracking-wider">PLATFORM KEY CAPABILITIES</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* ฟีเจอร์ 1: AI Generator */}
                  <div className="flex gap-4">
                    <div className="p-2 bg-slate-50 text-emerald-600 rounded-lg h-fit border border-slate-100">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950">ระบบเสกแคมเปญการตลาดด้วย AI (B2B Command)</h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed mt-0.5">
                        ผู้ประกอบการสามารถป้อนบรีฟร้านค้า เพื่อให้ AI ล้ำยุคคำนวณและเสกชื่อแคมเปญ แคปชั่นภาษาล้านนา และระบบเควสสะสมแต้ม รวมถึงภาพประกอบโฆษณาใน 1 คลิก
                      </p>
                    </div>
                  </div>

                  {/* ฟีเจอร์ 2: Weather AI */}
                  <div className="flex gap-4">
                    <div className="p-2 bg-slate-50 text-emerald-600 rounded-lg h-fit border border-slate-100">
                      <CloudRain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950">โมดูล Context-Aware แจ้งเตือนพายุฝน (Weather AI)</h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed mt-0.5">
                        ระบบจะคอยจับพิกัดอากาศแบบสดๆ หากฝนเริ่มตั้งเค้า ระบบจะส่งเควสเชิญชวนให้นักท่องเที่ยวหลบฝนหรือแวะพักดื่มกาแฟอุ่นๆ ในร้านค้าใกล้เคียงทันที
                      </p>
                    </div>
                  </div>

                  {/* ฟีเจอร์ 3: Gamification Map */}
                  <div className="flex gap-4">
                    <div className="p-2 bg-slate-50 text-emerald-600 rounded-lg h-fit border border-slate-100">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950">บอร์ดภารกิจตามหาอัตลักษณ์น่าน (B2C App)</h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed mt-0.5">
                        ระบบจัดสรรเควสกิจกรรมกระจายรายได้ เช่น ตามรอยนาข้าวป่าปัว แวะโรงเกลือสินเธาว์ หรือชิมอาหารพื้นเมืองมะแขว่น ชวนให้นักท่องเที่ยวออกลุยเมืองรองอย่างสนุกสนาน
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  จัดการร้านค้า
                </Link>
                <Link
                  href="/quests"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200"
                >
                  เข้าสู่บอร์ดกิจกรรม
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ⛰️ ================= SECTION เจาะลึก 4 เสาหลักเสน่ห์เมืองน่าน (FIXED BUG: เพิ่ม min-h และปรับ Padding ท้ายกล่องเรียบร้อย) ================= */}
        <div className="space-y-8 w-full max-w-5xl pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">4 มิติการขับเคลื่อนนวัตกรรม (4 pillars of Nan Engine)</h2>
            <p className="text-xs md:text-sm text-slate-400">ชูโรง 4 ด้านเพื่อตอบโจทย์โจทย์หลักการท่องเที่ยวน่านอย่างสมบูรณ์แบบ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">

            {/* การ์ด 1 */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col min-h-[220px]">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3">
                <TreePine className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 uppercase font-mono tracking-wide mb-2">1. ด้านชุมชน (Community)</h4>
              <p className="text-xs text-slate-500 leading-relaxed pb-2">
                ดึงอัตลักษณ์การทำ <strong>นาขั้นบันไดของปัว</strong> และ <strong>วิถีทำเกลือสินเธาว์ภูเขาบ่อเกลือ</strong> มาแปลงเป็นสิทธิประโยชน์ เพื่อดึงดูดนักท่องเที่ยวให้กระจายตัวออกจากกระจุกเมืองหลัก
              </p>
            </div>

            {/* การ์ด 2 */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col min-h-[220px]">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 uppercase font-mono tracking-wide mb-2">2. ด้านสุขภาพ (Wellness)</h4>
              <p className="text-xs text-slate-500 leading-relaxed pb-2">
                แนะนำกิจกรรม Workation สโลว์ไลฟ์เพื่อบำบัดความเครียดท่ามกลางอากาศบริสุทธิ์ของน่านวันธรรมดา เหมาะกับกลุ่ม Digital Nomad ที่มองหาความสงบสงบเงียบ
              </p>
            </div>

            {/* การ์ด 3 */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col min-h-[220px]">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3">
                <CloudRain className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 uppercase font-mono tracking-wide mb-2">3. ด้านภูมิอากาศ (Weather AI)</h4>
              <p className="text-xs text-slate-500 leading-relaxed pb-2">
                แก้ปมหน้าฝน/หน้าโลว์ซีซั่นด้วย <strong>Context-Aware AI</strong> เมื่อไหร่ที่พยากรณ์อากาศชี้ว่าฝนตกหนัก AI จะกระตุ้นแคมเปญให้ร้านค้ารองรับนักท่องเที่ยวหลบฝนในร่มทันที
              </p>
            </div>

            {/* การ์ด 4 */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col min-h-[220px]">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl w-fit mb-3">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 uppercase font-mono tracking-wide mb-2">4. ด้านอาหาร (Local Cuisine)</h4>
              <p className="text-xs text-slate-500 leading-relaxed pb-2">
                เสิร์ฟเควสสุ่มเมนูเด็ดท้าสายฝน เช่น <strong>โกโก้แท้น่านร้อนๆ, ข้าวซอยไก่, หรือลาบคั่วสูตรมะแขว่นหอมฉุน</strong> เพื่อชูโรงคุณค่าวัตถุดิบอาหารน่านให้เติบโต
              </p>
            </div>

          </div>
        </div>

      </main>

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