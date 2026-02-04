import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExportOptions {
    fileName?: string;
    title?: string;
    orientation?: "portrait" | "landscape";
}

export function exportToPDF<T extends Record<string, unknown>>(
    data: T[],
    columns: { header: string; key: keyof T }[],
    options: ExportOptions = {}
) {
    const { fileName = "reporte", title = "Reporte", orientation = "portrait" } = options;

    const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
    });

    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateStr = format(new Date(), "PPpp", { locale: es });
    doc.text(`Generado: ${dateStr}`, 14, 30);

    // Prepare table data
    const tableBody = data.map((row) =>
        columns.map((col) => {
            const val = row[col.key];
            if (val instanceof Date) return format(val, "PP", { locale: es });
            if (typeof val === "boolean") return val ? "Sí" : "No";
            return String(val ?? "");
        })
    );


    const tableHead = [columns.map((col) => col.header)];

    // Generate table
    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 35,
        theme: "striped",
        headStyles: { fillColor: [0, 0, 0] }, // Black header
        styles: { fontSize: 9 },
    });

    // Save
    doc.save(`${fileName}.pdf`);
}

export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    columns: { header: string; key: keyof T }[],
    options: ExportOptions = {}
) {
    const { fileName = "reporte" } = options;

    // Map data to header keys
    const formattedData = data.map((row) => {
        const newRow: Record<string, unknown> = {};
        columns.forEach((col) => {
            const val = row[col.key];
            if (val instanceof Date) {
                newRow[col.header] = format(val, "PP", { locale: es });
            } else if (typeof val === "boolean") {
                newRow[col.header] = val ? "Sí" : "No";
            } else {
                newRow[col.header] = val;
            }
        });
        return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    // Auto-width columns (basic approximation)
    const colWidths = columns.map(col => ({ wch: Math.max(col.header.length, 15) }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
