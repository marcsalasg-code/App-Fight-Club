"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportPaymentsCSV } from "@/app/actions/export";
import { toast } from "sonner";

type Props = {
    month?: number;
    year?: number;
    className?: string;
};

export function PaymentsExportButton({ month, year, className }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleExport = () => {
        startTransition(async () => {
            try {
                const result = await exportPaymentsCSV(month, year);

                // Create blob and download
                const blob = new Blob([result.content], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = result.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast.success("CSV exportado correctamente");
            } catch (error) {
                console.error("Export error:", error);
                toast.error("Error al exportar CSV");
            }
        });
    };

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={isPending}
            className={className}
        >
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            Exportar CSV
        </Button>
    );
}
