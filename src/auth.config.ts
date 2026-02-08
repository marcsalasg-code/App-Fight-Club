import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
            const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
            const isAuthRoute = authRoutes.includes(nextUrl.pathname);

            if (isApiAuthRoute) {
                return true;
            }

            if (isAuthRoute) {
                if (isLoggedIn) {
                    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
                }
                return true;
            }

            if (!isLoggedIn && !isPublicRoute) {
                let callbackUrl = nextUrl.pathname;
                if (nextUrl.search) {
                    callbackUrl += nextUrl.search;
                }

                const encodedCallbackUrl = encodeURIComponent(callbackUrl);
                return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
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
