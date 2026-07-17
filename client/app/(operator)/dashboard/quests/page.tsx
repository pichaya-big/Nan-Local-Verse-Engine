"use client"

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gamepad2, Award, Users, Calendar, Plus, ShieldCheck, CheckCircle2, TrendingUp, X, Loader2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

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

export default function QuestsPage() {
  const [storeDistrict, setStoreDistrict] = useState("ปัว");
  const [isLoading, setIsLoading] = useState(true);

  // States สำหรับข้อมูลจริงจาก DB
  const [quests, setQuests] = useState<any[]>([]);
  const [impactStats, setImpactStats] = useState([
    { name: 'แต้มที่ถูกแจกจ่ายไปแล้ว', value: '0 แต้ม', icon: Award, color: 'text-amber-500' },
    { name: 'นักท่องเที่ยวร่วมเควสสะสม', value: '0 คน', icon: Users, color: 'text-sky-500' },
    { name: 'เงินหมุนเวียนสู่ร้านค้าย่อย', value: '฿0', icon: TrendingUp, color: 'text-emerald-500' },
  ]);

  // States สำหรับการสร้างเควสใหม่ (Modal)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPoints, setNewPoints] = useState(150);
  const [newTrigger, setNewTrigger] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ดึงข้อมูลทั้งหมดจากระบบฐานข้อมูล Supabase
  const fetchQuestsAndStats = async () => {
    try {
      // 1. ดึงผู้ใช้อัตลักษณ์
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 2. ดึงข้อมูล Profile ร้านค้า
      const { data: profile } = await supabase
        .from('users')
        .select('associated_store_id')
        .eq('id', user.id)
        .single();

      if (!profile?.associated_store_id) {
        setIsLoading(false);
        return;
      }

      const { data: store } = await supabase
        .from('stores')
        .select('district')
        .eq('id', profile.associated_store_id)
        .single();

      const normalizedDist = normalizeDistrict(store?.district || "ปัว");
      setStoreDistrict(normalizedDist);

      // 3. ดึงภารกิจทั้งหมดในอำเภอของร้านค้าเพื่อแสดงรายการ
      const { data: dbQuests, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('district', normalizedDist)
        .order('created_at', { ascending: false });

      const formattedQuests = [];
      if (dbQuests && !questError) {
        for (const q of dbQuests) {
          // นับจำนวนผู้รับสิทธิ์คูปองผ่านเควสนี้ในตาราง user_coupons
          const { count } = await supabase
            .from('user_coupons')
            .select('*', { count: 'exact', head: true })
            .eq('quest_id', q.id);

          formattedQuests.push({
            id: q.id,
            title: q.title,
            description: q.description || "ไม่มีคำอธิบายเพิ่มเติม",
            rewardPoints: q.points || 0,
            participants: count || 0,
            status: 'Active',
            impact: q.points > 150 ? 'ส่งเสริมการท่องเที่ยวคาร์บอนต่ำ (Eco-Friendly)' : 'กระจายรายได้สู่ร้านค้าขนาดเล็กยามโลว์ซีซั่น',
            qr_code_trigger: q.qr_code_trigger
          });
        }
      }
      setQuests(formattedQuests);

      // 4. ดึงสถิติภาพรวมความยั่งยืนของทั่งทั้งโครงการใน Supabase
      const { data: allQuests } = await supabase.from('quests').select('id, points');
      const questPointsMap = new Map<number, number>();
      allQuests?.forEach(q => questPointsMap.set(Number(q.id), q.points || 0));

      const { data: coupons } = await supabase.from('user_coupons').select('user_id, quest_id');
      
      let totalPoints = 0;
      const uniqueUsersSet = new Set<string>();
      
      if (coupons) {
        coupons.forEach(c => {
          uniqueUsersSet.add(c.user_id);
          const pts = questPointsMap.get(Number(c.quest_id)) || 0;
          totalPoints += pts;
        });
      }

      const circulatingFunds = totalPoints * 1.5; // tokenomics formula: 1 point has 1.5 Baht impact

      setImpactStats([
        { name: 'แต้มที่ถูกแจกจ่ายไปแล้ว', value: `${totalPoints.toLocaleString()} แต้ม`, icon: Award, color: 'text-amber-500' },
        { name: 'นักท่องเที่ยวร่วมเควสสะสม', value: `${uniqueUsersSet.size} คน`, icon: Users, color: 'text-sky-500' },
        { name: 'เงินหมุนเวียนสู่ร้านค้าย่อย', value: `฿${circulatingFunds.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
      ]);

    } catch (err) {
      console.error("Error loading quests page data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestsAndStats();
  }, []);

  // ฟังก์ชันยิงแอดสร้างเควสใหม่ลงตาราง quests ของ Supabase จริง
  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("กรุณากรอกชื่อภารกิจ");
      return;
    }
    setIsCreating(true);

    const triggerValue = newTrigger.trim() || `trigger_${Date.now()}`;

    try {
      const { error } = await supabase
        .from('quests')
        .insert({
          title: newTitle,
          description: newDescription,
          points: newPoints,
          district: storeDistrict, // สร้างและผูกเข้ากับอำเภอของร้านค้าตนเองอัตโนมัติ
          qr_code_trigger: triggerValue
        });

      if (error) throw error;

      alert("🎉 สร้างภารกิจชุมชนใหม่ลงระบบจริงสำเร็จแล้วจ้าว!");
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewPoints(150);
      setNewTrigger("");
      
      // รีโหลดข้อมูลทั้งหมดเพื่อรีเฟรชหน้าแดชบอร์ด
      await fetchQuestsAndStats();
    } catch (err) {
      console.error("Error creating quest:", err);
      alert("เกิดข้อผิดพลาดในการสร้างภารกิจ");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">กำลังเชื่อมฐานข้อมูลภารกิจชุมชน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 space-y-8 transition-colors duration-200 text-card-foreground">
      
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <a href="/dashboard" className="p-2 rounded-xl bg-card border border-card-border hover:opacity-85 transition-all">
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ระบบภารกิจและแต้มชุมชน (Gamification)</h1>
            <p className="text-sm text-muted-text">บริหารจัดการเควสท่องเที่ยวอัจฉริยะร่วมกับเครือข่ายชุมชนจังหวัดน่าน</p>
          </div>
        </div>
        
        {/* ปุ่มเปิด Modal สร้างเควสใหม่ลง Database */}
        <button 
          onClick={() => {
            setNewTrigger(`qr_pua_${Date.now().toString().slice(-4)}`); // ตั้งค่ารหัสเดโมเริ่มต้น
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-90 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md text-sm transition-all"
        >
          <Plus size={16} />
          สร้างภารกิจชุมชนใหม่
        </button>
      </div>

      {/* 2. Community Impact Analytics Bar (สถิติจริงจาก Supabase ดักสตรีมคะแนนเต็ม) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {impactStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-card border border-card-border p-5 rounded-2xl shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 ${stat.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-text">{stat.name}</p>
                <p className="text-xl font-bold mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ฝั่งซ้ายและกลาง: ตาราง/การ์ดภารกิจที่เปิดอยู่ (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-card-border pb-3">
            <Gamepad2 size={18} className="text-emerald-600" /> รายการภารกิจที่เปิดอยู่ใน อ.{storeDistrict} (Active Quests)
          </h2>

          <div className="space-y-4">
            {quests.length > 0 ? (
              quests.map((quest) => (
                <div key={quest.id} className="bg-card border border-card-border p-6 rounded-2xl shadow-sm space-y-4 hover:border-emerald-500/30 transition-all relative overflow-hidden">
                  {/* แถบบาร์บ่งบอกสถานะความกรีน */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        {quest.title}
                      </h3>
                      <p className="text-xs text-muted-text flex items-center gap-1">
                        <Calendar size={13} /> คิวอาร์โค้ดเป้าหมาย: <strong className="font-mono text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{quest.qr_code_trigger}</strong>
                      </p>
                    </div>
                    <span className="self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {quest.status}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-350">
                    {quest.description}
                  </p>

                  <div className="border-t border-card-border pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center space-x-6">
                      <div>
                        <span className="text-muted-text">รางวัลให้นักท่องเที่ยว:</span>
                        <span className="font-bold text-amber-500 ml-1">+{quest.rewardPoints} NAN</span>
                      </div>
                      <div>
                        <span className="text-muted-text">เช็กอินแล้ว:</span>
                        <span className="font-bold ml-1">{quest.participants} คน</span>
                      </div>
                    </div>
                    
                    {/* สรุปคะแนนโบนัสสิ่งแวดล้อม/ชุมชน */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-card-border text-slate-500 dark:text-slate-400">
                      🌱 <span className="font-medium text-slate-700 dark:text-slate-300">ตัวชี้วัดชุมชน:</span> {quest.impact}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card border border-card-border p-12 text-center text-slate-400 rounded-2xl">
                🏜️ ยังไม่มีข้อมูลเควสภารกิจชุมชนที่เปิดอยู่ในอำเภอ {storeDistrict} ในขณะนี้
              </div>
            )}
          </div>
        </div>

        {/* ฝั่งขวา: เงื่อนไขและกฎเกณฑ์ของระบบสิทธิประโยชน์พันธมิตร (1 Column) */}
        <div className="bg-card border border-card-border p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 border-b border-card-border pb-3 text-amber-600 dark:text-amber-400">
            <ShieldCheck size={18} /> เกณฑ์ความยั่งยืนเครือข่ายน่าน
          </h2>
          
          <div className="space-y-4 text-xs leading-relaxed">
            <div className="space-y-1.5">
              <p className="font-bold text-slate-800 dark:text-slate-200">💰 การแลกเปลี่ยนมูลค่า (Tokenomics)</p>
              <p className="text-slate-500 dark:text-slate-400">เมื่อนักท่องเที่ยวสะสมแต้มจากการทำภารกิจสำเร็จ สามารถนำแต้มเหล่านั้นมาสแกนใช้เป็นส่วนลดกับร้านอาหาร โฮมสเตย์ หรือร้านกาแฟใดก็ได้ที่เป็นเครือข่ายท้องถิ่นน่านในระบบ</p>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-emerald-600 dark:text-emerald-400">🌱 โบนัสกรีนซีซั่น (+5 คะแนนพิเศษ)</p>
              <p className="text-slate-500 dark:text-slate-400">ระบบภารกิจนี้ถูกออกแบบโดยดึงข้อมูลพฤติกรรมมาจาก TAT Open Data เพื่อจัดแคมเปญพาคนออกจากอำเภอเมือง ไปยังชุมชนรองในอำเภอปัว ท่าวังผา และเชียงกลาง ในช่วงที่ไม่มีเทศกาลโดยเฉพาะ</p>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-center">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">🌟 แพลตฟอร์มนี้เปิดรับร้านค้าร่วมเครือข่ายแล้ว 18 หมู่บ้านทั่วจังหวัดน่าน</p>
            </div>
          </div>
        </div>

      </div>

      {/* ➕ Modal สำหรับสร้างภารกิจชุมชนใหม่ลงตาราง public.quests ของระบบจริง */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-up text-card-foreground">
            
            <div className="flex justify-between items-center border-b dark:border-slate-850 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-1.5">
                <Plus className="text-emerald-600" /> สร้างภารกิจชุมชนใหม่
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">ชื่อภารกิจชุมชน</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น ตะลุยทุ่งนาขั้นบันไดทุ่งดอยแก้ว"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">คำอธิบายรายละเอียดกิจกรรม</label>
                <textarea 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="รายละเอียดสำหรับให้นักท่องเที่ยวอ่านและทำภารกิจส่งงาน..."
                  rows={3}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">เหรียญรางวัล (NAN)</label>
                  <input 
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    min={10}
                    max={1000}
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">พื้นที่เปิดตัวเควส</label>
                  <input 
                    type="text"
                    value={`อำเภอ${storeDistrict}`}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">รหัสเป้าหมายสแกน QR Code (Trigger)</label>
                <input 
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="เช่น qr_pua_homestay_99"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                สร้างภารกิจชุมชนเรียลไทม์
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}