"use client";

// Using inline type for flexibility with Prisma's return types

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Users, Clock, User, Trash2, Plus, Check } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { EditClassModal } from "./edit-class-modal";

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

export function ClassDetailSheet({ classId, open, onOpenChange }: Props) {
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(null);
    const [canceling, setCanceling] = useState(false);
    const [addingAttendance, setAddingAttendance] = useState(false);
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [athleteDialogOpen, setAthleteDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (open && classId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const handleOpenAthleteDialog = async () => {
        setAthleteDialogOpen(true);
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
            setAthleteDialogOpen(false);
            // Refresh data
            const refreshed = await getClassDetails(classId);
            if (refreshed.success) setData(refreshed.data);
        } else {
            toast.error(result.error);
        }
    };

    if (!open) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl flex items-center gap-2">
                        {loading ? "Cargando..." : data?.name}
                    </SheetTitle>
                    <SheetDescription>
                        {loading ? "..." : `${data?.dayOfWeek} • ${data?.startTime} - ${data?.endTime}`}
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : data ? (
                    <Tabs defaultValue="attendance" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                            <TabsTrigger value="details">Detalles</TabsTrigger>
                            <TabsTrigger value="qr">QR Code</TabsTrigger>
                        </TabsList>

                        <TabsContent value="attendance" className="space-y-4 mt-4">
                            <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg">
                                <span className="text-sm font-medium">Asistencia actual</span>
                                <Badge variant="secondary" className="text-lg font-bold">
                                    {data.attendances.length} / {data.maxCapacity}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                {data.attendances.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No hay atletas registrados aún.
                                    </div>
                                ) : (
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    data.attendances.map((att: any) => (
                                        <div key={att.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={att.athlete.photoUrl} alt={att.athlete.firstName} />
                                                    <AvatarFallback>{att.athlete.firstName[0]}{att.athlete.lastName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{att.athlete.firstName} {att.athlete.lastName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • via {att.method}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Dialog open={athleteDialogOpen} onOpenChange={setAthleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" variant="outline" onClick={handleOpenAthleteDialog}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Registrar Asistencia Manual
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Seleccionar Atleta</DialogTitle>
                                        <DialogDescription>
                                            Elige un atleta para registrar su asistencia manualmente.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="h-[300px] pr-4">
                                        <div className="space-y-2">
                                            {athletes.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                    Cargando atletas...
                                                </div>
                                            ) : (
                                                athletes.map((athlete) => (
                                                    <Button
                                                        key={athlete.id}
                                                        variant="ghost"
                                                        className="w-full justify-start h-auto py-3"
                                                        disabled={addingAttendance}
                                                        onClick={() => handleAddAttendance(athlete.id)}
                                                    >
                                                        <Avatar className="h-8 w-8 mr-3">
                                                            <AvatarImage src={athlete.photoUrl || undefined} />
                                                            <AvatarFallback>{athlete.firstName[0]}{athlete.lastName[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{athlete.firstName} {athlete.lastName}</span>
                                                        {addingAttendance && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
                                                    </Button>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-6 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Horario</span>
                                    <p className="font-medium">{data.startTime} - {data.endTime}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Coach</span>
                                    <p className="font-medium">
                                        {data.coaches && data.coaches.length > 0
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            ? data.coaches.map((c: any) => c.name).join(", ")
                                            : "Sin asignar"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">Tipo</span>
                                    <Badge variant="outline">{data.type}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">Color</span>
                                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: data.color }} />
                                </div>
                            </div>

                            <Separator />

                            <div className="pt-2">
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
                                />
                            </div>

                            <Separator />

                            <div className="pt-2">
                                <h3 className="text-sm font-medium mb-2 text-destructive">Zona de Peligro</h3>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full justify-start" disabled={canceling}>
                                            {canceling ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="mr-2 h-4 w-4" />
                                            )}
                                            Cancelar esta clase
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción eliminará todas las asistencias registradas y desactivará la clase.
                                                Esta acción no se puede deshacer.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleCancelClass} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Sí, cancelar clase
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Esto eliminará la clase y todas las asistencias asociadas.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="qr" className="mt-4">
                            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border">
                                <QrGenerator classId={data.id} className={data.name} />
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}
