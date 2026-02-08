import { auth } from "@/auth";

export type Role = "ADMIN" | "COACH";

export async function verifySession() {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized: No session found");
    }
    return session;
}

export async function requireRole(allowedRoles: Role[]) {
    const session = await verifySession();
    const userRole = session.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
        throw new Error(`Forbidden: User role ${userRole} is not allowed`);
    }

    return session;
}

export async function requireAdmin() {
    return requireRole(["ADMIN"]);
}
