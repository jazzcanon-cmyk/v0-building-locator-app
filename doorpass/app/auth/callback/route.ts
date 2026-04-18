import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    // code가 없으면 로그인 페이지로
    return NextResponse.redirect(new URL("/login?error=no_code", origin))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // OAuth code → session 교환 (이 단계가 없으면 getUser()가 null 반환)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=exchange_failed", origin))
  }

  // approved_users 승인 여부 확인
  const kakaoId =
    data.user.user_metadata?.provider_id || data.user.user_metadata?.sub

  const { data: approved } = await supabase
    .from("approved_users")
    .select("id, is_active")
    .eq("kakao_id", kakaoId)
    .single()

  if (!approved || !approved.is_active) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL("/login?error=unauthorized", origin))
  }

  return NextResponse.redirect(new URL("/", origin))
}
