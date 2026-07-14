// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, storeName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    let userId = null;
    let storeId = null;

    // 1. สร้างผู้ใช้ใหม่ใน Auth System
    if (hasServiceRole && supabaseAdmin) {
      // โหมด Admin (ใช้ Service Role Key): สามารถข้ามขั้นตอนยืนยันอีเมลได้
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
      userId = authData.user.id;
    } else {
      // โหมด Fallback (ใช้ Anon Key): สมัครแบบ User ทั่วไป (อาจต้องยืนยันอีเมลขึ้นอยู่กับระบบ Supabase)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      if (!authData.user) {
        return NextResponse.json({ error: 'ไม่สามารถสร้างบัญชีผู้ใช้งานได้' }, { status: 400 });
      }
      userId = authData.user.id;
    }

    // 2. ถ้าเป็น Operator ต้องสร้างร้านค้าก่อน
    const dbClient = (hasServiceRole && supabaseAdmin) ? supabaseAdmin : supabase;

    if (role === 'operator' && storeName) {
      const { data: store, error: storeError } = await dbClient
        .from('stores')
        .insert({
          name: storeName,
          type: 'general',
        })
        .select('id')
        .single();

      if (storeError) {
        if (hasServiceRole && supabaseAdmin) {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        }
        return NextResponse.json({ error: 'ไม่สามารถสร้างร้านค้าได้: ' + storeError.message }, { status: 500 });
      }
      storeId = store.id;
    }

    // 3. บันทึกข้อมูลลงตาราง public.users (ใช้ upsert เผื่อกรณีมี Trigger สร้างโปรไฟล์อัตโนมัติใน Supabase)
    const { error: profileError } = await dbClient
      .from('users')
      .upsert({
        id: userId,
        email: email,
        name: name,
        role: role,
        associated_store_id: storeId,
      });

    if (profileError) {
      if (hasServiceRole && supabaseAdmin) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      
      let friendlyError = profileError.message;
      if (profileError.message.includes('users_id_fkey') || profileError.message.includes('foreign key constraint')) {
        friendlyError = 'อีเมลนี้มีอยู่แล้วในระบบ Auth ของ Supabase (เนื่องจากคุณลบผู้ใช้จากตาราง users แต่ไม่ได้ลบในแท็บ Authentication ของ Supabase Dashboard) กรุณาเข้าไปลบผู้ใช้คนนี้ออกจากเมนู Authentication ในระบบ Supabase ก่อน หรือสมัครด้วยอีเมลอื่นแทนจ้าว';
      }
      
      return NextResponse.json({ error: 'ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้: ' + friendlyError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: hasServiceRole
        ? 'สมัครสมาชิกสำเร็จ'
        : 'สมัครสมาชิกสำเร็จ (โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชีหากระบบต้องการ)',
      userId: userId
    });

  } catch (err) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}