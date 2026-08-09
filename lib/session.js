import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function getSessionUser() {
    const session = await getServerSession(authOptions)
    return session?.user || null
}

export function unauthorized() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function requireRole(user, roles) {
    if (!user) return false
    return roles.includes(user.role)
}
