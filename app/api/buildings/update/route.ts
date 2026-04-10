import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 환경 변수에서 설정값 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('buildings') // 본인의 테이블 이름 확인
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: '업데이트 성공!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}