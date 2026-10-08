import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { steadfastBalance } from "@/lib/couriers/steadfast"

// Admin: verify Steadfast connection and return account balance.
export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        const data = await steadfastBalance()
        return NextResponse.json({ balance: data?.current_balance ?? null, raw: data })
    } catch (error) {
        return NextResponse.json({ error: error.message || "Failed" }, { status: 200 })
    }
}
