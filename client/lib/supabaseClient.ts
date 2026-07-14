import { createClient } from '@supabase/supabase-js';

// ดึงค่าโดยตรงและใส่ Fallback string ว่างไว้กันพังตอนคอมไพล์
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// 🔍 ตัวดักตรวจสอบ (ช่วยแจ้งเตือนเดฟใน Console ทันทีว่าค่าหลุดจริงไหม)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ [Supabase Error]: ตรวจพบค่าว่างใน .env.local! กรุณาเช็คชื่อตัวแปร หรือลอง Restart npm run dev อีกรอบนะครับเดฟ"
  );
}

// สร้าง Instance ตัวเก่ง
export const supabase = createClient(supabaseUrl, supabaseAnonKey);