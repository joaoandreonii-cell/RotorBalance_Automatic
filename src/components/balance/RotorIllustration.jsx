import { useTheme } from "../../theme/ThemeContext.jsx";
import { PALETTES } from "./diagramPalettes.js";
import { toRad } from "../../utils/math.js";

const POS = [
    { n: 1, angle: 0 },
    { n: 2, angle: 120 },
    { n: 3, angle: 240 },
];

export default function RotorIllustration({ highlight = null }) {
    const { resolved } = useTheme();
    const P = PALETTES[resolved];
    const C = 90, R = 62;
    return (
        <svg viewBox="0 0 180 180" className="w-40 mx-auto block" aria-hidden="true">
            <circle cx={C} cy={C} r={R + 12} fill={P.face} stroke={P.grid} strokeWidth={1.5} />
            <circle cx={C} cy={C} r={R} fill="none" stroke={P.gridSoft} strokeWidth={1} strokeDasharray="4 3" />
            <circle cx={C} cy={C} r={14} fill={P.gridSoft} stroke={P.grid} strokeWidth={1.5} />
            <circle cx={C} cy={C} r={4} fill={P.label} />
            {POS.map(({ n, angle }) => {
                const x = C + R * Math.sin(toRad(angle));
                const y = C - R * Math.cos(toRad(angle));
                const active = highlight === n;
                const color = [P.v1, P.v2, P.v3][n - 1];
                return (
                    <g key={n}>
                        <line x1={C} y1={C} x2={x} y2={y} stroke={P.gridSoft} strokeWidth={1} />
                        <circle cx={x} cy={y} r={active ? 13 : 10} fill={active ? color : P.face} stroke={color} strokeWidth={2} />
                        <text x={x} y={y + 3.5} textAnchor="middle" fontSize={10} fontWeight={700}
                            fill={active ? "#ffffff" : color} fontFamily="monospace">
                            {n}
                        </text>
                        {active && (
                            <g>
                                <rect x={x - 13} y={y - 30} width={26} height={13} rx={6.5} fill={P.op} />
                                <text x={x} y={y - 20.5} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#fff">
                                    Mₜ
                                </text>
                            </g>
                        )}
                        <text x={C + (R + 22) * Math.sin(toRad(angle))} y={C - (R + 22) * Math.cos(toRad(angle)) + 3}
                            textAnchor="middle" fontSize={8} fill={P.label} fontFamily="monospace">
                            {angle}°
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
