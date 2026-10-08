import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { steadfastGetPayments, steadfastGetPayment } from "@/lib/couriers/steadfast"

function normalizeList(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.payments)) return data.payments
    return []
}

export async function GET(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        try {
            if (id) {
                const data = await steadfastGetPayment(id)
                return NextResponse.json({ payment: data?.data || data })
            }
            const data = await steadfastGetPayments()
            return NextResponse.json({ payments: normalizeList(data), raw: data })
        } catch (e) {
            return NextResponse.json({ payments: [], error: e.message }, { status: 200 })
        }
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
