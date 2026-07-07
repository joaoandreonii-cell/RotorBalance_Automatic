import { fmtNum } from "../../utils/format.js";

export default function ResultPanel({ result, meas }) {
    if (!result) {
        return (
            <p className="text-sm text-text-muted">
                Preencha as quatro medições e a massa de teste para calcular a massa de correção.
            </p>
        );
    }
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-[11px] text-text-subtle">Distância OP</p>
                    <p className="text-lg font-bold text-text">{fmtNum(result.OP, 3)}</p>
                </div>
                <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-[11px] text-text-subtle">Ângulo</p>
                    <p className="text-lg font-bold text-text">{fmtNum(result.angle, 1)}°</p>
                </div>
            </div>
            <div className="bg-primary-soft border border-primary/25 rounded-xl p-5 text-center">
                <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">Massa de correção</p>
                <p className="text-4xl font-bold text-text mt-1">
                    {fmtNum(result.Mc)} <span className="text-lg text-text-muted">g</span>
                </p>
                <p className="text-sm text-text-muted mt-1">
                    posicionar em <span className="font-semibold text-primary">{fmtNum(result.angle, 1)}°</span>
                </p>
            </div>
            <p className="text-[11px] text-text-subtle font-mono leading-relaxed">
                Mc = Mₜ × V₀ / OP = {meas.Mt} × {meas.Vo} / {fmtNum(result.OP, 3)} = {fmtNum(result.Mc)} g
            </p>
        </div>
    );
}
