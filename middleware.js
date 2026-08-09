export { default } from "next-auth/middleware"

export const config = {
    matcher: ["/store/:path*", "/admin/:path*"],
}
