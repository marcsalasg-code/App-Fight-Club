import { CompetitionsManager } from "./competitions-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

export default function CompetitionsConfigPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/configuracion">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Configuración de Competencias</h1>
                        <p className="text-muted-foreground">
                            Gestiona categorías de peso, niveles y tipos de evento
                        </p>
                    </div>
                </div>
            </div>

            <CompetitionsManager />
        </div>
    );
}
