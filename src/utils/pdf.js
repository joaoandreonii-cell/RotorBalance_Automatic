/* ─── PDF Report Generation ──────────────────────────────────────────────── */
import jsPDF from "jspdf";
import "jspdf-autotable";

export function generatePDF({ raw, result, diagramSvgElement }) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const margin = 16;
    let y = 18;

    // Header
    doc.setFillColor(10, 15, 26);
    doc.rect(0, 0, W, 42, "F");
    doc.setFontSize(9);
    doc.setTextColor(56, 189, 248);
    doc.text("MANUTENÇÃO PREDITIVA · ANÁLISE DE VIBRAÇÃO", margin, y);
    y += 8;
    doc.setFontSize(18);
    doc.setTextColor(221, 232, 244);
    doc.text("RotorBalance Automatic", margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(141, 165, 191);
    doc.text("Relatório de Balanceamento — Método de Três Pontos", margin, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(100, 120, 140);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margin, y);
    y += 14;

    // Input data table
    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248);
    doc.text("DADOS DE ENTRADA", margin, y);
    y += 3;

    doc.autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Parâmetro", "Símbolo", "Valor"]],
        body: [
            ["Vibração original", "V₀", raw.Vo || "—"],
            ["Massa em 0°", "V₁", raw.V1 || "—"],
            ["Massa em 120°", "V₂", raw.V2 || "—"],
            ["Massa em 240°", "V₃", raw.V3 || "—"],
            ["Massa de teste", "Mₜ", raw.Mt ? `${raw.Mt} g` : "—"],
        ],
        styles: { fontSize: 9, cellPadding: 3, textColor: [141, 165, 191] },
        headStyles: { fillColor: [20, 29, 46], textColor: [221, 232, 244], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [15, 21, 32] },
        bodyStyles: { fillColor: [11, 15, 26] },
    });

    y = doc.lastAutoTable.finalY + 10;

    // Results
    if (result) {
        doc.setFontSize(10);
        doc.setTextColor(74, 222, 128);
        doc.text("RESULTADO", margin, y);
        y += 3;

        doc.autoTable({
            startY: y,
            margin: { left: margin, right: margin },
            head: [["Métrica", "Valor"]],
            body: [
                ["Distância OP", result.OP.toFixed(3)],
                ["Ângulo (θ)", `${result.angle.toFixed(1)}°`],
                ["Massa de Correção (Mc)", `${result.Mc.toFixed(2)} g`],
                ["Coordenada Px", result.Px.toFixed(4)],
                ["Coordenada Py", result.Py.toFixed(4)],
            ],
            styles: { fontSize: 9, cellPadding: 3, textColor: [141, 165, 191] },
            headStyles: { fillColor: [20, 29, 46], textColor: [74, 222, 128], fontStyle: "bold" },
            alternateRowStyles: { fillColor: [15, 21, 32] },
            bodyStyles: { fillColor: [11, 15, 26] },
        });

        y = doc.lastAutoTable.finalY + 10;

        // Formula
        doc.setFontSize(9);
        doc.setTextColor(100, 120, 140);
        doc.text("Fórmula: Mc = Mₜ × V₀ / OP", margin, y);
        y += 5;
        doc.text(
            `${raw.Mt} × ${raw.Vo} / ${result.OP.toFixed(3)} = ${result.Mc.toFixed(2)} g`,
            margin,
            y
        );
        y += 5;
        doc.text(
            `Posicionar massa de ${result.Mc.toFixed(2)} g no ângulo ${result.angle.toFixed(1)}°`,
            margin,
            y
        );
        y += 10;
    }

    // Diagram as image
    if (diagramSvgElement) {
        try {
            const svgClone = diagramSvgElement.cloneNode(true);
            svgClone.setAttribute("width", "600");
            svgClone.setAttribute("height", "600");
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);

            const canvas = document.createElement("canvas");
            canvas.width = 600;
            canvas.height = 600;
            const ctx = canvas.getContext("2d");
            const img = new Image();

            return new Promise((resolve) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);
                    const imgData = canvas.toDataURL("image/png");

                    const diagSize = Math.min(W - 2 * margin, 120);
                    const availSpace = 297 - y - 20; // A4 height minus margin
                    const finalSize = Math.min(diagSize, availSpace);

                    if (finalSize > 40) {
                        doc.setFontSize(10);
                        doc.setTextColor(56, 189, 248);
                        doc.text("DIAGRAMA POLAR", margin, y);
                        y += 4;
                        doc.addImage(imgData, "PNG", margin, y, finalSize, finalSize);
                    }

                    // Footer
                    const pageH = doc.internal.pageSize.getHeight();
                    doc.setFontSize(7);
                    doc.setTextColor(80, 100, 120);
                    doc.text(
                        "RBA · RotorBalance Automatic — Método de Três Pontos · Posições: 0° · 120° · 240°",
                        W / 2,
                        pageH - 8,
                        { align: "center" }
                    );

                    doc.save(`RBA_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
                    resolve();
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    // Save without diagram on error
                    const pageH = doc.internal.pageSize.getHeight();
                    doc.setFontSize(7);
                    doc.setTextColor(80, 100, 120);
                    doc.text(
                        "RBA · RotorBalance Automatic — Método de Três Pontos · Posições: 0° · 120° · 240°",
                        W / 2,
                        pageH - 8,
                        { align: "center" }
                    );
                    doc.save(`RBA_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
                    resolve();
                };
                img.src = url;
            });
        } catch {
            // fallback: save without diagram
        }
    }

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(80, 100, 120);
    doc.text(
        "RBA · RotorBalance Automatic — Método de Três Pontos · Posições: 0° · 120° · 240°",
        W / 2,
        pageH - 8,
        { align: "center" }
    );

    doc.save(`RBA_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
}
