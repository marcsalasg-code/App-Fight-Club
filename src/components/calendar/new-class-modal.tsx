"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useClassTypes } from "@/hooks/use-class-types"; // Added import

// ... keep other imports but remove Dialog ones ...
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClass, ClassFormData, getCoachesList } from "@/app/(admin)/clases/actions";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const COLORS = [
    { value: "#D4AF37", label: "Dorado" },
    { value: "#E11D48", label: "Rojo" },
    { value: "#2563EB", label: "Azul" },
    { value: "#16A34A", label: "Verde" },
    { value: "#7C3AED", label: "Morado" },
];

export function NewClassModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([]);

    // Dynamic Class Types
    const { types: classTypes, loading: typesLoading } = useClassTypes();
    const [selectedType, setSelectedType] = useState("MUAY_THAI");
    const [selectedColor, setSelectedColor] = useState("#D4AF37");

    const router = useRouter();

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        // Find type and sync color
        const typeData = classTypes.find(t => t.code === value);
        if (typeData) {
            setSelectedColor(typeData.color);
        }
    };

    // Fetch coaches when dialog opens
    const handleOpenChange = async (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen && coaches.length === 0) {
            try {
                const list = await getCoachesList();
                setCoaches(list);
            } catch (error) {
                console.error("Error fetching coaches", error);
            }
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const coachId1 = formData.get("coachId1") as string;
        const coachId2 = formData.get("coachId2") as string;

        const coachIds = [coachId1, coachId2].filter(Boolean);

        const data: ClassFormData = {
            name: formData.get("name") as string,
            type: formData.get("type") as string,
            dayOfWeek: formData.get("dayOfWeek") as string,
            startTime: formData.get("startTime") as string,
            endTime: formData.get("endTime") as string,
            levelRequired: formData.get("levelRequired") as string || undefined,
            maxCapacity: parseInt(formData.get("maxCapacity") as string) || 20,
            color: selectedColor, // Use controlled color
            coachIds: coachIds.length > 0 ? coachIds : undefined,
        };

        const result = await createClass(data);
        setLoading(false);

        if (result.success) {
            toast.success("Clase creada exitosamente");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Error al crear la clase");
        }
    }

    return (
        <ResponsiveDialog
            isOpen={open}
            setIsOpen={handleOpenChange}
            title="Nueva Clase"
            description="Configura una nueva clase para el horario"
            trigger={
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Clase
                </Button>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                        id="name"
                        name="name"
                        required
                        placeholder="Ej: Muay Thai Principiantes"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Tipo *</Label>
                        <Select
                            name="type"
                            required
                            value={selectedType}
                            onValueChange={handleTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {typesLoading ? (
                                    <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
                                ) : (
                                    classTypes.map(type => (
                                        <SelectItem key={type.code} value={type.code}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Día *</Label>
                        <Select name="dayOfWeek" required defaultValue="MONDAY">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MONDAY">Lunes</SelectItem>
                                <SelectItem value="TUESDAY">Martes</SelectItem>
                                <SelectItem value="WEDNESDAY">Miércoles</SelectItem>
                                <SelectItem value="THURSDAY">Jueves</SelectItem>
                                <SelectItem value="FRIDAY">Viernes</SelectItem>
                                <SelectItem value="SATURDAY">Sábado</SelectItem>
                                <SelectItem value="SUNDAY">Domingo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Hora inicio *</Label>
                        <Input
                            id="startTime"
                            name="startTime"
                            type="time"
                            required
                            defaultValue="18:00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">Hora fin *</Label>
                        <Input
                            id="endTime"
                            name="endTime"
                            type="time"
                            required
                            defaultValue="19:30"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Entrenador Principal</Label>
                        <Select name="coachId1">
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {coaches.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Entrenador Asistente</Label>
                        <Select name="coachId2">
                            <SelectTrigger>
                                <SelectValue placeholder="Opcional..." />
                            </SelectTrigger>
                            <SelectContent>
                                {coaches.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Nivel</Label>
                        <Select name="levelRequired">
                            <SelectTrigger>
                                <SelectValue placeholder="Cualquier nivel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BEGINNER">Principiante</SelectItem>
                                <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                                <SelectItem value="ADVANCED">Avanzado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxCapacity">Capacidad</Label>
                        <Input
                            id="maxCapacity"
                            name="maxCapacity"
                            type="number"
                            defaultValue="20"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-3 flex-wrap">
                        {COLORS.map((c, i) => (
                            <label key={c.value} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="color"
                                    value={c.value}
                                    checked={selectedColor === c.value}
                                    onChange={() => setSelectedColor(c.value)}
                                    className="sr-only peer"
                                />
                                <div
                                    className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-foreground peer-checked:ring-2 peer-checked:ring-offset-2 transition-all"
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Clase
                    </Button>
                </div>
            </form>
        </ResponsiveDialog>
    );
}
