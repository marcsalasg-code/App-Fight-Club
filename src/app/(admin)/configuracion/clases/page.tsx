import { ClassTypesManager } from "./class-types-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";

export default function ClassTypesPage() {
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
                        <Settings2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Tipos de Clase</h1>
                        <p className="text-muted-foreground">
                            Personaliza las disciplinas, colores y estilos del calendario
                        </p>
                    </div>
                </div>
            </div>

            <ClassTypesManager />
        </div>
    );
}
