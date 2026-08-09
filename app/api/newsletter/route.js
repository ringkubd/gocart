import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req) {
    try {
        const body = await req.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const existing = await prisma.subscriber.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ success: true, message: "Already subscribed" })
        }

        await prisma.subscriber.create({ data: { email } })

        return NextResponse.json({ success: true }, { status: 201 })
    } catch (error) {
        console.error("Newsletter POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
