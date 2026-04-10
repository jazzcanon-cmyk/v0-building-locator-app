import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // 1-j 사진을 보니 id가 숫자(int8)야. 숫자로 변환해서 넘겨줘야 에러가 안 나.
    const { id, password, memo } = data; 
    const buildingId = Number(id.replace('building-', '')); // 'building-138' -> 138 변환

    if (isNaN(buildingId)) {
      return NextResponse.json({ error: '유효한 ID가 아닙니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('buildings') 
      .update({ 
        password: password,
        memo: memo 
      })
      .eq('id', buildingId); // 숫자로 비교

    if (error) throw error;

    return NextResponse.json({ message: '성공적으로 저장되었습니다!' });
  } catch (error: any) {
    console.error('업데이트 에러:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}