import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";
import { createZip } from "@/lib/zip";

export const dynamic = "force-dynamic";

function hexToRgb(hex: string): string {
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
        const r = parseInt(cleanHex.substring(0, 1) + cleanHex.substring(0, 1), 16);
        const g = parseInt(cleanHex.substring(1, 2) + cleanHex.substring(1, 2), 16);
        const b = parseInt(cleanHex.substring(2, 3) + cleanHex.substring(2, 3), 16);
        return `rgb(${r}, ${g}, ${b})`;
    } else if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
    return "rgb(0, 0, 0)";
}

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

        // Fetch gym settings for branding color and back fields
        const settings = await prisma.gymSettings.findFirst();
        const gymName = settings?.gymName || "RC Fight Club";
        const walletBgHex = settings?.walletPassBackgroundColor || "#000000";
        const walletBgColor = hexToRgb(walletBgHex);

        const activeSub = athlete.subscriptions[0];
        const membershipName = activeSub?.membership.name || "Sin membresía activa";
        const fullName = `${athlete.firstName} ${athlete.lastName}`;

        // Build standard Apple Wallet storeCard pass structure
        const passJson = {
            formatVersion: 1,
            passTypeIdentifier: "pass.com.rcfightclub.gym",
            serialNumber: athlete.id,
            teamIdentifier: "ABC123XYZ",
            organizationName: gymName,
            description: `Pase de Acceso para ${fullName}`,
            logoText: gymName,
            foregroundColor: "rgb(255, 255, 255)",
            backgroundColor: walletBgColor,
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
                        value: `Presenta este código QR en la entrada para registrar tu check-in diario de asistencia. Academia ${gymName}.`
                    },
                    ...(settings?.walletAddress ? [{
                        key: "address",
                        label: "DIRECCIÓN DE LA SEDE",
                        value: settings.walletAddress
                    }] : []),
                    ...(settings?.walletPhone ? [{
                        key: "phone",
                        label: "TELÉFONO DE CONTACTO",
                        value: settings.walletPhone
                    }] : []),
                    ...(settings?.walletInstagram ? [{
                        key: "instagram",
                        label: "INSTAGRAM",
                        value: settings.walletInstagram
                    }] : [])
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
