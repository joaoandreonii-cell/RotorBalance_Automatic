import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Stepper from "../ui/Stepper.jsx";
import IdentificationForm from "./IdentificationForm.jsx";
import MachineForm from "./MachineForm.jsx";
import RotorIllustration from "./RotorIllustration.jsx";
import PolarDiagram from "./PolarDiagram.jsx";
import ResultPanel from "./ResultPanel.jsx";
import BladeSplitCard from "./BladeSplitCard.jsx";
import VerificationCard from "./VerificationCard.jsx";
import { UNITS } from "./MeasurementsForm.jsx";

const STEPS = [
    { label: "Identificação" },
    { label: "V₀ original" },
    { label: "V₁ · 0°" },
    { label: "V₂ · 120°" },
    { label: "V₃ · 240°" },
    { label: "Resultado" },
];

const MEAS_STEPS = {
    1: {
        key: "Vo", highlight: null, title: "Primeira medição — vibração original",
        text: "Com o rotor em operação normal e SEM nenhuma massa de teste, meça e registre a vibração original V₀.",
    },
    2: {
        key: "V1", highlight: 1, title: "Segunda medição — massa na posição 1",
        text: "Pare o rotor, fixe a massa de teste Mₜ na posição 1 (0°), opere novamente e registre a vibração V₁.",
    },
    3: {
        key: "V2", highlight: 2, title: "Terceira medição — massa na posição 2",
        text: "Retire a massa da posição 1 e fixe-a na posição 2 (120°). Registre a vibração V₂.",
    },
    4: {
        key: "V3", highlight: 3, title: "Quarta medição — massa na posição 3",
        text: "Retire a massa da posição 2 e fixe-a na posição 3 (240°). Registre a vibração V₃.",
    },
};

export default function WizardMode({
    form, patch, patchMeas, patchVerif, pv, result, split, reduction, status, onSave, saveDisabled, extraActions,
}) {
    const [step, setStep] = useState(0);

    const canAdvance = () => {
        if (step === 0) return true;
        if (step === 1) return pv.Vo !== null;
        if (step === 2) return pv.V1 !== null && pv.Mt !== null;
        if (step === 3) return pv.V2 !== null;
        if (step === 4) return pv.V3 !== null;
        return false;
    };

    const meas = MEAS_STEPS[step];

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            <Stepper steps={STEPS} current={step} onSelect={setStep} />

            {step === 0 && (
                <Card title="Identificação e máquina" subtitle="Dados usados no relatório (opcionais)">
                    <div className="space-y-4">
                        <IdentificationForm value={form} onChange={patch} />
                        <MachineForm value={form} onChange={patch} />
                        <Select
                            label="Unidade de vibração"
                            options={UNITS}
                            value={form.meas.unit}
                            onChange={(e) => patchMeas({ unit: e.target.value })}
                        />
                    </div>
                </Card>
            )}

            {meas && (
                <Card title={meas.title}>
                    <div className="space-y-4">
                        <RotorIllustration highlight={meas.highlight} />
                        <p className="text-sm text-text-muted text-center max-w-md mx-auto">{meas.text}</p>
                        <div className="max-w-xs mx-auto space-y-3">
                            <Input
                                label={`Vibração ${["", "V₀", "V₁", "V₂", "V₃"][step]}`}
                                suffix={form.meas.unit}
                                placeholder="0,00"
                                inputMode="decimal"
                                autoFocus
                                value={form.meas[meas.key]}
                                onChange={(e) => patchMeas({ [meas.key]: e.target.value })}
                            />
                            {step === 2 && (
                                <Input
                                    label="Massa de teste Mₜ"
                                    sub="a mesma nas 3 posições"
                                    suffix="g"
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    value={form.meas.Mt}
                                    onChange={(e) => patchMeas({ Mt: e.target.value })}
                                />
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {step === 5 && (
                <Card title="Resultado">
                    <div className="space-y-4">
                        <div className="max-w-sm mx-auto">
                            <PolarDiagram
                                pv={pv} result={result}
                                blades={parseInt(form.machine.blades, 10) || null}
                                bladeOffset={parseFloat(form.machine.bladeOffset) || 0}
                            />
                        </div>
                        <ResultPanel result={result} meas={form.meas} />
                        {result && <BladeSplitCard split={split} />}
                        {result && (
                            <VerificationCard
                                Vo={pv.Vo} unit={form.meas.unit}
                                value={form.verification} onChange={patchVerif}
                                reduction={reduction} status={status}
                            />
                        )}
                        <div className="flex flex-wrap gap-2">
                            <Button variant="primary" disabled={saveDisabled} onClick={onSave}>Salvar</Button>
                            {extraActions}
                        </div>
                    </div>
                </Card>
            )}

            <div className="flex justify-between">
                <Button icon={ArrowLeft} disabled={step === 0} onClick={() => setStep(step - 1)}>
                    Voltar
                </Button>
                {step < 5 && (
                    <Button variant="primary" icon={ArrowRight} disabled={!canAdvance()} onClick={() => setStep(step + 1)}>
                        Avançar
                    </Button>
                )}
            </div>
        </div>
    );
}
