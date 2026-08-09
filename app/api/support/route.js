import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const tickets = await prisma.supportTicket.findMany({
            where: { userId: user.id },
            include: {
                messages: {
                    include: { sender: { select: { name: true, role: true } } },
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { updatedAt: "desc" },
        })

        return NextResponse.json({ tickets })
    } catch (error) {
        console.error("Support tickets GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { subject, message, priority } = body

        if (!subject || !message) {
            return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                subject,
                priority: priority || "normal",
                userId: user.id,
                messages: {
                    create: {
                        senderId: user.id,
                        senderRole: "user",
                        body: message,
                    },
                },
            },
            include: { messages: true },
        })

        return NextResponse.json({ ticket }, { status: 201 })
    } catch (error) {
        console.error("Support tickets POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
