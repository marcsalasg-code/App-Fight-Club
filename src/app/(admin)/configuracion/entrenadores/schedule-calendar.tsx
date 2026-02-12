"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, UserPlus, X } from "lucide-react";
import { getCalendarSchedule, removeSubstitution, assignCoachToInstance } from "@/actions/schedule";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ScheduleItem = {
    instanceId: string;
    classId: string;
    date: Date;
    name: string;
    startTime: string;
    endTime: string;
    coaches: { id: string; name: string }[];
    isSubstitute: boolean;
    overrideId?: string;
};

type Props = {
    initialSchedule: ScheduleItem[];
    coaches: { id: string; name: string }[];
};

export function ScheduleCalendar({ initialSchedule, coaches }: Props) {
    // Current viewed week
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
    const [loading, setLoading] = useState(false);

    // For assigning
    const [selectedInstance, setSelectedInstance] = useState<ScheduleItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCoachId, setSelectedCoachId] = useState("");

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    // Generate days for header
    const days = useMemo(() => {
        const d = [];
        let curr = weekStart;
        while (curr <= weekEnd) {
            d.push(curr);
            curr = addDays(curr, 1);
        }
        return d;
    }, [weekStart]);

    const handleNavigate = async (direction: "prev" | "next" | "today") => {
        setLoading(true);
        let newDate = new Date(currentDate);
        if (direction === "prev") newDate = addDays(newDate, -7);
        if (direction === "next") newDate = addDays(newDate, 7);
        if (direction === "today") newDate = new Date();

        setCurrentDate(newDate);

        const start = startOfWeek(newDate, { weekStartsOn: 1 });
        const end = endOfWeek(newDate, { weekStartsOn: 1 });

        try {
            const newSchedule = await getCalendarSchedule(start, end);
            setSchedule(newSchedule);
        } catch (error) {
            toast.error("Error al cargar horario");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedInstance || !selectedCoachId) return;

        const result = await assignCoachToInstance(selectedInstance.classId, selectedInstance.date, selectedCoachId);

        if (result.success) {
            toast.success("Sustitución asignada");
            setDialogOpen(false);
            // Refresh
            handleNavigate("today"); // Simple refresh logic or re-fetch current week
        } else {
            toast.error("Error al asignar");
        }
    };

    const handleRemoveSubstitution = async (item: ScheduleItem) => {
        if (!confirm("¿Eliminar sustitución y volver al entrenador original?")) return;

        const result = await removeSubstitution(item.classId, item.date);
        if (result.success) {
            toast.success("Sustitución eliminada");
            // Refresh
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            const newSchedule = await getCalendarSchedule(start, end);
            setSchedule(newSchedule);
        } else {
            toast.error("Error al eliminar");
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Gestión de Horarios y Sustituciones
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleNavigate("prev")} disabled={loading}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[150px] text-center font-medium capitalize">
                        {format(currentDate, "MMMM yyyy", { locale: es })}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => handleNavigate("next")} disabled={loading}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => handleNavigate("today")} disabled={loading}>
                        Hoy
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
                        {/* Headers */}
                        {days.map((day) => (
                            <div key={day.toString()} className="bg-background p-2 text-center text-sm font-medium border-b">
                                <div className="text-muted-foreground capitalize">{format(day, "EEE", { locale: es })}</div>
                                <div className={cn("text-lg", isSameDay(day, new Date()) && "text-primary font-bold")}>
                                    {format(day, "d")}
                                </div>
                            </div>
                        ))}

                        {/* Schedule Grid */}
                        {days.map((day) => {
                            const dayItems = schedule.filter(s => isSameDay(new Date(s.date), day))
                                .sort((a, b) => a.startTime.localeCompare(b.startTime));

                            return (
                                <div key={day.toString()} className="bg-background min-h-[150px] p-2 space-y-2">
                                    {dayItems.map((item) => (
                                        <div
                                            key={item.instanceId}
                                            className={cn(
                                                "text-xs p-2 rounded-md border cursor-pointer hover:bg-accent transition-colors group relative",
                                                item.isSubstitute ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20" : "bg-card"
                                            )}
                                        >
                                            <div className="font-semibold truncate">{item.name}</div>
                                            <div className="text-muted-foreground">{item.startTime} - {item.endTime}</div>
                                            <div className="mt-1 flex items-center gap-1">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    item.isSubstitute ? "bg-amber-500" : "bg-green-500"
                                                )} />
                                                <span className="truncate">
                                                    {item.coaches.map(c => c.name).join(", ") || "Sin Coach"}
                                                </span>
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                {item.isSubstitute && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 hover:bg-destructive/20 hover:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveSubstitution(item);
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 bg-background/80"
                                                    onClick={() => {
                                                        setSelectedInstance(item);
                                                        setSelectedCoachId(item.coaches[0]?.id || "");
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    <UserPlus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Asignar Entrenador</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="text-sm">
                            <p className="font-medium">{selectedInstance?.name}</p>
                            <p className="text-muted-foreground">
                                {selectedInstance && format(new Date(selectedInstance.date), "EEEE d MMMM", { locale: es })} • {selectedInstance?.startTime}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Entrenador (Sustitución)</label>
                            <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar entrenador" />
                                </SelectTrigger>
                                <SelectContent>
                                    {coaches.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Esto asignará al entrenador solo para esta clase específica.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleAssign}>Guardar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
