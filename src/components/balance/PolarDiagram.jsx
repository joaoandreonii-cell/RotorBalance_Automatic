import { useMemo } from "react";
import { toRad, niceTick } from "../../utils/math.js";
import { useTheme } from "../../theme/ThemeContext.jsx";
import { PALETTES } from "./diagramPalettes.js";

const VBOX = 400;
const C = VBOX / 2;

function mToS(mx, my, s) {
    return [C + mx * s, C - my * s];
}

export default function PolarDiagram({ pv, result, blades = null, bladeOffset = 0, palette = null }) {
    const themeCtx = useTheme();
    const P = PALETTES[palette ?? themeCtx?.resolved ?? "dark"];
    const { Vo, V1, V2, V3 } = pv;
    const ARC_C = [P.v1, P.v2, P.v3];

    const scale = useMemo(() => {
        if (!Vo) return null;
        const ext = Math.max(V1 || 0, V2 || 0, V3 || 0, Vo * 0.6);
        return ((VBOX / 2) * 0.76) / (Vo + ext);
    }, [Vo, V1, V2, V3]);

    const pts = useMemo(() => {
        if (!Vo || !scale) return null;
        return [
            mToS(0, Vo, scale),
            mToS(Vo * Math.sin(toRad(120)), Vo * Math.cos(toRad(120)), scale),
            mToS(Vo * Math.sin(toRad(240)), Vo * Math.cos(toRad(240)), scale),
        ];
    }, [Vo, scale]);

    const pPt = useMemo(
        () => (!result || !scale ? null : mToS(result.Px, result.Py, scale)),
        [result, scale]
    );

    const rings = useMemo(() => {
        if (!Vo || !scale) return [];
        const step = niceTick(Vo);
        const ext = Vo + Math.max(V1 || 0, V2 || 0, V3 || 0, Vo * 0.6);
        const r = [];
        for (let v = step; v <= ext * 1.1; v += step)
            r.push({ v, sr: v * scale, major: v % (step * 2) === 0 });
        return r;
    }, [Vo, V1, V2, V3, scale]);

    const aaPath = useMemo(() => {
        if (!result || !scale || !Vo) return null;
        const ar = Vo * scale * 0.32;
        const a = result.angle;
        return `M ${C} ${C - ar} A ${ar} ${ar} 0 ${a > 180 ? 1 : 0} 1 ${C + ar * Math.sin(toRad(a))} ${C - ar * Math.cos(toRad(a))}`;
    }, [result, scale, Vo]);

    const bladeMarks = useMemo(() => {
        if (!blades || blades < 3) return [];
        const rOut = (VBOX / 2) * 0.86;
        return Array.from({ length: blades }, (_, i) => {
            const a = toRad(bladeOffset + (i * 360) / blades);
            return {
                x1: C + rOut * 0.94 * Math.sin(a), y1: C - rOut * 0.94 * Math.cos(a),
                x2: C + rOut * Math.sin(a), y2: C - rOut * Math.cos(a),
            };
        });
    }, [blades, bladeOffset]);

    return (
        <svg viewBox={`0 0 ${VBOX} ${VBOX}`} style={{ display: "block", width: "100%", height: "auto" }} aria-label="Diagrama polar">
            <rect width={VBOX} height={VBOX} fill={P.face} rx={12} />

            {/* Anéis de grade */}
            {rings.map(({ v, sr, major }, i) => (
                <g key={i}>
                    <circle cx={C} cy={C} r={sr} fill="none" stroke={major ? P.grid : P.gridSoft} strokeWidth={major ? 0.8 : 0.5} />
                    {major && Vo && (
                        <text x={C + 4} y={C - sr - 3} fill={P.label} fontSize="6.5" fontFamily="monospace">
                            {v.toFixed(v < 1 ? 2 : v < 10 ? 1 : 0)}
                        </text>
                    )}
                </g>
            ))}

            {/* Raios */}
            {Array.from({ length: 12 }, (_, i) => {
                const a = i * 30;
                const r = (VBOX / 2) * 0.86;
                return (
                    <line key={a} x1={C} y1={C}
                        x2={C + r * Math.sin(toRad(a))} y2={C - r * Math.cos(toRad(a))}
                        stroke={a % 90 === 0 ? P.grid : P.gridSoft} strokeWidth={a % 90 === 0 ? 0.8 : 0.5} />
                );
            })}

            {/* Rótulos de ângulo */}
            {Array.from({ length: 12 }, (_, i) => {
                const a = i * 30;
                const lr = (VBOX / 2) * 0.93;
                const key = a % 120 === 0;
                return (
                    <text key={a} x={C + lr * Math.sin(toRad(a))} y={C - lr * Math.cos(toRad(a))}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={key ? P.text : P.label} fontSize={key ? 9 : 7}
                        fontFamily="monospace" fontWeight={key ? 600 : 400}>
                        {a}°
                    </text>
                );
            })}

            {/* Marcadores de pás */}
            {bladeMarks.map((m, i) => (
                <line key={i} {...m} stroke={P.op} strokeWidth={2} opacity={0.55} strokeLinecap="round" />
            ))}

            {/* Círculo V0 */}
            {Vo && scale && (
                <>
                    <circle cx={C} cy={C} r={Vo * scale} fill="none" stroke={P.vo} strokeOpacity={0.15} strokeWidth={8} />
                    <circle cx={C} cy={C} r={Vo * scale} fill="none" stroke={P.vo} strokeWidth={1.8} />
                </>
            )}

            {/* Arcos V1 V2 V3 */}
            {pts && [{ v: V1, i: 0 }, { v: V2, i: 1 }, { v: V3, i: 2 }].map(({ v, i }) =>
                v && scale ? (
                    <g key={i}>
                        <circle cx={pts[i][0]} cy={pts[i][1]} r={v * scale} fill="none" stroke={ARC_C[i]} strokeOpacity={0.12} strokeWidth={4} />
                        <circle cx={pts[i][0]} cy={pts[i][1]} r={v * scale} fill="none" stroke={ARC_C[i]} strokeWidth={1.2} strokeDasharray="6 3.5" opacity={0.85} />
                    </g>
                ) : null
            )}

            {/* Arco do ângulo + vetor OP */}
            {aaPath && (
                <>
                    <path d={aaPath} fill="none" stroke={P.op} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
                    <path d={aaPath} fill="none" stroke={P.op} strokeWidth={1.5} strokeLinecap="round" />
                    <line x1={C} y1={C} x2={C} y2={C - Vo * scale * 0.32} stroke={P.op} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="3 3" />
                </>
            )}
            {pPt && (
                <>
                    <line x1={C} y1={C} x2={pPt[0]} y2={pPt[1]} stroke={P.op} strokeOpacity={0.25} strokeWidth={6} />
                    <line x1={C} y1={C} x2={pPt[0]} y2={pPt[1]} stroke={P.op} strokeWidth={2} strokeLinecap="round" />
                </>
            )}

            {/* Pontos 1/2/3 */}
            {pts && pts.map(([x, y], i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r={10} fill={ARC_C[i]} fillOpacity={0.12} />
                    <circle cx={x} cy={y} r={4} fill={ARC_C[i]} />
                    <text x={x + (i === 2 ? -13 : 13)} y={y + (i === 0 ? -13 : 5)}
                        fill={ARC_C[i]} fontSize={9} fontFamily="monospace" fontWeight={600}
                        textAnchor={i === 2 ? "end" : "start"}>
                        {["1·0°", "2·120°", "3·240°"][i]}
                    </text>
                </g>
            ))}

            {/* Origem e ponto P */}
            <circle cx={C} cy={C} r={5} fill={P.face} stroke={P.label} strokeWidth={1.5} />
            <circle cx={C} cy={C} r={2} fill={P.label} />
            {pPt && (
                <>
                    <circle cx={pPt[0]} cy={pPt[1]} r={12} fill={P.op} fillOpacity={0.12} />
                    <circle cx={pPt[0]} cy={pPt[1]} r={5} fill={P.op} />
                    <line x1={pPt[0] - 8} y1={pPt[1]} x2={pPt[0] + 8} y2={pPt[1]} stroke={P.op} strokeWidth={1.5} opacity={0.7} />
                    <line x1={pPt[0]} y1={pPt[1] - 8} x2={pPt[0]} y2={pPt[1] + 8} stroke={P.op} strokeWidth={1.5} opacity={0.7} />
                    <text x={pPt[0] + 11} y={pPt[1] - 9} fill={P.op} fontSize={10} fontFamily="monospace" fontWeight={700}>P</text>
                </>
            )}

            {!Vo && (
                <text x={C} y={C} textAnchor="middle" dominantBaseline="middle" fill={P.label} fontSize={11} fontFamily="monospace">
                    Insira os valores para visualizar
                </text>
            )}
        </svg>
    );
}
