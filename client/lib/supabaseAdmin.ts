import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// คีย์ลับเฉพาะฝั่ง Backend (ห้ามระบุเป็น NEXT_PUBLIC_ เพื่อความปลอดภัย)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.error("⚠️ [Supabase Admin Error]: NEXT_PUBLIC_SUPABASE_URL is missing.");
}

if (!supabaseServiceRoleKey) {
  console.warn(
    "⚠️ [Supabase Admin Warning]: ไม่พบ SUPABASE_SERVICE_ROLE_KEY ใน environment variables ระบบจะไม่สามารถสมัครสมาชิกแบบ Admin (ข้ามขั้นตอนเมลยืนยัน) ได้"
  );
}

// สร้าง Admin Client สำหรับจัดการข้อมูลระบบ (เช่น auth.admin.createUser)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
