import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requirePermission } from "@/lib/session"
import bcrypt from "bcryptjs"

export async function GET(req) {
    try {
        const user = await getSessionUser()
        const denied = requirePermission(user, "users")
        if (denied) return denied

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const role = searchParams.get("role") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const pageSize = parseInt(searchParams.get("pageSize") || "20")

        const where = {}
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ]
        }
        if (role) {
            where.role = role
        }

        const total = await prisma.user.count({ where })
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                active: true,
                createdAt: true,
                roleRef: { select: { name: true, label: true } },
                _count: { select: { buyerOrders: true } },
                store: { select: { id: true, name: true, username: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        const roles = await prisma.role.findMany({ orderBy: { name: "asc" } })

        return NextResponse.json({ users, total, page, pageSize, roles })
    } catch (error) {
        console.error("Admin users GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        const denied = requirePermission(user, "users")
        if (denied) return denied

        const body = await req.json()
        const { name, email, password, role } = body

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Name, email, password and role are required" }, { status: 400 })
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        }

        const roleRow = await prisma.role.findUnique({ where: { name: role } })
        const hashed = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role,
                roleId: roleRow?.id || null,
                active: true,
                cart: {},
            },
        })

        return NextResponse.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } }, { status: 201 })
    } catch (error) {
        console.error("Admin users POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const admin = await getSessionUser()
        const denied = requirePermission(admin, "users")
        if (denied) return denied

        const body = await req.json()
        const { userId, name, email, password, role, active } = body

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 })
        }

        const target = await prisma.user.findUnique({ where: { id: userId } })
        if (!target) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Prevent editing yourself into deactivation / locking yourself out
        if (userId === admin.id && (active === false || (email && email !== admin.email))) {
            return NextResponse.json({ error: "You cannot disable or change your own email" }, { status: 400 })
        }

        const data = {}
        if (name !== undefined) data.name = name
        if (email !== undefined) data.email = email
        if (password) data.password = await bcrypt.hash(password, 10)
        if (role !== undefined) {
            data.role = role
            const roleRow = await prisma.role.findUnique({ where: { name: role } })
            data.roleId = roleRow?.id || null
        }
        if (active !== undefined) data.active = Boolean(active)

        const updated = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                image: true,
                roleRef: { select: { name: true, label: true } },
            },
        })

        return NextResponse.json({ user: updated })
    } catch (error) {
        console.error("Admin users PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const admin = await getSessionUser()
        const denied = requirePermission(admin, "users")
        if (denied) return denied

        const body = await req.json()
        if (!body.userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 })
        }
        if (body.userId === admin.id) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
        }

        const target = await prisma.user.findUnique({ where: { id: body.userId } })
        if (!target) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        await prisma.user.delete({ where: { id: body.userId } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin users DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
