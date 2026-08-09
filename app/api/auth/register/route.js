import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        }

        const hashed = await bcrypt.hash(password, 10)

        const userCount = await prisma.user.count()
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role: userCount === 0 ? "admin" : "user",
                cart: {},
            },
        })

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
    } catch (error) {
        console.error("Register error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
