import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { store: true, roleRef: true },
                })

                if (!user || !user.password) return null

                // Block suspended users
                if (user.active === false) return null

                const passwordMatch = await bcrypt.compare(credentials.password, user.password)
                if (!passwordMatch) return null

                const permissions = Array.isArray(user.roleRef?.permissions) ? user.roleRef.permissions : []

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    permissions,
                    storeId: user.store?.id || null,
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.permissions = user.permissions || []
                token.storeId = user.storeId || null
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id
                session.user.role = token.role
                session.user.permissions = token.permissions || []
                session.user.storeId = token.storeId || null
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
}
