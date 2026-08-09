import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const code = searchParams.get("code")

        if (code) {
            const coupon = await prisma.coupon.findUnique({ where: { code } })
            if (!coupon || !coupon.isPublic) {
                return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
            }
            return NextResponse.json({ coupon })
        }

        const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
        return NextResponse.json({ coupons })
    } catch (error) {
        console.error("Coupons GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = body

        if (!code || !description || !discount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                description,
                discount: Number(discount),
                forNewUser: Boolean(forNewUser),
                forMember: Boolean(forMember),
                isPublic: Boolean(isPublic),
                expiresAt: new Date(expiresAt),
            },
        })

        return NextResponse.json({ coupon }, { status: 201 })
    } catch (error) {
        console.error("Coupons POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = body

        if (!code) {
            return NextResponse.json({ error: "code required" }, { status: 400 })
        }

        const data = {}
        if (description !== undefined) data.description = description
        if (discount !== undefined) data.discount = Number(discount)
        if (forNewUser !== undefined) data.forNewUser = Boolean(forNewUser)
        if (forMember !== undefined) data.forMember = Boolean(forMember)
        if (isPublic !== undefined) data.isPublic = Boolean(isPublic)
        if (expiresAt !== undefined) data.expiresAt = new Date(expiresAt)

        const coupon = await prisma.coupon.update({ where: { code }, data })

        return NextResponse.json({ coupon })
    } catch (error) {
        console.error("Coupons PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        await prisma.coupon.delete({ where: { code: body.code } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Coupons DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
