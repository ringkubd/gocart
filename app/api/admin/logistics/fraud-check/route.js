import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { fraudCheck } from "@/lib/couriers/steadfast"

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const phone = (body.phone || "").replace(/\D/g, "")
        if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 })

        try {
            const data = await fraudCheck(phone)
            return NextResponse.json({ result: data })
        } catch (e) {
            return NextResponse.json({ error: e.message || "Fraud check failed" }, { status: 200 })
        }
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
