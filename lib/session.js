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

export function forbidden() {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export function requireRole(user, roles) {
    if (!user) return false
    return roles.includes(user.role)
}

// Check if the user has a specific permission (admin bypasses all checks)
export function hasPermission(user, permission) {
    if (!user) return false
    if (user.role === "admin") return true
    return Array.isArray(user.permissions) && user.permissions.includes(permission)
}

// Middleware helper: returns NextResponse or null
export function requirePermission(user, permission) {
    if (!user) return unauthorized()
    if (!hasPermission(user, permission)) return forbidden()
    return null
}
