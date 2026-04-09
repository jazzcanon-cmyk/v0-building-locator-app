import { NextResponse } from "next/server"

const SHEET_ID = "13ktJLWfDtwxmwetExLM4ihdTvZp5TORwUcIZMnCGw2s"

// Google Apps Script Web App URL for updating the sheet
// You need to deploy a Google Apps Script and put the URL here
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL

export async function POST(request: Request) {
  try {
    const { buildingId, name, newPassword } = await request.json()

    if (!buildingId || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Extract row number from buildingId (e.g., "building-5" -> row 6 in sheet, accounting for header)
    const rowIndex = parseInt(buildingId.replace("building-", ""))
    const sheetRow = rowIndex + 1 // +1 for header row

    if (!APPS_SCRIPT_URL) {
      // If no Apps Script URL is configured, we'll just return success
      // In production, you would set up the Apps Script
      console.log(`Would update row ${sheetRow} with password: ${newPassword}`)
      return NextResponse.json({ 
        success: true, 
        message: "Update logged (Apps Script not configured)" 
      })
    }

    // Call Google Apps Script to update the sheet
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updatePassword",
        sheetId: SHEET_ID,
        row: sheetRow,
        column: 3, // Column C for password
        value: newPassword,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update Google Sheet")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    )
  }
}
