import { useState, useCallback, useRef, useEffect } from "react";
import Header from "./components/Header.jsx";
import Calculator from "./components/Calculator.jsx";
import History from "./components/History.jsx";
import HelpModal from "./components/HelpModal.jsx";

const EMPTY = { Vo: "", V1: "", V2: "", V3: "", Mt: "" };

export default function App() {
    const [tab, setTab] = useState("calc");
    const [raw, setRaw] = useState(EMPTY);
    const [help, setHelp] = useState(false);
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);

    const addToast = useCallback((msg, type = "success") => {
        const id = ++toastId.current;
        setToasts((t) => [...t, { id, msg, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    }, []);

    const handleRestore = useCallback((restoredRaw) => {
        setRaw(restoredRaw);
        setTab("calc");
    }, []);

    // Force History re-mount when switching to it (to refresh data)
    const [historyKey, setHistoryKey] = useState(0);
    useEffect(() => {
        if (tab === "hist") setHistoryKey((k) => k + 1);
    }, [tab]);

    return (
        <div className="app">
            <Header onHelp={() => setHelp(true)} />

            {/* Navigation */}
            <nav className="nav-tabs">
                <button
                    className={`nav-tab ${tab === "calc" ? "nav-tab--active" : ""}`}
                    onClick={() => setTab("calc")}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="8" y1="6" x2="16" y2="6" />
                        <line x1="8" y1="10" x2="11" y2="10" />
                        <line x1="13" y1="10" x2="16" y2="10" />
                        <line x1="8" y1="14" x2="11" y2="14" />
                        <line x1="13" y1="14" x2="16" y2="14" />
                        <line x1="8" y1="18" x2="16" y2="18" />
                    </svg>
                    <span className="nav-tab-label">Calculadora</span>
                </button>
                <button
                    className={`nav-tab ${tab === "hist" ? "nav-tab--active" : ""}`}
                    onClick={() => setTab("hist")}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="nav-tab-label">Histórico</span>
                </button>
            </nav>

            {/* Pages */}
            {tab === "calc" && (
                <Calculator raw={raw} setRaw={setRaw} onToast={addToast} />
            )}
            {tab === "hist" && (
                <History key={historyKey} onRestore={handleRestore} onToast={addToast} />
            )}

            <footer className="footer">
                RBA · Mc = Mₜ × V₀ / OP · Posições: 0° · 120° · 240°
            </footer>

            {/* Help Modal */}
            {help && <HelpModal onClose={() => setHelp(false)} />}

            {/* Toasts */}
            {toasts.length > 0 && (
                <div className="toast-container">
                    {toasts.map((t) => (
                        <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
