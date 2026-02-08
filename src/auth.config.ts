import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/configuracion") || nextUrl.pathname.startsWith("/atletas"); // Protect admin routes

            // Allow access to login page
            if (nextUrl.pathname.startsWith("/login")) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/", nextUrl)); // Redirect to dashboard if already logged in
                }
                return true;
            }

            // Protect Admin Routes
            // This is a simple check; we'll refine it with role checks in Middleware or server-side
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                // Add role to the token
                token.role = user.role;
                token.id = user.id;
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
