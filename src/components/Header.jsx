import ThemeToggle from "./ThemeToggle.jsx";

export default function Header({ onHelp }) {
    return (
        <header className="hdr">
            <p className="hdr-eyebrow">Manutenção Preditiva · Análise de Vibração</p>
            <h1 className="hdr-title">RotorBalance Automatic</h1>
            <p className="hdr-sub">Método Gráfico-Analítico · Três Pontos</p>
            <div className="hdr-actions">
                <ThemeToggle />
                <button className="icon-btn" onClick={onHelp} title="Tutorial e documentação">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
