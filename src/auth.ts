import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsed = z
                    .object({ email: z.string(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                // Find by email or name (supports Kiosk Mode where name is used)
                const user = await prisma.user.findFirst({
                    where: { OR: [{ email }, { name: email }] },
                });

                if (!user?.password) return null;

                const valid = await bcrypt.compare(password, user.password);
                return valid ? user : null;
            },
        }),
    ],
});
