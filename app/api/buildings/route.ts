import { NextResponse } from "next/server"

const SHEET_ID = "13ktJLWfDtwxmwetExLM4ihdTvZp5TORwUcIZMnCGw2s"
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`

export interface Building {
  id: string
  name: string
  address: string
  password: string
  latitude: number
  longitude: number
}

function parseCSV(csv: string): Building[] {
  const lines = csv.split("\n")
  const buildings: Building[] = []

  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Parse CSV considering potential commas in fields
    const values = parseCSVLine(line)
    
    if (values.length >= 5) {
      const [name, address, password, lat, lng] = values
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)

      if (!isNaN(latitude) && !isNaN(longitude)) {
        buildings.push({
          id: `building-${i}`,
          name: name.trim(),
          address: address.trim(),
          password: password.trim(),
          latitude,
          longitude,
        })
      }
    }
  }

  return buildings
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)

  return result
}

export async function GET() {
  try {
    const response = await fetch(SHEET_URL, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Google Sheet")
    }

    const csv = await response.text()
    const buildings = parseCSV(csv)

    return NextResponse.json({ buildings })
  } catch (error) {
    console.error("Error fetching buildings:", error)
    return NextResponse.json(
      { error: "Failed to fetch building data" },
      { status: 500 }
    )
  }
}
