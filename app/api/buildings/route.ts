import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function jsonError(message: string, status: number) {
  return NextResponse.json({ buildings: [], error: message }, { status });
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    return jsonError(
      'Supabase가 설정되지 않았습니다. 프로젝트 루트에 .env.local을 만들고 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 넣어주세요.',
      503
    );
  }

  const supabase = createClient(url, key);

  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ buildings: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '건물 목록을 불러오지 못했습니다.';
    return jsonError(message, 500);
  }
}