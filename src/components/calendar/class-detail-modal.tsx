"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Clock, User, Trash2, Plus, QrCode, CalendarDays, BarChart3, Edit, X, Users } from "lucide-react";
import { getClassDetails, cancelClass, addManualAttendance, getActiveAthletes } from "@/app/actions/class-details";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrGenerator } from "@/components/checkin/qr-generator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { EditClassModal } from "./edit-class-modal";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

type Props = {
    classId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Athlete = {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
};

export function ClassDetailModal({ classId, open, onOpenChange }: Props) {
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(null);
    const [canceling, setCanceling] = useState(false);
    const [addingAttendance, setAddingAttendance] = useState(false);
    const [athletes, setAthletes] = useState<Athlete[]>([]);

    // For the quick-add command
    const [showAddAthlete, setShowAddAthlete] = useState(false);

    // For QR Expansion
    const [showFullQr, setShowFullQr] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (open && classId) {
            setLoading(true);
            getClassDetails(classId).then((result) => {
                if (result.success) {
                    setData(result.data);
                } else {
                    toast.error(result.error);
                    onOpenChange(false);
                }
                setLoading(false);
            });
        }
    }, [open, classId, onOpenChange]);

    const handleCancelClass = async () => {
        if (!classId) return;
        setCanceling(true);
        const result = await cancelClass(classId);
        setCanceling(false);

        if (result.success) {
            toast.success(result.message);
            onOpenChange(false);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const loadAthletes = async () => {
        if (athletes.length > 0) return; // Cache slightly
        const result = await getActiveAthletes();
        if (result.success) {
            setAthletes(result.data || []);
        } else {
            toast.error(result.error);
        }
    };

    const handleAddAttendance = async (athleteId: string) => {
        if (!classId) return;
        setAddingAttendance(true);
        const result = await addManualAttendance(classId, athleteId);
        setAddingAttendance(false);

        if (result.success) {
            toast.success(result.message);
            setShowAddAthlete(false);
            // Refresh data
            const refreshed = await getClassDetails(classId);
            if (refreshed.success) setData(refreshed.data);
        } else {
            toast.error(result.error);
        }
    };

    if (!open) return null;

    // Derived formatting
    const occupancy = data ? (data.attendances.length / data.maxCapacity) * 100 : 0;
    const isFull = data ? data.attendances.length >= data.maxCapacity : false;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[95vw] md:max-w-[80vw] lg:max-w-[70vw] h-[90vh] md:h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header Section - Sticky Top */}
                <div className="p-6 border-b bg-muted/10  flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            {loading ? (
                                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold">{data?.name}</h2>
                                    <Badge variant={data?.active ? "default" : "destructive"}>
                                        {data?.active ? "Activa" : "Cancelada"}
                                    </Badge>
                                    <Badge variant="outline">{data?.type}</Badge>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                {data?.dayOfWeek}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {data?.startTime} - {data?.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {data?.coaches?.map((c: any) => c.name).join(", ") || "Sin Coach"}
                            </span>
                        </div>
                    </div>
                    {/* Close button provided by DialogContent by default, but we can have extra actions */}
                </div>

                {/* Main Body - Responsive Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 h-full overflow-hidden">

                    {/* LEFT COLUMN (40% -> col-span-2) */}
                    <div className="col-span-2 border-r bg-muted/5 p-6 flex flex-col gap-6 overflow-y-auto">

                        {/* Capacity Card */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" /> Aforo
                                </h3>
                                <span className={cn("text-sm font-medium", isFull ? "text-destructive" : "text-muted-foreground")}>
                                    {data?.attendances?.length} / {data?.maxCapacity}
                                </span>
                            </div>
                            <Progress value={occupancy} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {isFull ? "Clase completa" : `${(data?.maxCapacity || 0) - (data?.attendances?.length || 0)} plazas disponibles`}
                            </p>
                        </div>

                        <Separator />

                        {/* QR Code Section - Button Only */}
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <QrCode className="h-4 w-4" /> QR de Acceso
                            </h3>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowFullQr(true)}
                            >
                                <QrCode className="mr-2 h-4 w-4" /> Ver código QR completo
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Click para mostrar el QR que los atletas escanean
                            </p>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="mt-auto space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Gestión</h3>

                            {/* Edit Action wrapped in Modal */}
                            {data && (
                                <EditClassModal
                                    classData={{
                                        id: data.id,
                                        name: data.name,
                                        type: data.type,
                                        dayOfWeek: data.dayOfWeek,
                                        startTime: data.startTime,
                                        endTime: data.endTime,
                                        levelRequired: data.levelRequired,
                                        maxCapacity: data.maxCapacity,
                                        color: data.color,
                                    }}
                                    onSuccess={() => {
                                        getClassDetails(classId!).then((result) => {
                                            if (result.success) setData(result.data);
                                        });
                                    }}
                                >
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="mr-2 h-4 w-4" /> Editar Clase
                                    </Button>
                                </EditClassModal>
                            )}

                            {/* Cancel Action */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 border-destructive/20">
                                        <Trash2 className="mr-2 h-4 w-4" /> Cancelar Clase
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Cancelar esta clase?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Se eliminarán la asistencia y se marcará como inactiva.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Volver</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancelClass} className="bg-destructive">
                                            Confirmar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (60% -> col-span-3) */}
                    <div className="col-span-3 p-6 flex flex-col h-full overflow-hidden bg-background">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Users className="h-5 w-5" /> Asistencia
                            </h3>
                            <Button
                                size="sm"
                                onClick={() => { loadAthletes(); setShowAddAthlete(true); }}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" /> Añadir Atleta
                            </Button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto pr-2 rounded-md border">
                            {data?.attendances?.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                                    <Users className="h-12 w-12 opacity-20 mb-4" />
                                    <p>No hay atletas registrados</p>
                                    <Button variant="link" onClick={() => { loadAthletes(); setShowAddAthlete(true); }}>
                                        Registrar al primero
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {data?.attendances?.map((att: any) => (
                                        <div key={att.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={att.athlete.photoUrl} />
                                                    <AvatarFallback>{att.athlete.firstName[0]}{att.athlete.lastName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{att.athlete.firstName} {att.athlete.lastName}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span>•</span>
                                                        <Badge variant="secondary" className="text-[10px] h-5">
                                                            {att.method}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* We could add Remove Attendance button here later */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                )}
            </DialogContent>

            {/* Quick Add Athlete Dialog (Command Palette) */}
            <CommandDialog open={showAddAthlete} onOpenChange={setShowAddAthlete}>
                <DialogTitle className="sr-only">Buscar Atleta</DialogTitle>
                <Command>
                    <CommandInput placeholder="Buscar atleta por nombre..." />
                    <CommandList>
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup heading="Atletas Activos">
                            {athletes.map((athlete) => (
                                <CommandItem
                                    key={athlete.id}
                                    onSelect={() => handleAddAttendance(athlete.id)}
                                >
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={athlete.photoUrl || undefined} />
                                        <AvatarFallback>{athlete.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    {athlete.firstName} {athlete.lastName}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>

            {/* Full QR Dialog */}
            <Dialog open={showFullQr} onOpenChange={setShowFullQr}>
                <DialogContent className="sm:max-w-sm flex items-center justify-center p-8">
                    <DialogTitle className="sr-only">QR Acceso</DialogTitle>
                    {data?.id && (
                        <div className="text-center space-y-4">
                            <QrGenerator classId={data.id} size={250} />
                            <p className="text-sm text-muted-foreground font-medium">{data.name}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
