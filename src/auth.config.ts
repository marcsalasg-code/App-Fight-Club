import type { NextAuthConfig } from "next-auth";
import { publicRoutes, authRoutes, apiAuthPrefix } from "@/lib/routes";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname === '/';
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            // 1. If user is logged in and trying to reach login page, redirect to dashboard
            if (isOnLogin && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // 2. If user is trying to reach dashboard (or root) and is NOT logged in, redirect to login
            // Note: We use "startsWith" to protect all sub-routes of dashboard

            // Let's rely on specific check for now to be safe
            // Any route NOT in publicRoutes/authRoutes/api is protected
            const isApi = nextUrl.pathname.startsWith('/api');
            const isPublic = publicRoutes.includes(nextUrl.pathname);
            const isAuth = authRoutes.includes(nextUrl.pathname);

            if (isApi) return true;

            if (isAuth) {
                if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
                return true;
            }

            if (!isLoggedIn && !isPublic) {
                return false; // Redirects to login automatically
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                // Add role to the token
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
