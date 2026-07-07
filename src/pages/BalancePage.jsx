import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Save, Eraser } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import IdentificationForm from "../components/balance/IdentificationForm.jsx";
import MachineForm from "../components/balance/MachineForm.jsx";
import MeasurementsForm from "../components/balance/MeasurementsForm.jsx";
import ResultPanel from "../components/balance/ResultPanel.jsx";
import BladeSplitCard from "../components/balance/BladeSplitCard.jsx";
import VerificationCard from "../components/balance/VerificationCard.jsx";
import PolarDiagram from "../components/balance/PolarDiagram.jsx";
import { parseVal, computeResult, splitBetweenBlades, reductionPercent, qualityStatus } from "../utils/math.js";
import { repository } from "../data/repository.js";

export const EMPTY_FORM = {
    client: { name: "", contact: "" },
    technician: "",
    machine: { tag: "", name: "", location: "", rpm: "", radius: "", blades: "", bladeOffset: "0" },
    meas: { unit: "mm/s", Vo: "", V1: "", V2: "", V3: "", Mt: "" },
    verification: { Vf: "" },
    notes: "",
};

const numToStr = (n) => (n === null || n === undefined ? "" : String(n));

export function sessionToForm(s) {
    return {
        client: { name: s.client?.name ?? "", contact: s.client?.contact ?? "" },
        technician: s.technician ?? "",
        machine: {
            tag: s.machine?.tag ?? "", name: s.machine?.name ?? "", location: s.machine?.location ?? "",
            rpm: numToStr(s.machine?.rpm), radius: numToStr(s.machine?.radius),
            blades: numToStr(s.machine?.blades), bladeOffset: numToStr(s.machine?.bladeOffset ?? 0) || "0",
        },
        meas: {
            unit: s.measurements?.unit ?? "mm/s",
            Vo: numToStr(s.measurements?.Vo), V1: numToStr(s.measurements?.V1),
            V2: numToStr(s.measurements?.V2), V3: numToStr(s.measurements?.V3),
            Mt: numToStr(s.measurements?.Mt),
        },
        verification: { Vf: numToStr(s.verification?.Vf) },
        notes: s.notes ?? "",
    };
}

export default function BalancePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const seed = location.state?.session;
    const isDuplicate = location.state?.duplicate;

    const [form, setForm] = useState(() => {
        if (seed) return sessionToForm(seed);
        const s = repository.settings.get();
        return { ...EMPTY_FORM, technician: s.technician, meas: { ...EMPTY_FORM.meas, unit: s.defaultUnit } };
    });
    const [sessionId, setSessionId] = useState(seed && !isDuplicate ? seed.id : null);
    const [reportNumber, setReportNumber] = useState(seed && !isDuplicate ? seed.report?.number ?? null : null);
    const [confirmClear, setConfirmClear] = useState(false);
    const diagramRef = useRef(null);
    const printRef = useRef(null);

    const patch = (partial) => setForm((f) => ({ ...f, ...partial }));
    const patchMeas = (partial) => setForm((f) => ({ ...f, meas: { ...f.meas, ...partial } }));
    const patchVerif = (partial) => setForm((f) => ({ ...f, verification: { ...f.verification, ...partial } }));

    const pv = useMemo(() => ({
        Vo: parseVal(form.meas.Vo), V1: parseVal(form.meas.V1), V2: parseVal(form.meas.V2),
        V3: parseVal(form.meas.V3), Mt: parseVal(form.meas.Mt),
    }), [form.meas]);

    const allFilled = pv.Vo && pv.V1 && pv.V2 && pv.V3 && pv.Mt;
    const result = useMemo(
        () => (allFilled ? computeResult(pv.Vo, pv.V1, pv.V2, pv.V3, pv.Mt) : null),
        [allFilled, pv]
    );

    const blades = parseInt(form.machine.blades, 10) || null;
    const bladeOffset = parseFloat(form.machine.bladeOffset) || 0;
    const split = useMemo(
        () => (result && blades ? splitBetweenBlades(result.Mc, result.angle, blades, bladeOffset) : null),
        [result, blades, bladeOffset]
    );

    const Vf = parseVal(form.verification.Vf);
    const reduction = result && Vf !== null && pv.Vo ? reductionPercent(pv.Vo, Vf) : null;
    const status = reduction !== null ? qualityStatus(reduction) : null;

    const buildSession = () => ({
        ...(sessionId ? { id: sessionId } : {}),
        client: { ...form.client },
        technician: form.technician,
        machine: {
            tag: form.machine.tag, name: form.machine.name, location: form.machine.location,
            rpm: parseVal(form.machine.rpm), radius: parseVal(form.machine.radius),
            blades, bladeOffset,
        },
        measurements: { unit: form.meas.unit, Vo: pv.Vo, V1: pv.V1, V2: pv.V2, V3: pv.V3, Mt: pv.Mt },
        result: result && { Px: result.Px, Py: result.Py, OP: result.OP, angle: result.angle, Mc: result.Mc },
        bladeSplit: split,
        verification: reduction !== null ? { Vf, reduction, status: status.key } : null,
        report: reportNumber ? { number: reportNumber } : null,
        notes: form.notes,
    });

    const handleSave = () => {
        if (!result) return;
        const saved = repository.sessions.save(buildSession());
        setSessionId(saved.id);
        toast("Sessão salva com sucesso!");
    };

    const handleClear = () => {
        setForm({ ...EMPTY_FORM, technician: repository.settings.get().technician });
        setSessionId(null);
        setReportNumber(null);
        navigate(".", { replace: true, state: null });
    };

    const dirty = JSON.stringify(form.meas) !== JSON.stringify(EMPTY_FORM.meas) || form.client.name;

    return (
        <>
            <PageHeader
                title="Balanceamento"
                subtitle="Método dos três pontos — 4 medições, posições 0° · 120° · 240°"
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
                <div className="space-y-5">
                    <Card title="Identificação" subtitle="Cliente e responsável (aparece no relatório)">
                        <IdentificationForm value={form} onChange={patch} />
                    </Card>
                    <Card title="Máquina" subtitle="Dados do equipamento (opcional)">
                        <MachineForm value={form} onChange={patch} />
                    </Card>
                    <Card title="Medições" subtitle="Vibrações medidas nas 4 rodadas">
                        <MeasurementsForm value={form.meas} onChange={patchMeas} pv={pv} />
                    </Card>
                </div>

                <div className="space-y-5 xl:sticky xl:top-8">
                    <Card title="Diagrama polar" subtitle="Interseção dos arcos → ponto P">
                        <div ref={diagramRef}>
                            <PolarDiagram pv={pv} result={result} blades={blades} bladeOffset={bladeOffset} />
                        </div>
                    </Card>
                    <Card title="Resultado">
                        <div className="space-y-4">
                            <ResultPanel result={result} meas={form.meas} />
                            {result && <BladeSplitCard split={split} />}
                            {result && (
                                <VerificationCard
                                    Vo={pv.Vo} unit={form.meas.unit}
                                    value={form.verification} onChange={patchVerif}
                                    reduction={reduction} status={status}
                                />
                            )}
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Button variant="primary" icon={Save} disabled={!result} onClick={handleSave}>
                                    Salvar
                                </Button>
                                <Button icon={Eraser} onClick={() => (dirty ? setConfirmClear(true) : handleClear())}>
                                    Limpar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Diagrama oculto em paleta de impressão (usado pelo relatório PDF) */}
            <div ref={printRef} className="hidden" aria-hidden="true">
                <PolarDiagram pv={pv} result={result} blades={blades} bladeOffset={bladeOffset} palette="print" />
            </div>

            <ConfirmDialog
                open={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={handleClear}
                title="Limpar formulário"
                message="Todos os dados preenchidos serão descartados. Continuar?"
                confirmLabel="Limpar"
            />
        </>
    );
}
