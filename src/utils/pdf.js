/* ─── Relatório PDF profissional (paleta clara fixa) ─────────────────────── */
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fmtNum, fmtDateTime } from "./format.js";
import { svgElementToPngDataUrl } from "./svg.js";

const C = {
    text: [26, 29, 38],
    muted: [91, 98, 112],
    subtle: [138, 144, 156],
    primary: [37, 99, 235],
    primarySoft: [239, 246, 255],
    border: [226, 229, 234],
    stripe: [246, 247, 249],
    ok: [22, 163, 74],
    warn: [217, 119, 6],
    critical: [220, 38, 38],
};

const STATUS = {
    excellent: { label: "Excelente", color: C.ok },
    good: { label: "Bom", color: C.ok },
    acceptable: { label: "Aceitável", color: C.warn },
    redo: { label: "Refazer", color: C.critical },
};

const TABLE = {
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.6, textColor: C.text, lineColor: C.border, lineWidth: 0.15 },
    headStyles: { fillColor: C.primarySoft, textColor: C.primary, fontStyle: "bold" },
    alternateRowStyles: { fillColor: C.stripe },
};

const dash = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

function sectionTitle(doc, label, margin, y) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.primary);
    doc.text(label.toUpperCase(), margin, y);
    return y + 3;
}

export async function generatePdfReport({ session, settings, diagramSvgElement }) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 16;
    let y = 18;

    const { client = {}, machine = {}, measurements: me = {}, result, bladeSplit, verification, report, notes } = session;
    const unit = me.unit ?? "mm/s";

    /* Cabeçalho */
    let xText = M;
    if (settings.logo) {
        try {
            const fmt = settings.logo.startsWith("data:image/png") ? "PNG" : "JPEG";
            doc.addImage(settings.logo, fmt, M, y - 4, 22, 22, undefined, "FAST");
            xText = M + 28;
        } catch { /* logo inválida — segue sem */ }
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...C.text);
    doc.text(settings.company || "RotorBalance Automatic", xText, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C.muted);
    doc.text("Relatório de Balanceamento — Método dos Três Pontos", xText, y + 8);
    if (report?.number) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...C.primary);
        doc.text(report.number, W - M, y + 2, { align: "right" });
        doc.setFont("helvetica", "normal");
    }
    doc.setFontSize(8.5);
    doc.setTextColor(...C.subtle);
    doc.text(fmtDateTime(session.updatedAt ?? new Date().toISOString()), W - M, y + 8, { align: "right" });
    y += 16;
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 8;

    /* Identificação */
    y = sectionTitle(doc, "Identificação", M, y);
    doc.autoTable({
        ...TABLE,
        startY: y,
        margin: { left: M, right: M },
        head: [["Cliente", "Contato", "Técnico responsável"]],
        body: [[dash(client.name), dash(client.contact), dash(session.technician || settings.technician)]],
    });
    y = doc.lastAutoTable.finalY + 2;
    doc.autoTable({
        ...TABLE,
        startY: y,
        margin: { left: M, right: M },
        head: [["TAG", "Equipamento", "Local", "Rotação", "Raio fixação", "Nº de pás"]],
        body: [[
            dash(machine.tag), dash(machine.name), dash(machine.location),
            machine.rpm ? `${machine.rpm} RPM` : "—",
            machine.radius ? `${fmtNum(machine.radius, 0)} mm` : "—",
            dash(machine.blades),
        ]],
    });
    y = doc.lastAutoTable.finalY + 7;

    /* Medições */
    y = sectionTitle(doc, "Medições", M, y);
    doc.autoTable({
        ...TABLE,
        startY: y,
        margin: { left: M, right: M },
        head: [["Rodada", "Condição", "Símbolo", "Valor"]],
        body: [
            ["1ª", "Sem massa de teste", "V0", `${fmtNum(me.Vo)} ${unit}`],
            ["2ª", "Massa de teste na posição 1 (0°)", "V1", `${fmtNum(me.V1)} ${unit}`],
            ["3ª", "Massa de teste na posição 2 (120°)", "V2", `${fmtNum(me.V2)} ${unit}`],
            ["4ª", "Massa de teste na posição 3 (240°)", "V3", `${fmtNum(me.V3)} ${unit}`],
            ["—", "Massa de teste utilizada", "Mt", `${fmtNum(me.Mt)} g`],
        ],
    });
    y = doc.lastAutoTable.finalY + 7;

    /* Resultado (destaque) */
    if (result) {
        y = sectionTitle(doc, "Resultado", M, y);
        doc.setFillColor(...C.primarySoft);
        doc.setDrawColor(...C.primary);
        doc.setLineWidth(0.2);
        doc.roundedRect(M, y, W - 2 * M, 20, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(...C.text);
        doc.text(`Massa de correção: ${fmtNum(result.Mc)} g  @  ${fmtNum(result.angle, 1)}°`, W / 2, y + 9, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...C.muted);
        doc.text(
            `OP = ${fmtNum(result.OP, 3)} · Px = ${fmtNum(result.Px, 4)} · Py = ${fmtNum(result.Py, 4)}`,
            W / 2, y + 15.5, { align: "center" }
        );
        y += 27;

        if (bladeSplit) {
            doc.autoTable({
                ...TABLE,
                startY: y,
                margin: { left: M, right: M },
                head: [["Divisão entre pás", "Pá", "Ângulo", "Massa"]],
                body: [
                    ["Massa A", `Pá ${bladeSplit.bladeA}`, `${fmtNum(bladeSplit.angleA, 0)}°`, `${fmtNum(bladeSplit.massA)} g`],
                    ["Massa B", `Pá ${bladeSplit.bladeB}`, `${fmtNum(bladeSplit.angleB, 0)}°`, `${fmtNum(bladeSplit.massB)} g`],
                ],
            });
            y = doc.lastAutoTable.finalY + 7;
        }
    }

    /* Verificação pós-balanceamento */
    if (verification && result) {
        y = sectionTitle(doc, "Verificação pós-balanceamento", M, y);
        const st = STATUS[verification.status] ?? STATUS.redo;
        doc.autoTable({
            ...TABLE,
            startY: y,
            margin: { left: M, right: M },
            head: [["Vibração original", "Vibração final", "Redução", "Status"]],
            body: [[
                `${fmtNum(me.Vo)} ${unit}`,
                `${fmtNum(verification.Vf)} ${unit}`,
                `${fmtNum(verification.reduction, 1)}%`,
                st.label,
            ]],
            didParseCell(data) {
                if (data.section === "body" && data.column.index === 3) {
                    data.cell.styles.textColor = st.color;
                    data.cell.styles.fontStyle = "bold";
                }
            },
        });
        y = doc.lastAutoTable.finalY + 7;
    }

    /* Memória de cálculo */
    if (result) {
        if (y > H - 70) { doc.addPage(); y = 18; }
        y = sectionTitle(doc, "Memória de cálculo", M, y);
        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...C.muted);
        // Apenas caracteres WinAnsi (fontes padrão do jsPDF): sem −, √, θ, subscritos
        const lines = [
            `Px = (V3² - V2²) / (2·sqrt(3)·V0) = (${fmtNum(me.V3)}² - ${fmtNum(me.V2)}²) / (2·sqrt(3)·${fmtNum(me.Vo)}) = ${fmtNum(result.Px, 4)}`,
            `Py = (V2² + V3² - 2·V1²) / (6·V0) = (${fmtNum(me.V2)}² + ${fmtNum(me.V3)}² - 2·${fmtNum(me.V1)}²) / (6·${fmtNum(me.Vo)}) = ${fmtNum(result.Py, 4)}`,
            `OP = sqrt(Px² + Py²) = ${fmtNum(result.OP, 4)}`,
            `Ângulo = atan2(Px, Py) = ${fmtNum(result.angle, 2)}°`,
            `Mc = Mt × V0 / OP = ${fmtNum(me.Mt)} × ${fmtNum(me.Vo)} / ${fmtNum(result.OP, 4)} = ${fmtNum(result.Mc)} g`,
        ];
        lines.forEach((l) => { doc.text(l, M, y + 4); y += 4.5; });
        doc.setFont("helvetica", "normal");
        y += 6;
    }

    /* Diagrama polar */
    if (diagramSvgElement) {
        try {
            const png = await svgElementToPngDataUrl(diagramSvgElement, 900);
            const size = 105;
            if (y + size > H - 45) { doc.addPage(); y = 18; }
            y = sectionTitle(doc, "Diagrama polar", M, y);
            doc.addImage(png, "PNG", (W - size) / 2, y + 1, size, size);
            y += size + 8;
        } catch { /* segue sem diagrama */ }
    }

    /* Notas */
    if (notes) {
        if (y > H - 55) { doc.addPage(); y = 18; }
        y = sectionTitle(doc, "Notas", M, y);
        doc.setFontSize(9);
        doc.setTextColor(...C.muted);
        const split = doc.splitTextToSize(notes, W - 2 * M);
        doc.text(split, M, y + 4);
        y += split.length * 4.5 + 8;
    }

    /* Assinatura */
    if (y > H - 45) { doc.addPage(); y = 18; }
    y = Math.max(y + 10, H - 42);
    doc.setDrawColor(...C.subtle);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - 40, y, W / 2 + 40, y);
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    doc.text(session.technician || settings.technician || "Técnico responsável", W / 2, y + 5, { align: "center" });
    doc.setFontSize(7.5);
    doc.setTextColor(...C.subtle);
    doc.text("Técnico responsável", W / 2, y + 9.5, { align: "center" });

    /* Rodapé em todas as páginas */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.2);
        doc.line(M, H - 12, W - M, H - 12);
        doc.setFontSize(7);
        doc.setTextColor(...C.subtle);
        doc.text("Gerado por RotorBalance Automatic v2.0 — Método dos Três Pontos (0° · 120° · 240°)", M, H - 8);
        doc.text(`Página ${i} de ${pages}`, W - M, H - 8, { align: "right" });
    }

    const safe = (s) => String(s || "").replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "");
    const name = [report?.number, safe(machine.tag)].filter(Boolean).join("_") || `RBA_${new Date().toISOString().slice(0, 10)}`;
    doc.save(`${name}.pdf`);
}
