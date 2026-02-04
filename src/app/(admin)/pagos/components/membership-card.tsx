"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MembershipDialog } from "./membership-dialog";
import { useState } from "react";
import { deleteMembership } from "../actions";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

type Membership = {
    id: string;
    name: string;
    price: number;
    durationDays: number | null;
    classCount: number | null;
    description: string | null;
    active: boolean;
};

export function MembershipCard({ membership }: { membership: Membership }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setDeleting(true);
        const result = await deleteMembership(membership.id);
        setDeleting(false);

        if (result.success) {
            toast.success("Membresía eliminada");
            setDeleteOpen(false);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <div className="h-full">
            <Card className="h-full hover:shadow-lg transition-shadow relative group flex flex-col justify-between">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        {membership.name}
                        {membership.active && <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">Activa</Badge>}
                    </CardTitle>
                    <div className="absolute top-4 right-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-3xl font-bold text-primary">
                            €{membership.price.toFixed(2)}
                        </p>
                        <div className="text-sm text-muted-foreground">
                            {membership.durationDays && <p>Duración: {membership.durationDays} días</p>}
                            {membership.classCount && <p>Clases: {membership.classCount}</p>}
                            {!membership.durationDays && !membership.classCount && (
                                <p>Sin límite de tiempo ni clases</p>
                            )}
                        </div>
                        {membership.description && (
                            <p className="text-sm">{membership.description}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <MembershipDialog
                membership={membership}
                open={editOpen}
                onOpenChange={setEditOpen}
                trigger={<span className="hidden" />}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción desactivará la membresía. No se podrán crear nuevas suscripciones con ella, pero las existentes continuarán activas hasta su expiración.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
