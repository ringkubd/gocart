import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { steadfastGetPoliceStations } from "@/lib/couriers/steadfast"

function normalizeList(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.police_stations)) return data.police_stations
    return []
}

// Flatten districts -> stations
function flattenStations(list) {
    const out = []
    for (const d of list) {
        const district = d.name || d.district || ""
        const stations = d.policestations || d.police_stations || []
        if (Array.isArray(stations)) {
            for (const s of stations) out.push({ name: s.name || s, district })
        } else {
            out.push({ name: district, district: "" })
        }
    }
    return out
}

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        try {
            const data = await steadfastGetPoliceStations()
            return NextResponse.json({ stations: flattenStations(normalizeList(data)) })
        } catch (e) {
            return NextResponse.json({ stations: [], error: e.message }, { status: 200 })
        }
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
