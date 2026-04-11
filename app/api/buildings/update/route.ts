import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    return NextResponse.json(
      {
        error:
          'Supabase가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정하세요.',
      },
      { status: 503 }
    );
  }

  const supabase = createClient(url, key);

  try {
    const data = await request.json();
    const { id, password, memo } = data;
    
    // Supabase DB의 id는 숫자이므로 변환 (building-138 -> 138)
    const buildingId = typeof id === 'string' ? Number(id.replace('building-', '')) : id;

    const { error } = await supabase
      .from('buildings')
      .update({ password, memo })
      .eq('id', buildingId);

    if (error) throw error;
    return NextResponse.json({ message: '성공적으로 저장되었습니다!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}