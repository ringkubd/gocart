import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public guest order lookup: ?id=<orderId>&email=<email>
// Lets a guest view their order without logging in.
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id") || ""
        const email = searchParams.get("email") || ""

        if (!id || !email) {
            return NextResponse.json({ error: "Order ID and email are required" }, { status: 400 })
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                store: { select: { name: true, username: true } },
                address: true,
                user: { select: { id: true, name: true, email: true } },
                orderItems: { include: { product: { include: { store: true } } } },
            },
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Match: the order's address email, guest email, or linked user email must equal the provided email
        const orderEmail = (order.guestEmail || order.address?.email || order.user?.email || "").toLowerCase()
        if (orderEmail !== email.toLowerCase()) {
            return NextResponse.json({ error: "Order not found for this email" }, { status: 404 })
        }

        return NextResponse.json({ order })
    } catch (error) {
        console.error("Guest order GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
