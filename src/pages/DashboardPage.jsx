import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Scale, TrendingDown, Factory, Archive, ArrowRight, Gauge } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { repository } from "../data/repository.js";
import { fmtNum, fmtDateTime } from "../utils/format.js";

const STATUS = {
    excellent: { label: "Excelente", tone: "ok" },
    good: { label: "Bom", tone: "ok" },
    acceptable: { label: "Aceitável", tone: "warn" },
    redo: { label: "Refazer", tone: "critical" },
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const sessions = useMemo(() => repository.sessions.list(), []);

    const stats = useMemo(() => {
        const now = new Date();
        const monthCount = sessions.filter((s) => {
            const d = new Date(s.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const verified = sessions.filter((s) => s.verification);
        const avgReduction = verified.length
            ? verified.reduce((acc, s) => acc + s.verification.reduction, 0) / verified.length
            : null;
        const machines = new Set(
            sessions.map((s) => s.machine?.tag || s.machine?.name).filter(Boolean)
        ).size;
        return { monthCount, avgReduction, machines, total: sessions.length };
    }, [sessions]);

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle="Visão geral dos balanceamentos"
                actions={
                    <Button variant="primary" icon={Plus} onClick={() => navigate("/balanceamento")}>
                        Novo balanceamento
                    </Button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Balanceamentos no mês" value={stats.monthCount} icon={Scale} tone="primary" />
                <StatCard
                    label="Redução média de vibração"
                    value={stats.avgReduction !== null ? `${fmtNum(stats.avgReduction, 0)}%` : "—"}
                    sub={stats.avgReduction === null ? "sem verificações ainda" : "sessões verificadas"}
                    icon={TrendingDown} tone="ok"
                />
                <StatCard label="Máquinas atendidas" value={stats.machines} icon={Factory} />
                <StatCard label="Total de sessões" value={stats.total} icon={Archive} />
            </div>

            <Card
                title="Sessões recentes"
                subtitle="Últimos balanceamentos salvos"
                actions={
                    sessions.length > 0 && (
                        <Button size="sm" variant="ghost" onClick={() => navigate("/historico")}>
                            Ver todas <ArrowRight size={14} />
                        </Button>
                    )
                }
            >
                {sessions.length === 0 ? (
                    <EmptyState
                        icon={Gauge}
                        title="Nenhum balanceamento ainda"
                        text="Comece o primeiro balanceamento pelo método dos três pontos — o resultado aparece aqui."
                        action={
                            <Button variant="primary" icon={Plus} onClick={() => navigate("/balanceamento")}>
                                Começar agora
                            </Button>
                        }
                    />
                ) : (
                    <ul className="divide-y divide-border">
                        {sessions.slice(0, 5).map((s) => {
                            const st = s.verification ? STATUS[s.verification.status] : null;
                            return (
                                <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text truncate">
                                            {s.machine?.name || s.machine?.tag || s.client?.name || "Sessão"}
                                        </p>
                                        <p className="text-xs text-text-muted">{fmtDateTime(s.createdAt)}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-text whitespace-nowrap">
                                        {s.result ? `${fmtNum(s.result.Mc)} g @ ${fmtNum(s.result.angle, 1)}°` : "—"}
                                    </p>
                                    {st && <Badge tone={st.tone}>{st.label}</Badge>}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
        </>
    );
}
