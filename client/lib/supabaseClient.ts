/* eslint-disable */
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

// Helper to read cookie
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

// Builder class for mock queries
class MockQueryBuilder {
  private data: any;
  constructor(data: any) {
    this.data = data;
  }
  eq(col: string, val: any) {
    if (Array.isArray(this.data)) {
      if (col === 'quest_id') {
        const filtered = this.data.filter((item: any) => Number(item.quest_id) === Number(val));
        return new MockQueryBuilder(filtered);
      }
      if (col === 'user_id') {
        const filtered = this.data.filter((item: any) => item.user_id === val);
        return new MockQueryBuilder(filtered);
      }
    }
    return this;
  }
  neq(col: string, val: any) { return this; }
  gt(col: string, val: any) { return this; }
  lt(col: string, val: any) { return this; }
  gte(col: string, val: any) { return this; }
  lte(col: string, val: any) { return this; }
  like(col: string, val: any) { return this; }
  ilike(col: string, val: any) { return this; }
  is(col: string, val: any) { return this; }
  in(col: string, val: any[]) {
    if (Array.isArray(this.data) && Array.isArray(val)) {
      if (col === 'quest_id') {
        const numericVals = val.map(Number);
        const filtered = this.data.filter((item: any) => numericVals.includes(Number(item.quest_id)));
        return new MockQueryBuilder(filtered);
      }
    }
    return this;
  }
  contains(col: string, val: any) { return this; }
  containedBy(col: string, val: any) { return this; }
  range(from: number, to: number) { return this; }
  single() {
    const d = Array.isArray(this.data) ? this.data[0] : this.data;
    return Promise.resolve({ data: d, error: null });
  }
  maybeSingle() {
    const d = Array.isArray(this.data) ? this.data[0] : this.data;
    return Promise.resolve({ data: d, error: null });
  }
  order(col: string, options?: any) {
    return this;
  }
  limit(n: number) {
    if (Array.isArray(this.data)) {
      return new MockQueryBuilder(this.data.slice(0, n));
    }
    return this;
  }
  then(onfulfilled: any, onrejected?: any) {
    const result = {
      data: this.data,
      count: Array.isArray(this.data) ? this.data.length : 0,
      error: null
    };
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

const originalSupabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = new Proxy(originalSupabase, {
  get(target, prop, receiver) {
    const token = getCookie('auth_token');
    const isDemo = token && token.startsWith('demo_');

    if (prop === 'auth') {
      const originalAuth = target.auth;
      return new Proxy(originalAuth, {
        get(authTarget, authProp) {
          if (isDemo) {
            if (authProp === 'getUser') {
              return async () => {
                const role = token.includes('operator') ? 'operator' : 'tourist';
                const name = typeof window !== 'undefined'
                  ? localStorage.getItem('demo_user_name') || (role === 'operator' ? 'โฮมสเตย์ตานงค์ (Demo)' : 'นักเดินทางเมืองน่าน (Demo)')
                  : (role === 'operator' ? 'โฮมสเตย์ตานงค์ (Demo)' : 'นักเดินทางเมืองน่าน (Demo)');
                return {
                  data: {
                    user: {
                      id: `demo-${role}-id`,
                      email: `demo-${role}@example.com`,
                      user_metadata: { name: name },
                    }
                  },
                  error: null
                };
              };
            }
            if (authProp === 'signOut') {
              return async () => {
                document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('demo_user_name');
                  localStorage.removeItem('demo_store_name');
                  localStorage.removeItem('demo_store_district');
                  localStorage.removeItem('demo_claimed_quests');
                }
                return { error: null };
              };
            }
          }
          const val = Reflect.get(authTarget, authProp);
          return typeof val === 'function' ? val.bind(authTarget) : val;
        }
      });
    }

    if (prop === 'from' && isDemo) {
      return function (table: string) {
        const role = token.includes('operator') ? 'operator' : 'tourist';

        if (table === 'users') {
          return {
            select(fields?: string) {
              const name = (typeof window !== 'undefined' ? localStorage.getItem('demo_user_name') : null) || (role === 'operator' ? 'ร้านตานงค์ (Demo)' : 'นักเดินทางเมืองน่าน (Demo)');
              return new MockQueryBuilder({
                id: `demo-${role}-id`,
                email: `demo-${role}@example.com`,
                name: name,
                role: role,
                associated_store_id: 1,
              });
            },
            update(data: any) {
              if (typeof window !== 'undefined' && data.name) {
                localStorage.setItem('demo_user_name', data.name);
              }
              return new MockQueryBuilder(null);
            }
          };
        }

        if (table === 'stores') {
          return {
            select(fields?: string) {
              const name = (typeof window !== 'undefined' ? localStorage.getItem('demo_store_name') : null) || 'โฮมสเตย์ตานงค์ (Demo)';
              const district = (typeof window !== 'undefined' ? localStorage.getItem('demo_store_district') : null) || 'ปัว';
              return new MockQueryBuilder({
                id: 1,
                name: name,
                type: 'homestay',
                district: district,
              });
            },
            update(data: any) {
              if (typeof window !== 'undefined') {
                if (data.name) localStorage.setItem('demo_store_name', data.name);
                if (data.district) localStorage.setItem('demo_store_district', data.district);
              }
              return new MockQueryBuilder(null);
            }
          };
        }

        if (table === 'user_coupons') {
          return {
            select(fields?: string) {
              let claimed: any[] = [];
              if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('demo_claimed_quests');
                if (saved) {
                  try {
                    const questIds = JSON.parse(saved);
                    claimed = questIds.map((id: number) => ({ quest_id: id, user_id: `demo-${role}-id`, status: 'claimed' }));
                  } catch (e) {}
                }
              }
              return new MockQueryBuilder(claimed);
            },
            insert(data: any) {
              if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('demo_claimed_quests');
                let questIds = [];
                if (saved) {
                  try { questIds = JSON.parse(saved); } catch (e) {}
                }
                const qId = data && data.quest_id ? Number(data.quest_id) : null;
                if (qId && !questIds.includes(qId)) {
                  questIds.push(qId);
                  localStorage.setItem('demo_claimed_quests', JSON.stringify(questIds));
                }
              }
              return Promise.resolve({ data: null, error: null });
            }
          };
        }

        return target.from(table);
      };
    }

    const value = Reflect.get(target, prop, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  }
});