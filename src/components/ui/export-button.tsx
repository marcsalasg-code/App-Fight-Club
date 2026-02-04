"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/export-utils";

interface ExportButtonProps<T> {
    data: T[];
    columns: { header: string; key: keyof T }[];
    fileName: string;
    title: string;
    variant?: "default" | "outline" | "ghost" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export function ExportButton<T extends Record<string, unknown>>({
    data,
    columns,
    fileName,
    title,
    variant = "outline",
    size = "default",
    className,
}: ExportButtonProps<T>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={className}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToPDF(data, columns, { fileName, title })}>
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToExcel(data, columns, { fileName, title })}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar como Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
