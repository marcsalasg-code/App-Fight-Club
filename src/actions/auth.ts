"use server";

import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const rawData = Object.fromEntries(formData);
        const callbackUrl = rawData.callbackUrl as string | undefined;

        await signIn("credentials", {
            ...rawData,
            redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Credenciales inválidas.";
                default:
                    return "Algo salió mal.";
            }
        }
        throw error;
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" });
}
