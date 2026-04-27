import { useState, useEffect } from "react";
import { getSessions, deleteSession, clearAllSessions } from "../utils/storage.js";

export default function History({ onRestore, onToast }) {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        setSessions(getSessions());
    }, []);

    const handleDelete = (id) => {
        const updated = deleteSession(id);
        setSessions(updated);
        onToast("Sessão removida", "success");
    };

    const handleClearAll = () => {
        if (sessions.length === 0) return;
        clearAllSessions();
        setSessions([]);
        onToast("Histórico limpo", "success");
    };

    const handleRestore = (session) => {
        onRestore(session.raw);
        onToast("Sessão restaurada — veja a aba Calculadora", "success");
    };

    const formatDate = (iso) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString("pt-BR", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            });
        } catch {
            return iso;
        }
    };

    if (sessions.length === 0) {
        return (
            <div style={{ width: "100%", maxWidth: 960 }}>
                <div className="card history-empty">
                    <div className="history-empty-icon">📋</div>
                    <p className="history-empty-text">
                        Nenhuma sessão salva ainda.<br />
                        Use a aba <strong>Calculadora</strong>, preencha os dados e clique em <strong>Salvar</strong>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", maxWidth: 960 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.25em", color: "var(--dim)", textTransform: "uppercase" }}>
                    {sessions.length} sessão(ões) salva(s)
                </p>
                <button className="btn btn--danger" style={{ flex: "none", fontSize: 10, padding: "6px 12px" }} onClick={handleClearAll}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Limpar tudo
                </button>
            </div>

            <div className="history-list">
                {sessions.map((s) => (
                    <div key={s.id} className="history-item">
                        <div className="history-top">
                            <span className="history-name">{s.name || "Sessão sem nome"}</span>
                            <span className="history-date">{formatDate(s.timestamp)}</span>
                        </div>

                        <div className="history-metrics">
                            <div className="history-metric">
                                <span className="history-metric-label">Mc</span>
                                <span className="history-metric-value" style={{ color: "var(--green)" }}>
                                    {s.result?.Mc?.toFixed(2) ?? "—"} g
                                </span>
                            </div>
                            <div className="history-metric">
                                <span className="history-metric-label">Ângulo</span>
                                <span className="history-metric-value" style={{ color: "var(--amber)" }}>
                                    {s.result?.angle?.toFixed(1) ?? "—"}°
                                </span>
                            </div>
                            <div className="history-metric">
                                <span className="history-metric-label">V₀</span>
                                <span className="history-metric-value">
                                    {s.raw?.Vo ?? "—"}
                                </span>
                            </div>
                            <div className="history-metric">
                                <span className="history-metric-label">Mₜ</span>
                                <span className="history-metric-value">
                                    {s.raw?.Mt ?? "—"} g
                                </span>
                            </div>
                        </div>

                        <div className="history-actions">
                            <button className="btn btn--primary" onClick={() => handleRestore(s)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                                Restaurar
                            </button>
                            <button className="btn btn--danger" onClick={() => handleDelete(s.id)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
