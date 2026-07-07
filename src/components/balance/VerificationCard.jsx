import Input from "../ui/Input.jsx";
import Badge from "../ui/Badge.jsx";
import { fmtNum } from "../../utils/format.js";

export default function VerificationCard({ Vo, unit, value, onChange, reduction, status }) {
    return (
        <div className="bg-surface-2 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-text">Verificação pós-balanceamento</p>
            <Input
                label="Vibração final"
                sub="após instalar a massa de correção"
                suffix={unit}
                placeholder="0,00"
                inputMode="decimal"
                value={value.Vf}
                onChange={(e) => onChange({ Vf: e.target.value })}
            />
            {reduction !== null && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-text-muted">
                        Redução: <span className="font-bold text-text">{fmtNum(reduction, 1)}%</span>
                        <span className="text-text-subtle"> (V₀ {fmtNum(Vo)} → {value.Vf} {unit})</span>
                    </p>
                    <Badge tone={status.tone}>{status.label}</Badge>
                </div>
            )}
        </div>
    );
}
