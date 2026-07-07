import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderOpen, Copy, FileDown, Trash2, History as HistoryIcon, Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Input from "../components/ui/Input.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import PolarDiagram from "../components/balance/PolarDiagram.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { repository } from "../data/repository.js";
import { generatePdfReport } from "../utils/pdf.js";
import { fmtNum, fmtDateTime } from "../utils/format.js";

const STATUS = {
    excellent: { label: "Excelente", tone: "ok" },
    good: { label: "Bom", tone: "ok" },
    acceptable: { label: "Aceitável", tone: "warn" },
    redo: { label: "Refazer", tone: "critical" },
};

export default function HistoryPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [sessions, setSessions] = useState(() => repository.sessions.list());
    const [q, setQ] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [confirm, setConfirm] = useState(null);
    const [pdfSession, setPdfSession] = useState(null);

    const refresh = () => setSessions(repository.sessions.list());

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return sessions.filter((s) => {
            if (needle) {
                const hay = [s.client?.name, s.machine?.tag, s.machine?.name, s.machine?.location, s.notes]
                    .filter(Boolean).join(" ").toLowerCase();
                if (!hay.includes(needle)) return false;
            }
            const d = s.createdAt?.slice(0, 10);
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
        });
    }, [sessions, q, from, to]);

    // Re-exportação de PDF: renderiza o diagrama oculto e gera após o paint
    useEffect(() => {
        if (!pdfSession) return;
        const t = setTimeout(async () => {
            try {
                let session = pdfSession;
                if (!session.report?.number) {
                    session = repository.sessions.save({ ...session, report: { number: repository.nextReportNumber() } });
                    refresh();
                }
                const svgEl = document.getElementById("history-print-diagram")?.querySelector("svg");
                await generatePdfReport({ session, settings: repository.settings.get(), diagramSvgElement: svgEl });
                toast("PDF exportado!");
            } catch (err) {
                console.error(err);
                toast("Erro ao gerar PDF", "error");
            } finally {
                setPdfSession(null);
            }
        }, 60);
        return () => clearTimeout(t);
    }, [pdfSession]);

    const handleDelete = (id) => {
        repository.sessions.remove(id);
        refresh();
        toast("Sessão excluída.");
    };

    return (
        <>
            <PageHeader
                title="Histórico"
                subtitle={`${sessions.length} sessão(ões) salva(s)`}
                actions={
                    <Button variant="primary" icon={Plus} onClick={() => navigate("/balanceamento")}>
                        Novo balanceamento
                    </Button>
                }
            />

            <Card className="mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
                    <label className="block">
                        <span className="block text-xs font-medium text-text-muted mb-1.5">Buscar</span>
                        <span className="relative block">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                            <input
                                className="w-full h-10 rounded-lg bg-surface-2 border border-border pl-9 pr-3 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:border-primary"
                                placeholder="Cliente, TAG, equipamento…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </span>
                    </label>
                    <Input label="De" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                    <Input label="Até" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
            </Card>

            {filtered.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={HistoryIcon}
                        title={sessions.length === 0 ? "Nenhuma sessão salva ainda" : "Nada encontrado"}
                        text={sessions.length === 0
                            ? "Faça um balanceamento e salve a sessão para vê-la aqui."
                            : "Ajuste a busca ou o período."}
                        action={sessions.length === 0 && (
                            <Button variant="primary" icon={Plus} onClick={() => navigate("/balanceamento")}>
                                Novo balanceamento
                            </Button>
                        )}
                    />
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map((s) => {
                        const st = s.verification ? STATUS[s.verification.status] : null;
                        return (
                            <div key={s.id} className="bg-surface-1 border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
                                <div className="flex-1 min-w-[180px]">
                                    <p className="text-sm font-semibold text-text">
                                        {s.machine?.name || s.machine?.tag || "Equipamento sem nome"}
                                        {s.machine?.tag && s.machine?.name ? ` · ${s.machine.tag}` : ""}
                                    </p>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        {[s.client?.name, fmtDateTime(s.createdAt)].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-text">
                                        {s.result ? `${fmtNum(s.result.Mc)} g @ ${fmtNum(s.result.angle, 1)}°` : "—"}
                                    </p>
                                    <div className="mt-1 flex justify-end gap-1.5">
                                        {s.report?.number && <Badge tone="primary">{s.report.number}</Badge>}
                                        {st ? <Badge tone={st.tone}>{st.label}</Badge> : <Badge>Sem verificação</Badge>}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" icon={FolderOpen} title="Reabrir"
                                        onClick={() => navigate("/balanceamento", { state: { session: s } })} />
                                    <Button size="sm" variant="ghost" icon={Copy} title="Duplicar"
                                        onClick={() => navigate("/balanceamento", { state: { session: s, duplicate: true } })} />
                                    <Button size="sm" variant="ghost" icon={FileDown} title="Exportar PDF"
                                        disabled={!s.result || !!pdfSession}
                                        onClick={() => setPdfSession(s)} />
                                    <Button size="sm" variant="ghost" icon={Trash2} title="Excluir"
                                        className="hover:text-critical"
                                        onClick={() => setConfirm(s.id)} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Diagrama oculto para re-exportação */}
            {pdfSession?.result && (
                <div id="history-print-diagram" className="hidden" aria-hidden="true">
                    <PolarDiagram
                        pv={pdfSession.measurements}
                        result={pdfSession.result}
                        blades={pdfSession.machine?.blades}
                        bladeOffset={pdfSession.machine?.bladeOffset ?? 0}
                        palette="print"
                    />
                </div>
            )}

            <ConfirmDialog
                open={!!confirm}
                onClose={() => setConfirm(null)}
                onConfirm={() => handleDelete(confirm)}
                title="Excluir sessão"
                message="Esta sessão será removida permanentemente. Continuar?"
            />
        </>
    );
}
