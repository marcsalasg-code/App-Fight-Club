import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";
import { createZip } from "@/lib/zip";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const athleteId = searchParams.get("athleteId");

        if (!athleteId) {
            return NextResponse.json({ error: "L'ID de l'athlète est requis" }, { status: 400 });
        }

        const athlete = await prisma.athlete.findUnique({
            where: { id: athleteId },
            include: {
                subscriptions: {
                    where: { status: "ACTIVE" },
                    include: { membership: true }
                }
            }
        });

        if (!athlete) {
            return NextResponse.json({ error: "Athlète non trouvé" }, { status: 404 });
        }

        const activeSub = athlete.subscriptions[0];
        const membershipName = activeSub?.membership.name || "Sin membresía activa";
        const fullName = `${athlete.firstName} ${athlete.lastName}`;

        // Build standard Apple Wallet storeCard pass structure
        const passJson = {
            formatVersion: 1,
            passTypeIdentifier: "pass.com.rcfightclub.gym",
            serialNumber: athlete.id,
            teamIdentifier: "ABC123XYZ",
            organizationName: "RC Fight Club",
            description: `Pase de Acceso para ${fullName}`,
            logoText: "RC Fight Club",
            foregroundColor: "rgb(255, 255, 255)",
            backgroundColor: "rgb(0, 0, 0)",
            labelColor: "rgb(142, 142, 147)",
            sharingProhibited: true,
            barcode: athlete.pin ? {
                message: athlete.pin,
                format: "PKBarcodeFormatQR",
                messageEncoding: "iso-8859-1",
                altText: `PIN: ${athlete.pin}`
            } : undefined,
            storeCard: {
                primaryFields: [
                    {
                        key: "athleteName",
                        label: "ATLETA",
                        value: fullName
                    }
                ],
                secondaryFields: [
                    {
                        key: "status",
                        label: "ESTADO",
                        value: athlete.status === "ACTIVE" ? "ACTIVO" : "INACTIVO"
                    }
                ],
                auxiliaryFields: [
                    {
                        key: "membershipInfo",
                        label: "MEMBRESÍA",
                        value: membershipName
                    }
                ],
                backFields: [
                    {
                        key: "info",
                        label: "Información",
                        value: "Presenta este código QR en la entrada para registrar tu check-in diario de asistencia. RC Fight Club."
                    }
                ]
            }
        };

        const passJsonBuf = Buffer.from(JSON.stringify(passJson, null, 2), "utf-8");

        const sha1 = createHash("sha1").update(passJsonBuf).digest("hex");
        const manifest = {
            "pass.json": sha1
        };
        const manifestBuf = Buffer.from(JSON.stringify(manifest, null, 2), "utf-8");

        // Build mock uncompressed zip representing pkpass
        const pkpassZip = createZip([
            { name: "pass.json", content: passJsonBuf },
            { name: "manifest.json", content: manifestBuf }
        ]);

        const passBody = new Uint8Array(pkpassZip);

        return new NextResponse(passBody, {
            headers: {
                "Content-Type": "application/vnd.apple.pkpass",
                "Content-Disposition": `attachment; filename="rc_pass_${athlete.pin || athleteId}.pkpass"`,
                "Cache-Control": "no-store"
            }
        });
    } catch (e: any) {
        console.error("Error generating apple pass:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
