import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import { useTheme } from "../../theme/ThemeContext.jsx";
import { PALETTES } from "./diagramPalettes.js";

export const UNITS = ["mm/s", "µm", "in/s", "g"].map((u) => ({ value: u, label: u }));

const FIELDS = [
    { key: "Vo", sym: "V₀", label: "Vibração original", sub: "sem massa de teste", pk: "vo" },
    { key: "V1", sym: "V₁", label: "Massa em 0°", sub: "posição 1", pk: "v1" },
    { key: "V2", sym: "V₂", label: "Massa em 120°", sub: "posição 2", pk: "v2" },
    { key: "V3", sym: "V₃", label: "Massa em 240°", sub: "posição 3", pk: "v3" },
];

export default function MeasurementsForm({ value, onChange, pv }) {
    const { resolved } = useTheme();
    const P = PALETTES[resolved];
    return (
        <div className="space-y-3">
            <Select
                label="Unidade de vibração"
                options={UNITS}
                value={value.unit}
                onChange={(e) => onChange({ unit: e.target.value })}
            />
            {FIELDS.map(({ key, sym, label, sub, pk }) => (
                <div key={key} className="flex items-center gap-3">
                    <span
                        className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ color: P[pk] }}
                    >
                        {sym}
                    </span>
                    <Input
                        className="flex-1"
                        label={label}
                        sub={sub}
                        suffix={value.unit}
                        placeholder="0,00"
                        inputMode="decimal"
                        value={value[key]}
                        error={value[key] && pv[key] === null ? "Valor inválido" : undefined}
                        onChange={(e) => onChange({ [key]: e.target.value })}
                    />
                </div>
            ))}
            <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-xs font-bold shrink-0 text-warn">
                    Mₜ
                </span>
                <Input
                    className="flex-1"
                    label="Massa de teste"
                    sub="gramas"
                    suffix="g"
                    placeholder="0,00"
                    inputMode="decimal"
                    value={value.Mt}
                    error={value.Mt && pv.Mt === null ? "Valor inválido" : undefined}
                    onChange={(e) => onChange({ Mt: e.target.value })}
                />
            </div>
        </div>
    );
}
