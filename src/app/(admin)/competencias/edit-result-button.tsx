
"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { updateCompetition } from "./actions";
import { toast } from "sonner";
import { MoreHorizontal, Trophy, X, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
    competitionId: string;
    currentResult: string;
    athleteId: string;
    eventName: string;
    date: Date;
};

export function EditResultButton({ competitionId, currentResult, athleteId, eventName, date }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleUpdate(result: string) {
        setLoading(true);
        // We need to pass required fields for update or just update status if schema allows partials?
        // Schema requires all fields in actions.ts logic?
        // Let's check updateCompetition in actions.ts. It re-validates ALL fields. 
        // This is problematic if we don't have all data here.
        // We might need a specific action 'updateCompetitionResult'.

        // For now, assume we need a new action or update existing one to allow partials.
        // I will create 'updateCompetitionResult' in actions.ts first.

        // Let's assume the action exists.
        const res = await updateResult(competitionId, result);

        setLoading(false);
        if (res.success) {
            toast.success("Resultado actualizado");
            router.refresh();
        } else {
            toast.error("Error al actualizar");
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleUpdate("WON")} className="text-green-600">
                    <Trophy className="mr-2 h-4 w-4" />
                    Victoria
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdate("LOST")} className="text-red-600">
                    <X className="mr-2 h-4 w-4" />
                    Derrota
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdate("DRAW")} className="text-yellow-600">
                    <Minus className="mr-2 h-4 w-4" />
                    Empate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdate("PENDING")} className="text-gray-600">
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    Pendiente
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

import { updateCompetitionResult as updateResult } from "./actions"; 
