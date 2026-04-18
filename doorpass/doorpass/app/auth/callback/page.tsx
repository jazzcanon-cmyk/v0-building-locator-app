"use client"
import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const run = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) { 
                router.push("/login")
                return 
            }

            const kakaoId = session.user.user_metadata?.provider_id ||
                                            session.user.user_metadata?.sub

            const { data } = await supabase
                .from("approved_users")
                .select("id, is_active, kakao_id")
                .eq("kakao_id", kakaoId)
                .single()

            if (!data || !data.is_active) {
                await supabase.auth.signOut()
                router.push("/login?error=unauthorized")
                return
            }

            router.push("/")
        }
        run()
    }, [router])

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a1a2e,#0f3460)" }}>
            <div style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #FEE500", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 20 }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>로그인 확인 중... ⏳</p>
        </div>
    )
}