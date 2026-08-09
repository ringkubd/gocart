import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import bcrypt from "bcryptjs"

export async function POST(req) {
    try {
        const admin = await getSessionUser()
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { name, email, password, storeName, username, description, contact, address, logo } = body

        if (!name || !email || !password || !storeName || !username) {
            return NextResponse.json({ error: "Name, email, password, store name and username are required" }, { status: 400 })
        }

        // Reuse existing user if email already exists
        let user = await prisma.user.findUnique({ where: { email } })
        if (user) {
            const existingStore = await prisma.store.findUnique({ where: { userId: user.id } })
            if (existingStore) {
                return NextResponse.json({ error: "This email already has a store" }, { status: 409 })
            }
        } else {
            const hashed = await bcrypt.hash(password, 10)
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashed,
                    role: "user",
                    cart: {},
                },
            })
        }

        const usernameTaken = await prisma.store.findUnique({ where: { username } })
        if (usernameTaken) {
            return NextResponse.json({ error: "Store username already taken" }, { status: 409 })
        }

        const store = await prisma.store.create({
            data: {
                userId: user.id,
                name: storeName,
                username,
                description: description || "",
                address: address || "",
                status: "approved",
                isActive: true,
                logo: logo || "",
                email: email,
                contact: contact || "",
            },
            include: { user: { select: { name: true, email: true, image: true } } },
        })

        return NextResponse.json({ store }, { status: 201 })
    } catch (error) {
        console.error("Admin sellers POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const admin = await getSessionUser()
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { id, name, storeName, username, description, contact, address, logo, isActive, status } = body

        if (!id) {
            return NextResponse.json({ error: "store id required" }, { status: 400 })
        }

        const store = await prisma.store.findUnique({ where: { id }, include: { user: true } })
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        const storeData = {}
        if (storeName !== undefined) storeData.name = storeName
        if (username !== undefined) storeData.username = username
        if (description !== undefined) storeData.description = description
        if (contact !== undefined) storeData.contact = contact
        if (address !== undefined) storeData.address = address
        if (logo !== undefined) storeData.logo = logo
        if (isActive !== undefined) storeData.isActive = Boolean(isActive)
        if (status !== undefined) storeData.status = status

        const updatedStore = await prisma.store.update({ where: { id }, data: storeData })

        if (name !== undefined && store.user) {
            await prisma.user.update({ where: { id: store.user.id }, data: { name } })
        }

        return NextResponse.json({ store: updatedStore })
    } catch (error) {
        console.error("Admin sellers PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const admin = await getSessionUser()
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        if (!body.id) {
            return NextResponse.json({ error: "store id required" }, { status: 400 })
        }

        await prisma.store.delete({ where: { id: body.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin sellers DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
