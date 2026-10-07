import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const auth = withAuth({
    pages: { signIn: "/login" },
})

export default function middleware(req, event) {
    const { pathname } = req.nextUrl

    // Bangla locale: rewrite /bn/* -> /* and tag the request with x-locale=bn
    if (pathname === "/bn" || pathname.startsWith("/bn/")) {
        const url = req.nextUrl.clone()
        url.pathname = pathname.replace(/^\/bn(?=\/|$)/, "") || "/"
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set("x-locale", "bn")
        return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    }

    // Protected dashboards
    if (pathname.startsWith("/store") || pathname.startsWith("/admin")) {
        return auth(req, event)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/bn", "/bn/:path*", "/store/:path*", "/admin/:path*"],
}
