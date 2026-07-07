import { fmtNum } from "../../utils/format.js";

export default function BladeSplitCard({ split }) {
    if (!split) return null;
    return (
        <div className="bg-surface-2 rounded-lg p-4">
            <p className="text-xs font-semibold text-text mb-2">Divisão entre pás adjacentes</p>
            <div className="grid grid-cols-2 gap-3">
                {[["A", split.bladeA, split.angleA, split.massA], ["B", split.bladeB, split.angleB, split.massB]].map(
                    ([tag, blade, angle, mass]) => (
                        <div key={tag} className="border border-border rounded-lg p-3 text-center">
                            <p className="text-[11px] text-text-subtle">Pá {blade} · {fmtNum(angle, 0)}°</p>
                            <p className="text-base font-bold text-text">{fmtNum(mass)} g</p>
                        </div>
                    )
                )}
            </div>
            <p className="text-[11px] text-text-subtle mt-2">
                Fixe as duas massas nas pás indicadas — o efeito combinado equivale à massa de correção no ângulo calculado.
            </p>
        </div>
    );
}
