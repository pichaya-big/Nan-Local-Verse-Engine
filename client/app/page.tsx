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
  UtensilsCrossed
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
        <Link
          href="/login"
          className="text-xs font-bold px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl transition-all shadow-sm"
        >
          เปิดระบบเดโม
        </Link>
      </header>

      {/* 🌾 Main Section */}
      <main className="flex flex-col flex-1 w-full max-w-5xl items-center justify-center py-16 px-6 text-center space-y-16 relative z-10">

        {/* สโลแกนหลัก */}
        <div className="space-y-4 max-w-4xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold shadow-sm">
            ⛰️ ยินดีต้อนรับสู่ดินแดนแห่งขุนเขาและสายหมอก
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-slate-900">
            เปลี่ยนเสียงกระซิบรักหน้าฝน <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
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
      <footer className="w-full text-center py-6 border-t border-slate-200/60 text-[10px] text-slate-400 bg-white relative z-20">
        © 2569 คณะพัฒนาซอฟต์แวร์วิศวกรรม • ออกแบบเพื่อชิงชัย Nan Beyond Seasons Hackathon โดยทีม HACK RMUTL
      </footer>
    </div>
  );
}