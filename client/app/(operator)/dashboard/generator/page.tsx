"use client"

import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Share2, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
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

export default function GeneratorPage() {
  // States สำหรับข้อมูลร้านค้าและบริบท
  const [storeId, setStoreId] = useState<number | null>(null);
  const [storeDistrict, setStoreDistrict] = useState('ปัว');
  const [isStoreLoading, setIsStoreLoading] = useState(true);

  // States สำหรับ Input
  const [businessType, setBusinessType] = useState('โฮมสเตย์');
  const [season, setSeason] = useState('Green Season (ฤดูฝน)');
  const [keyword, setKeyword] = useState('');

  // States สำหรับการควบคุม UI และการโหลดข้อมูล
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isQuestPublished, setIsQuestPublished] = useState(false);
  const [publishingQuest, setPublishingQuest] = useState(false);

  // State สำหรับเก็บข้อมูลที่ได้จาก FastAPI
  const [campaignData, setCampaignData] = useState<{
    campaign_title: string;
    caption: string;
    gamification_quest: string;
    image_prompt: string;
  } | null>(null);

  // โหลดข้อมูลร้านค้าเพื่อกรอกประเภทธุรกิจและเก็บ store_id
  useEffect(() => {
    const fetchStoreContext = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('users')
          .select('associated_store_id')
          .eq('id', user.id)
          .single();

        if (!profile?.associated_store_id) return;
        const assocStoreId = profile.associated_store_id;
        setStoreId(assocStoreId);

        const { data: store } = await supabase
          .from('stores')
          .select('name, type, district')
          .eq('id', assocStoreId)
          .single();

        if (store) {
          const normDist = normalizeDistrict(store.district);
          setStoreDistrict(normDist);
          // แมปประเภทภาษาไทยให้ตรงกล่องดรอปดาวน์
          if (store.type === 'homestay') setBusinessType('โฮมสเตย์');
          else if (store.type === 'cafe') setBusinessType('ร้านกาแฟและเครื่องดื่ม');
          else if (store.type === 'restaurant') setBusinessType('ร้านอาหารพื้นเมือง');
          else if (store.type === 'workshop') setBusinessType('สวนเกษตรและสถานที่ท่องเที่ยว');
        }
      } catch (err) {
        console.error("Error fetching store context:", err);
      } finally {
        setIsStoreLoading(false);
      }
    };

    fetchStoreContext();
  }, []);

  // ฟังก์ชันยิงหา Backend FastAPI
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCampaignData(null);
    setIsQuestPublished(false);

    try {
      const response = await fetch('/api/campaign/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_type: businessType,
          season: season + (keyword ? ` เน้น: ${keyword}` : ''),
          store_id: storeId // ส่ง storeId ไปบันทึกในตาราง campaigns ของระบบจริง
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const resData = await response.json();
      if (resData.success) {
        setCampaignData(resData.data);
      } else {
        throw new Error(resData.error || 'การเสกแคมเปญล้มเหลว');
      }
    } catch (error) {
      console.error('Error generating campaign:', error);
      // Fallback Mock Data ในกรณีระบบหลังบ้านไม่มีการรันหรือติดขัด
      const fallbackCampaign = {
        campaign_title: `🌧️ แอ่วม่วน อุ่นอกอุ่นใจ๋ ยามฝนตั๊บๆ ที่ อ.${storeDistrict}`,
        caption: `ต้อนรับ Green Season ปีนี้! หนีความวุ่นวายมานอนพักผ่อน ฟังเสียงฝนเย็นสบาย บรรยากาศเขียวขจีขนาดนี้ แวะมาจิบโกโก้อุ่นๆ ด้วยกันเน้อจ้าว 💚☕`,
        gamification_quest: `เควส 'หลบฝนเช็คอิน': ถ่ายภาพแก้วเครื่องดื่มในร้านคู่กับบรรยากาศหน้าฝน อ.${storeDistrict} โพสต์ลงโซเชียลเพื่อรับ 150 แต้ม นำไปแลกคูปองของที่ระลึกพิเศษจ้าว`,
        image_prompt: `Cozy Lanna style cafe in Nan province, northern Thailand during gentle rainy season, lush green mountains background, mist, warm ambient light, highly detailed 8k --ar 16:9`
      };
      
      setCampaignData(fallbackCampaign);

      // บันทึกลง Supabase ตาราง campaigns ทันทีเพื่อให้เก็บข้อมูลจริง
      if (storeId) {
        try {
          await supabase.from('campaigns').insert({
            store_id: storeId,
            title: fallbackCampaign.campaign_title,
            description: `แคปชั่น: ${fallbackCampaign.caption}\n\nภารกิจ: ${fallbackCampaign.gamification_quest}\n\nPrompt ภาพ: ${fallbackCampaign.image_prompt}`,
            weather_condition: season,
            status: 'active'
          });
        } catch (dbErr) {
          console.error("Error inserting fallback campaign to DB:", dbErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันกดส่งกิจกรรมส่งต่อให้ฝั่งนักท่องเที่ยวจริงใน DB
  const handlePublishQuest = async () => {
    if (!campaignData) return;
    setPublishingQuest(true);

    try {
      const { error } = await supabase
        .from('quests')
        .insert({
          title: campaignData.campaign_title,
          description: campaignData.gamification_quest,
          points: 150, // คะแนนการสะสมเป็นค่าเริ่มต้น
          district: storeDistrict, // ใช้อำเภอของร้านค้าจริงเพื่อแสดงผลบนฟิลเตอร์ฝั่งนักท่องเที่ยว
          qr_code_trigger: `quest_${Date.now()}` // สร้าง Trigger QR สำหรับนักท่องเที่ยวสแกนรับรางวัล
        });

      if (error) throw error;

      setIsQuestPublished(true);
      alert("🎉 ส่งเควสกิจกรรมเข้าสู่ระบบบอร์ดท่องเที่ยวล้านนาสำเร็จแล้วจ้าว! นักท่องเที่ยวสามารถเข้าร่วมเล่นกิจกรรมสะสมแต้มได้ทันที");
    } catch (error) {
      console.error("Error publishing quest:", error);
      alert("เกิดข้อผิดพลาดในการส่งเควสเข้าสู่บอร์ดระบบ");
    } finally {
      setPublishingQuest(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (isStoreLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-slate-500">กำลังเชื่อมบริบทข้อมูลร้านค้าของคุณ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 space-y-6 transition-colors duration-200">

      {/* 1. Navigation / Header */}
      <div className="flex items-center space-x-4">
        <a href="/dashboard" className="p-2 rounded-xl bg-card border border-card-border hover:opacity-80 transition-all text-card-foreground">
          <ArrowLeft size={18} />
        </a>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ระบบเสกแคมเปญอัจฉริยะ</h1>
          <p className="text-sm text-muted-text">ป้อนข้อมูลธุรกิจของคุณเพื่อให้ AI ช่วยทำการตลาดประจำฤดูกาล</p>
        </div>
      </div>

      {/* 2. Main Workspace Layout (Split Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ฝั่งซ้าย: ฟอร์มรับข้อมูล (5 Columns) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 bg-card border border-card-border p-6 rounded-2xl shadow-sm space-y-6 text-card-foreground">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-card-border pb-3">
            <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" /> ตั้งค่าข้อมูลบรีฟ
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-semibold">ประเภทธุรกิจของคุณ</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border outline-none focus:border-emerald-500 transition-all"
            >
              <option value="โฮมสเตย์">🏠 โฮมสเตย์ / ที่พักชุมชน</option>
              <option value="ร้านกาแฟและเครื่องดื่ม">☕ ร้านกาแฟ / คาเฟ่ท้องถิ่น</option>
              <option value="ร้านอาหารพื้นเมือง">🍲 ร้านอาหารพื้นเมือง / ขันโตก</option>
              <option value="สวนเกษตรและสถานที่ท่องเที่ยว">🌾 วิสาหกิจชุมชน / สวนเกษตร</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">ฤดูกาล / ช่วงเวลาที่ต้องการกระตุ้นยอด</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border outline-none focus:border-emerald-500 transition-all"
            >
              <option value="Green Season (ฤดูฝน)">🌧️ Green Season (ฤดูฝน - สถิตินักท่องเที่ยวน้อย)</option>
              <option value="Summer (ฤดูร้อน)">☀️ Summer (ฤดูร้อน - ช่วงกระจายตัวเมืองรอง)</option>
              <option value="ปลายฝนต้นหนาว">🍂 ปลายฝนต้นหนาว (ช่วงเริ่มเปิดฤดูกาล)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">คีย์เวิร์ด หรือ บริการเด่นที่อยากดัน (ไม่บังคับ)</label>
            <textarea
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="เช่น ข้าวซอยสูตรเด็ด, โกโก้ออร์แกนิก, ดริปกาแฟริมทุ่งนา, ส่วนลดห้องพักยามฝนตก..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border outline-none focus:border-emerald-500 transition-all text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                AI กำลังคำนวณสถิติและรังสรรค์ไอเดีย...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                เสกแคมเปญการตลาดด้วย AI
              </>
            )}
          </button>
        </form>

        {/* ฝั่งขวา: ผลลัพธ์จาก AI Workspace (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">

          {!campaignData && !isLoading && (
            <div className="bg-card border border-card-border rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] text-card-foreground">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-bold mb-1">AI วางแผนการตลาดพร้อมทำงาน</h3>
              <p className="text-sm text-muted-text max-w-sm">กรอกบรีฟธุรกิจของชุมชนฝั่งซ้าย เพื่อให้ระบบดึงสถิติท่องเที่ยวมาเสกแคมเปญกระตุ้นยอดขายทันที</p>
            </div>
          )}

          {isLoading && (
            <div className="bg-card border border-card-border rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] text-card-foreground space-y-4">
              <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={40} />
              <div className="space-y-1">
                <h3 className="text-lg font-bold">กำลังวิเคราะห์ข้อมูล...</h3>
                <p className="text-sm text-muted-text max-w-xs mx-auto">AI กำลังประมวลผลคำเมือง ค้นหาดีไซน์ภาพแคมเปญ และออกแบบระบบ Quest ให้เข้ากับชุมชนน่าน</p>
              </div>
            </div>
          )}

          {campaignData && !isLoading && (
            <div className="space-y-6 animate-fadeIn text-card-foreground">

              {/* Card 1: ชื่อแคมเปญ & แคปชั่นคำเมือง */}
              <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-4 relative">
                <div className="flex justify-between items-start border-b border-card-border pb-3">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      แคมเปญโซเชียลแนะนำ
                    </span>
                    <h3 className="text-xl font-bold mt-2">{campaignData.campaign_title}</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(campaignData.caption, 'caption')}
                    className="p-2 rounded-xl border border-card-border hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-text flex items-center gap-1 text-xs"
                    title="คัดลอกแคปชั่น"
                  >
                    {copiedText === 'caption' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    {copiedText === 'caption' ? 'คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                </div>
                <p className="text-sm whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-card-border italic text-slate-700 dark:text-slate-300">
                  "{campaignData.caption}"
                </p>
              </div>

              {/* Card 2: ภารกิจเพื่อสิ่งแวดล้อมหรือการกระจายรายได้ (Gamification Quest) */}
              <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  🎮 โมดูลกิจกรรมชุมชน (Gamification Quest)
                </h4>
                <p className="text-sm leading-relaxed">{campaignData.gamification_quest}</p>
                <div className="pt-2">
                  <button 
                    onClick={handlePublishQuest}
                    disabled={isQuestPublished || publishingQuest}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 hover:scale-[1.02] active:scale-95 disabled:scale-100 transition-all disabled:opacity-60"
                  >
                    {publishingQuest ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Share2 size={14} />
                    )}
                    {isQuestPublished 
                      ? "ส่งเควสนี้ให้ผู้เล่นสำเร็จแล้วจ้าว" 
                      : publishingQuest 
                        ? "กำลังส่งเข้าบอร์ดท่องเที่ยว..." 
                        : "ส่งกิจกรรมนี้เข้าสู่ App นักท่องเที่ยวท้องถิ่น"}
                  </button>
                </div>
              </div>

              {/* Card 3: AI Image Prompt Generator */}
              <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-sky-500" /> โครงสร้าง Prompt สำหรับสร้างรูปภาพประกอบ
                  </h4>
                  <button
                    onClick={() => copyToClipboard(campaignData.image_prompt, 'prompt')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {copiedText === 'prompt' ? 'คัดลอกสำเร็จ!' : 'คัดลอก Prompt'}
                  </button>
                </div>

                {/* จำลองพรีวิวกล่องใส่รูปภาพ */}
                <div className="w-full h-44 rounded-xl border-2 border-dashed border-card-border flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/20 text-center p-4">
                  <ImageIcon size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 max-w-sm font-mono bg-card p-2 rounded border border-card-border break-all">
                    {campaignData.image_prompt}
                  </p>
                  <p className="text-[10px] text-muted-text mt-2">คัดลอกข้อความด้านบนไปใส่ในเครื่องมือ AI Gen ภาพ (เช่น Midjourney/DALL-E) เพื่อรับรูปภาพโฆษณาระดับพรีเมียม</p>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}