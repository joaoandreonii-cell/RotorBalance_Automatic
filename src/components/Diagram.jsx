import { useMemo } from "react";
import { toRad, niceTick } from "../utils/math.js";

const VBOX = 400;
const C = VBOX / 2;
const ARC_C = ["#38bdf8", "#4ade80", "#f472b6"];

function mToS(mx, my, s) {
    return [C + mx * s, C - my * s];
}

export default function Diagram({ pv, result }) {
    const { Vo, V1, V2, V3 } = pv;

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
        return `M ${C + ar * Math.sin(0)} ${C - ar * Math.cos(0)} A ${ar} ${ar} 0 ${a > 180 ? 1 : 0} 1 ${C + ar * Math.sin(toRad(a))} ${C - ar * Math.cos(toRad(a))}`;
    }, [result, scale, Vo]);

    return (
        <svg
            viewBox={`0 0 ${VBOX} ${VBOX}`}
            className="diagram-svg"
            style={{ display: "block", width: "100%", height: "auto" }}
            aria-label="Diagrama polar"
        >
            <defs>
                <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0d1520" />
                    <stop offset="100%" stopColor="#060911" />
                </radialGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="glowSm" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background */}
            <rect width={VBOX} height={VBOX} fill="url(#bgGrad)" rx={10} />
            <radialGradient id="vig" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
            </radialGradient>
            <rect width={VBOX} height={VBOX} fill="url(#vig)" rx={10} />

            {/* Grid rings */}
            {rings.map(({ v, sr, major }, i) => (
                <g key={i}>
                    <circle
                        cx={C} cy={C} r={sr} fill="none"
                        stroke={major ? "#1e2d40" : "#131e2c"}
                        strokeWidth={major ? 0.8 : 0.5}
                    />
                    {major && Vo && (
                        <text x={C + 4} y={C - sr - 3} fill="#253346" fontSize="6.5" fontFamily="monospace">
                            {v.toFixed(v < 1 ? 2 : v < 10 ? 1 : 0)}
                        </text>
                    )}
                </g>
            ))}

            {/* Radial spokes */}
            {Array.from({ length: 12 }, (_, i) => {
                const a = i * 30;
                const r = (VBOX / 2) * 0.86;
                return (
                    <line key={a} x1={C} y1={C}
                        x2={C + r * Math.sin(toRad(a))} y2={C - r * Math.cos(toRad(a))}
                        stroke={a % 90 === 0 ? "#1e2d40" : "#131e2c"}
                        strokeWidth={a % 90 === 0 ? 0.8 : 0.5}
                    />
                );
            })}

            {/* Angle labels */}
            {Array.from({ length: 12 }, (_, i) => {
                const a = i * 30;
                const lr = (VBOX / 2) * 0.92;
                const key = a % 120 === 0;
                return (
                    <text key={a}
                        x={C + lr * Math.sin(toRad(a))} y={C - lr * Math.cos(toRad(a))}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={key ? "#2e4a66" : "#1a2b3c"}
                        fontSize={key ? 9 : 7}
                        fontFamily="monospace" fontWeight={key ? 600 : 400}
                    >
                        {a}°
                    </text>
                );
            })}

            {/* Vo circle */}
            {Vo && scale && (
                <>
                    <circle cx={C} cy={C} r={Vo * scale} fill="none" stroke="#38bdf820" strokeWidth={8} />
                    <circle cx={C} cy={C} r={Vo * scale} fill="none" stroke="#38bdf840" strokeWidth={2.5} />
                    <circle cx={C} cy={C} r={Vo * scale} fill="none" stroke="#5eead480" strokeWidth={1} filter="url(#glowSm)" />
                </>
            )}

            {/* V1 V2 V3 arcs */}
            {pts &&
                [
                    { v: V1, i: 0 },
                    { v: V2, i: 1 },
                    { v: V3, i: 2 },
                ].map(({ v, i }) =>
                    v && scale ? (
                        <g key={i}>
                            <circle cx={pts[i][0]} cy={pts[i][1]} r={v * scale}
                                fill="none" stroke={ARC_C[i] + "20"} strokeWidth={4} />
                            <circle cx={pts[i][0]} cy={pts[i][1]} r={v * scale}
                                fill="none" stroke={ARC_C[i]} strokeWidth={1.2}
                                strokeDasharray="6 3.5" opacity={0.75} />
                        </g>
                    ) : null
                )}

            {/* Angle arc */}
            {aaPath && (
                <>
                    <path d={aaPath} fill="none" stroke="#fbbf2460" strokeWidth={8} strokeLinecap="round" />
                    <path d={aaPath} fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeLinecap="round" />
                    <line x1={C} y1={C} x2={C} y2={C - Vo * scale * 0.32}
                        stroke="#fbbf2450" strokeWidth={1} strokeDasharray="3 3" />
                </>
            )}

            {/* O→P vector */}
            {pPt && (
                <>
                    <line x1={C} y1={C} x2={pPt[0]} y2={pPt[1]}
                        stroke="#f59e0b40" strokeWidth={6} />
                    <line x1={C} y1={C} x2={pPt[0]} y2={pPt[1]}
                        stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" />
                </>
            )}

            {/* Position points */}
            {pts &&
                pts.map(([x, y], i) => (
                    <g key={i}>
                        <circle cx={x} cy={y} r={11} fill={ARC_C[i] + "18"} />
                        <circle cx={x} cy={y} r={6} fill={ARC_C[i] + "30"} filter="url(#glowSm)" />
                        <circle cx={x} cy={y} r={4} fill={ARC_C[i]} opacity={0.95} />
                        <text
                            x={x + (i === 2 ? -13 : 13)} y={y + (i === 0 ? -13 : 5)}
                            fill={ARC_C[i]} fontSize={9} fontFamily="monospace" fontWeight={600}
                            textAnchor={i === 2 ? "end" : "start"} opacity={0.9}
                        >
                            {["1·0°", "2·120°", "3·240°"][i]}
                        </text>
                    </g>
                ))}

            {/* Origin */}
            <circle cx={C} cy={C} r={5} fill="#0d1520" stroke="#38bdf450" strokeWidth={1.5} />
            <circle cx={C} cy={C} r={2} fill="#4b6a8a" />

            {/* Point P */}
            {pPt && (
                <>
                    <circle cx={pPt[0]} cy={pPt[1]} r={16} fill="#f59e0b08" />
                    <circle cx={pPt[0]} cy={pPt[1]} r={9} fill="#f59e0b18" filter="url(#glow)" />
                    <circle cx={pPt[0]} cy={pPt[1]} r={5} fill="#f59e0b" filter="url(#glowSm)" />
                    <line x1={pPt[0] - 8} y1={pPt[1]} x2={pPt[0] + 8} y2={pPt[1]}
                        stroke="#f59e0b90" strokeWidth={1.5} />
                    <line x1={pPt[0]} y1={pPt[1] - 8} x2={pPt[0]} y2={pPt[1] + 8}
                        stroke="#f59e0b90" strokeWidth={1.5} />
                    <text x={pPt[0] + 11} y={pPt[1] - 9} fill="#f59e0b" fontSize={10}
                        fontFamily="monospace" fontWeight={700} filter="url(#glowSm)">P</text>
                </>
            )}

            {!Vo && (
                <text x={C} y={C} textAnchor="middle" dominantBaseline="middle"
                    fill="#1e3048" fontSize={12} fontFamily="monospace">
                    Insira os valores para visualizar
                </text>
            )}
        </svg>
    );
}
