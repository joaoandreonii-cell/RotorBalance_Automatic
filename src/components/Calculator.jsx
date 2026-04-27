import { useRef, useMemo } from "react";
import { parseVal, computeResult } from "../utils/math.js";
import { saveSession } from "../utils/storage.js";
import { generatePDF } from "../utils/pdf.js";
import Diagram from "./Diagram.jsx";

const INPUTS = [
    { key: "Vo", sym: "V₀", label: "Vibração original", sub: "sem massa de teste", color: "#e2e8f0" },
    { key: "V1", sym: "V₁", label: "Massa em 0°", sub: "vibração com teste", color: "#38bdf8" },
    { key: "V2", sym: "V₂", label: "Massa em 120°", sub: "vibração com teste", color: "#4ade80" },
    { key: "V3", sym: "V₃", label: "Massa em 240°", sub: "vibração com teste", color: "#f472b6" },
    { key: "Mt", sym: "Mₜ", label: "Massa de teste", sub: "valor em gramas", color: "#fbbf24" },
];

const LEGEND = [
    { c: "#5eead4", l: "Círculo V₀" },
    { c: "#38bdf8", l: "Arco V₁ (0°)" },
    { c: "#4ade80", l: "Arco V₂ (120°)" },
    { c: "#f472b6", l: "Arco V₃ (240°)" },
    { c: "#f59e0b", l: "Vetor OP → Mc" },
];

export default function Calculator({ raw, setRaw, onToast }) {
    const diagramRef = useRef(null);

    const pv = useMemo(() => {
        const r = {};
        for (const k in raw) r[k] = parseVal(raw[k]);
        return r;
    }, [raw]);

    const { Vo, V1, V2, V3, Mt } = pv;
    const allFilled = Vo && V1 && V2 && V3 && Mt;
    const result = useMemo(
        () => (allFilled ? computeResult(Vo, V1, V2, V3, Mt) : null),
        [Vo, V1, V2, V3, Mt]
    );

    const handleSave = () => {
        if (!result) return;
        const name = `Mc ${result.Mc.toFixed(2)}g @ ${result.angle.toFixed(1)}°`;
        saveSession({
            name,
            raw: { ...raw },
            result: {
                Mc: result.Mc,
                angle: result.angle,
                OP: result.OP,
                Px: result.Px,
                Py: result.Py,
            },
        });
        onToast("Sessão salva com sucesso!", "success");
    };

    const handlePdf = async () => {
        if (!result) return;
        try {
            const svgEl = diagramRef.current?.querySelector("svg");
            await generatePDF({ raw, result, diagramSvgElement: svgEl });
            onToast("PDF exportado!", "success");
        } catch (err) {
            console.error(err);
            onToast("Erro ao gerar PDF", "error");
        }
    };

    const handleClear = () => {
        setRaw({ Vo: "", V1: "", V2: "", V3: "", Mt: "" });
    };

    return (
        <div className="grid">
            {/* Inputs + Results (stacked on mobile) */}
            <div className="left-col">
                {/* Inputs card */}
                <div className="card">
                    <p className="card-label">Medições</p>
                    {INPUTS.map(({ key, sym, label, sub, color }) => (
                        <div key={key} className="irow">
                            <div className="ilabel">
                                <span className="isym" style={{ color }}>{sym}</span>
                                <span className="idesc">
                                    {label}<br />
                                    <span style={{ opacity: 0.6 }}>{sub}</span>
                                </span>
                            </div>
                            <input
                                className="ifield"
                                value={raw[key]}
                                onChange={(e) => setRaw((p) => ({ ...p, [key]: e.target.value }))}
                                placeholder="0.00"
                                inputMode="decimal"
                                style={{
                                    border: `1px solid ${pv[key] ? color + "30" : "var(--border)"}`,
                                    color: pv[key] ? color : "var(--dim)",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Results card */}
                <div className="card">
                    <p className="card-label">Resultado</p>
                    {!allFilled ? (
                        <p className="res-empty">
                            Preencha todos os campos para calcular a massa de correção.
                        </p>
                    ) : !result ? (
                        <p style={{ fontSize: 11, color: "var(--danger)" }}>
                            Verifique os valores inseridos.
                        </p>
                    ) : (
                        <>
                            <div className="res-grid">
                                {[
                                    ["Dist. OP", result.OP.toFixed(3), ""],
                                    ["Ângulo", result.angle.toFixed(1), "°"],
                                ].map(([l, v, u]) => (
                                    <div key={l} className="res-mini">
                                        <p className="res-mini-l">{l}</p>
                                        <p className="res-mini-v">
                                            {v}<span style={{ fontSize: 10, opacity: 0.6 }}>{u}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="res-main">
                                <p className="res-main-kicker">Massa de Correção</p>
                                <p className="res-mc">
                                    {result.Mc.toFixed(2)}<span className="res-unit">g</span>
                                </p>
                                <p className="res-angle-lbl">Posicionar em</p>
                                <p className="res-angle">{result.angle.toFixed(1)}°</p>
                                <p className="res-formula">
                                    Mc = Mₜ × V₀ / OP<br />
                                    {Mt} × {Vo} / {result.OP.toFixed(3)} = {result.Mc.toFixed(2)} g
                                </p>
                            </div>
                        </>
                    )}

                    {/* Action buttons */}
                    <div className="actions">
                        <button className="btn btn--green" onClick={handleSave} disabled={!result}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Salvar
                        </button>
                        <button className="btn btn--primary" onClick={handlePdf} disabled={!result}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            PDF
                        </button>
                        <button className="btn" onClick={handleClear}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1 4 1 10 7 10" />
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            {/* Diagram */}
            <div className="diag-card" ref={diagramRef}>
                <p className="card-label">Diagrama Polar</p>
                <Diagram pv={pv} result={result} />
                <div className="legend">
                    {LEGEND.map(({ c, l }) => (
                        <div key={l} className="leg-i">
                            <div className="leg-line" style={{ background: c }} />
                            <span className="leg-lbl">{l}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
