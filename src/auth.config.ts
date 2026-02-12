import type { NextAuthConfig } from "next-auth";
import { publicRoutes, authRoutes, DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";

export const authConfig = {
    pages: { signIn: "/login" },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuth = authRoutes.includes(nextUrl.pathname);
            const isPublic = publicRoutes.includes(nextUrl.pathname);

            // Logged-in user hitting /login → send to dashboard
            if (isAuth && isLoggedIn) {
                return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
            }
            // Auth pages always accessible to guests
            if (isAuth) return true;
            // Public pages always accessible
            if (isPublic) return true;
            // Everything else requires login (returning false auto-redirects to signIn page)
            return isLoggedIn;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                if (user.id) token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
