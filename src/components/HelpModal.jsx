import { useState } from "react";

const STEPS = [
    {
        num: "01", color: "#38bdf8", title: "Divida o rotor em 3 posições",
        body: "Marque três posições igualmente espaçadas no rotor: Posição 1 em 0°, Posição 2 em 120° e Posição 3 em 240°. Use uma referência fixa (ex.: marca de fita) para garantir a repetibilidade das medições."
    },
    {
        num: "02", color: "#e2e8f0", title: "Medição sem massa — V₀",
        body: "Com o rotor na rotação de trabalho, meça a vibração sem nenhuma massa adicional. Este é o valor V₀, a vibração original. Registre a amplitude (mm/s ou µm)."
    },
    {
        num: "03", color: "#38bdf8", title: "Medição com massa em 0° — V₁",
        body: "Fixe a massa de teste Mₜ na Posição 1 (0°) e meça a vibração. A massa deve ser conhecida e fixada sempre no mesmo raio."
    },
    {
        num: "04", color: "#4ade80", title: "Medição com massa em 120° — V₂",
        body: "Mova Mₜ para a Posição 2 (120°) e meça novamente. Garanta condições operacionais idênticas entre todas as medições."
    },
    {
        num: "05", color: "#f472b6", title: "Medição com massa em 240° — V₃",
        body: "Mova Mₜ para a Posição 3 (240°) e meça. Ao final você terá as 4 medições necessárias: V₀, V₁, V₂ e V₃."
    },
    {
        num: "06", color: "#fbbf24", title: "Insira os dados e leia o resultado",
        body: "Digite todos os valores nos campos. O diagrama polar e a massa de correção Mc serão calculados automaticamente em tempo real."
    },
];

export default function HelpModal({ onClose }) {
    const [tab, setTab] = useState("proc");

    return (
        <div onClick={onClose} className="overlay">
            <div onClick={(e) => e.stopPropagation()} className="modal">
                <div className="modal-head">
                    <div>
                        <p className="modal-eyebrow">Ajuda &amp; Documentação</p>
                        <h2 className="modal-h">Balanceamento de Três Pontos</h2>
                    </div>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="tab-bar">
                    {[
                        { id: "proc", label: "Procedimento" },
                        { id: "calc", label: "Cálculo" },
                    ].map(({ id, label }) => (
                        <button
                            key={id} onClick={() => setTab(id)}
                            className={`tab-btn ${tab === id ? "tab-btn--on" : ""}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="modal-body">
                    {tab === "proc" && (
                        <>
                            <p className="prose">
                                São necessárias <strong>4 medições de vibração</strong> e uma massa de teste
                                conhecida para determinar a massa e ângulo de correção sem instrumentação de fase.
                            </p>
                            {STEPS.map(({ num, title, color, body }) => (
                                <div key={num} className="step">
                                    <div
                                        className="step-num"
                                        style={{ color, borderColor: color + "40", background: color + "12" }}
                                    >
                                        {num}
                                    </div>
                                    <div>
                                        <p className="step-title" style={{ color }}>{title}</p>
                                        <p className="step-body">{body}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="tip">
                                <span className="tip-label">Boas práticas — </span>
                                Mantenha temperatura, carga e rotação idênticas entre medições.
                                Repita cada medição 3× e use a média para maior precisão.
                            </div>
                        </>
                    )}

                    {tab === "calc" && (
                        <>
                            <p className="prose">
                                Esta ferramenta resolve analiticamente a interseção dos três arcos,
                                encontrando o ponto P de forma exata — o equivalente matemático do método
                                gráfico com compasso.
                            </p>
                            {[
                                {
                                    color: "#a78bfa", title: "Coordenadas do ponto P",
                                    code: ["Px = (V₃² − V₂²) / (2·√3·V₀)", "Py = (V₂² + V₃² − 2·V₁²) / (6·V₀)"],
                                    note: "P₁, P₂, P₃ ficam sobre o círculo de raio V₀. Cada arco tem raio igual à vibração medida naquela posição. Os três arcos se encontram em P.",
                                },
                                {
                                    color: "#fbbf24", title: "Distância OP e ângulo",
                                    code: ["OP = √(Px² + Py²)", "θ  = atan2(Px, Py)  →  0° a 360°"],
                                    note: "O ângulo θ indica onde posicionar a massa de correção, em graus no sentido horário a partir de 0°.",
                                },
                                {
                                    color: "#4ade80", title: "Massa de correção",
                                    code: ["Mc = Mₜ × V₀ / OP"],
                                    note: "Se OP < V₀ então Mc > Mₜ. Se OP > V₀ então Mc < Mₜ. Fixe Mc no ângulo θ para corrigir o desbalanceamento.",
                                },
                            ].map(({ color, title, code, note }) => (
                                <div key={title} className="calc-card">
                                    <div className="calc-accent" style={{ background: color }} />
                                    <div>
                                        <p className="calc-title">{title}</p>
                                        <div className="code-box">
                                            {code.map((l) => (<div key={l}>{l}</div>))}
                                        </div>
                                        <p className="calc-note">{note}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="example-card">
                                <p className="ex-label">Exemplo do PDF</p>
                                <div className="ex-grid">
                                    {[["V₀", "8,00"], ["V₁", "11,05"], ["V₂", "3,82"], ["V₃", "15,09"], ["Mₜ", "4,5 g"]].map(
                                        ([k, v]) => (
                                            <div key={k} className="ex-cell">
                                                <span className="ex-k">{k}</span>
                                                <span className="ex-v">{v}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="code-box" style={{ marginTop: 10 }}>
                                    <div>OP ≈ <span style={{ color: "#fbbf24" }}>7,69</span></div>
                                    <div>θ  ≈ <span style={{ color: "#fbbf24" }}>90,3°</span></div>
                                    <div>Mc ≈ <span style={{ color: "#4ade80", fontWeight: 700 }}>4,68 g</span></div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
