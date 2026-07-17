import { createClient } from '@supabase/supabase-js'; 
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ไม่พบ Supabase Environment Variables ในไฟล์ .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🌱 เริ่มต้นกระบวนการตรวจสอบโครงสร้างฐานข้อมูล และ Seed ข้อมูล...');

  // [ขั้นเตรียมการ] สร้างตารางอัตโนมัติหากใน Supabase ยังไม่มีตารางเหล่านี้อยู่
  // โดยรันผ่าน SQL API ด่วนของ Supabase เพื่อป้องกัน Error ตารางหาย
  // ดักตรวจสอบด้วยการถอดเอาค่า error ออกมาเช็คตามสไตล์ Supabase SDK
  const { error: initSchemaError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS public.stores (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT,
        district TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.campaigns (
        id BIGSERIAL PRIMARY KEY,
        store_id BIGINT REFERENCES public.stores(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        weather_condition TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.quests (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        points INT DEFAULT 0,
        district TEXT,
        qr_code_trigger TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  // แสดง Log คำเตือนแทนหากเกิดปัญหาระหว่างเช็คโครงสร้างตาราง
  if (initSchemaError) {
    console.log('⚠️ ไม่สามารถใช้ระบบรัน SQL อัตโนมัติได้ (อาจเนื่องจากสิทธิ์ RPC) แต่ระบบจะพยายาม Seed ข้อมูลลงตารางเดิมต่อ...');
  }

  // 1. เคลียร์ข้อมูลเก่าในตารางออกก่อนเพื่อเตรียมกรอก Seed ใหม่ที่ถูกต้อง
  try {
    await supabase.from('quests').delete().neq('id', 0);
    await supabase.from('campaigns').delete().neq('id', 0);
    await supabase.from('stores').delete().neq('id', 0);
  } catch {
    console.log('⚠️ กำลังพยายามจัดโครงสร้างตารางใหม่ลงสู่ฐานข้อมูล...');
  }

  // 2. เริ่มต้นทำการสร้าง (Insert) ข้อมูลตาราง Stores (เดิมคือตาราง shops)
  const sampleStores = [
    { name: 'โฮมสเตย์ตานงค์', type: 'homestay', district: 'ปัว' },
    { name: 'ตูบนาโฮมสเตย์', type: 'homestay', district: 'ปัว' },
    { name: 'โรงต้มเกลือสินเธาว์บ้านบ่อหลวง', type: 'workshop', district: 'บ่อเกลือ' },
    { name: 'บ่อเกลือ วิว รีสอร์ท', type: 'hotel', district: 'บ่อเกลือ' },
    { name: 'ร้านกาแฟบ้านไทลื้อ', type: 'cafe', district: 'ปัว' },
    { name: 'เดอะวิว แอท กิ่วม่วง', type: 'cafe', district: 'เมืองน่าน' },
    { name: 'เฮือนฮอม', type: 'restaurant', district: 'เมืองน่าน' }
  ];

  const { data: insertedStores, error: storeError } = await supabase
    .from('stores')
    .insert(sampleStores)
    .select();

  if (storeError || !insertedStores) {
    console.error('❌ เกิดข้อผิดพลาดในตาราง stores:', storeError?.message);
    console.error('💡 ข้อแนะนำ: กรุณาเข้าไปที่ Supabase Dashboard -> SQL Editor แล้วรันคำสั่ง: CREATE TABLE public.stores (id BIGSERIAL PRIMARY KEY, name TEXT, type TEXT, district TEXT); เพื่อเปิดหน้าตารางก่อนครับ');
    return;
  }
  console.log(`✅ เชื่อมโยงตารางและ Seed ร้านค้าจำลองสำเร็จ (${insertedStores.length} ร้าน)`);

  // ฟังก์ชันช่วยจับคู่ค้นหา ID ของร้านค้า
  const findStoreId = (name: string) => insertedStores.find((s: any) => s.name === name)?.id;

  // 3. เริ่มต้นทำการสร้างข้อมูลแคมเปญกระตุ้นเศรษฐกิจท่องเที่ยวหน้าฝน (ฝั่ง AI Generator)
  const sampleCampaigns = [
    {
      store_id: findStoreId('โฮมสเตย์ตานงค์'), 
      title: 'Workation กลางทุ่งนาหน้าฝน',
      description: 'พักผ่อนสโลว์ไลฟ์วันธรรมดา ลดทันที 30% สำหรับกลุ่ม Digital Nomad พร้อมฟรีเซ็ตกาแฟดริปดอยภูแว',
      weather_condition: 'weekday_rainy',
      status: 'active'
    },
    {
      store_id: findStoreId('ร้านกาแฟบ้านไทลื้อ'),
      title: 'หลบฝน จิบโกโก้น่านอุ่นๆ',
      description: 'เมื่อพยากรณ์อากาศแจ้งเตือนว่าฝนตกในอำเภอปัว รับส่วนลดเมนูเครื่องดื่มร้อนทันที 20% เมื่อโชว์หน้าแอปฯ',
      weather_condition: 'heavy_rain',
      status: 'active'
    },
    {
      store_id: findStoreId('โรงต้มเกลือสินเธาว์บ้านบ่อหลวง'),
      title: 'สปาเกลือสินเธาว์บำบัด',
      description: 'เควสพิเศษช่วงหน้าฝน: ร่วมกิจกรรมต้มเกลือแบบโบราณ รับฟรีผลิตภัณฑ์เกลือขัดผิวสมุนไพรน่าน',
      weather_condition: 'cloudy_rainy',
      status: 'active'
    },
    {
      store_id: findStoreId('เฮือนฮอม'),
      title: 'เซ็ตลาบคั่วท้าสายฝน',
      description: 'รับประทานอาหารพื้นเมืองน่านรสจัดจ้าน เมนูลาบคั่วใส่มะแขว่นหอมฉุน ฟรีน้ำสมุนไพรเมื่อฝนตกเกิน 30 นาที',
      weather_condition: 'rainy',
      status: 'active'
    }
  ];

  const { error: campaignError } = await supabase.from('campaigns').insert(sampleCampaigns);
  if (campaignError) console.error('❌ ไม่สามารถระบุข้อมูลลงในตาราง campaigns ได้:', campaignError.message);
  else console.log('✅ Seed แคมเปญ Context-Aware AI ลงระบบฐานข้อมูลสำเร็จ');

  // 4. เริ่มต้นทำการสร้างข้อมูลเควสสแกนท้าทายนักท่องเที่ยว (ฝั่ง B2C Gamification)
  const sampleQuests = [
    { title: 'ตามรอยนาขั้นบันไดปัว', description: 'เช็คอินและถ่ายรูปคู่กับทุ่งนาเขียวขจีที่โฮมสเตย์ในอำเภอปัว', points: 150, district: 'ปัว', qr_code_trigger: 'pua_rice_field_01' },
    { title: 'ไอเกลือสินเธาว์หน้าฝน', description: 'เดินทางไปเยือนบ่อเกลือโบราณและสแกน QR Code ที่โรงต้มเกลือ', points: 200, district: 'บ่อเกลือ', qr_code_trigger: 'boklaeo_salt_02' },
    { title: 'สายสโลว์ไลฟ์กิ่วม่วง', description: 'แวะจิบกาแฟชมวิวทะเลหมอกหน้าฝนที่จุดเช็คอินกิ่วม่วง', points: 100, district: 'เมืองน่าน', qr_code_trigger: 'kiewmuang_fog_03' },
    { title: 'ลิ้มรสอาหารเมืองน่าน', description: 'รับประทานอาหารพื้นเมืองและสแกนจ่ายเงินในร้านค้าชุมชนวันธรรมดา', points: 120, district: 'เมืองน่าน', qr_code_trigger: 'local_food_weekday' }
  ];

  const { error: questError } = await supabase.from('quests').insert(sampleQuests);
  if (questError) console.error('❌ ไม่สามารถระบุข้อมูลลงในตาราง quests ได้:', questError.message);
  else console.log('✅ Seed เควสผจญภัยสแกนล่ารางวัลสำเร็จ');

  console.log('🎉 เมล็ดพันธุ์ข้อมูลน่าน (Seed Data) ทั้งหมดรันเข้าสู่ระบบอย่างเป็นทางการเรียบร้อยแล้วครับเดฟ!');
}

main().catch((err) => {
  console.error('❌ Script ทำงานล้มเหลว:', err);
});