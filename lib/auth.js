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
                    include: { store: true },
                })

                if (!user || !user.password) return null

                const passwordMatch = await bcrypt.compare(credentials.password, user.password)
                if (!passwordMatch) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
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
                token.storeId = user.storeId || null
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id
                session.user.role = token.role
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
