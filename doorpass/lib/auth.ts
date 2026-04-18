import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { redirect } from "next/navigation"

/**
 * API 라우트에서 세션 + 승인 여부를 검증하는 헬퍼.
 * - 미인증: 401
 * - 승인되지 않은 사용자(is_active=false 또는 미등록): 403
 * - 정상: user 반환
 */
export async function requireAuth() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 읽기 전용 컨텍스트에서는 무시
          }
        },
      },
    }
  )

  // 1단계: JWT 세션 검증
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      unauthorized: NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      ),
    }
  }

  // 2단계: approved_users 승인 여부 검증
  const kakaoId = user.user_metadata?.provider_id || user.user_metadata?.sub
  const { data: approved } = await supabase
    .from("approved_users")
    .select("id, is_active")
    .eq("kakao_id", kakaoId)
    .single()

  if (!approved || !approved.is_active) {
    return {
      user: null,
      unauthorized: NextResponse.json(
        { error: "접근 권한이 없습니다." },
        { status: 403 }
      ),
    }
  }

  return { user, unauthorized: null }
}

/**
 * 어드민 전용 페이지에서 사용하는 헬퍼.
 * role이 'admin'이 아니면 루트('/')로 리다이렉트합니다.
 */
export async function requireAdmin() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const kakaoId = user.user_metadata?.provider_id || user.user_metadata?.sub
  const { data: approved } = await supabase
    .from("approved_users")
    .select("id, is_active, role")
    .eq("kakao_id", kakaoId)
    .single()

  if (!approved || !approved.is_active || approved.role !== "admin") {
    redirect("/")
  }
}
