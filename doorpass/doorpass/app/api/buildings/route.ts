import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    let allBuildings: any[] = []
    let from = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name, address, password, lat, lng, memo")
        .order("address", { ascending: true })
        .range(from, from + pageSize - 1)

      if (error) throw new Error(error.message)
      if (!data || data.length === 0) break

      allBuildings = allBuildings.concat(data)
      if (data.length < pageSize) break
      from += pageSize
    }

    const buildings = allBuildings.map((b) => ({
      id: String(b.id),
      name: b.name ?? b.address?.split(" ").slice(-1)[0] ?? "",
      address: b.address ?? "",
      password: b.password ?? "",
      latitude: b.lat,
      longitude: b.lng,
      memo: b.memo ?? "",
    }))

    return NextResponse.json({ buildings })
  } catch (error) {
    console.error("Error fetching buildings:", error)
    return NextResponse.json(
      { error: "Failed to fetch building data" },
      { status: 500 }
    )
  }
}
