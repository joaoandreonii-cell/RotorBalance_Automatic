import { useRef, useState } from "react";
import { Upload, Trash2, Download, FileUp, AlertTriangle } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useTheme } from "../theme/ThemeContext.jsx";
import { repository } from "../data/repository.js";
import { fileToCompressedDataUrl } from "../utils/image.js";
import { UNITS } from "../components/balance/MeasurementsForm.jsx";

export default function SettingsPage() {
    const toast = useToast();
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState(() => repository.settings.get());
    const [confirmClear, setConfirmClear] = useState(false);
    const [importData, setImportData] = useState(null);
    const logoInput = useRef(null);
    const importInput = useRef(null);

    const update = (partial) => setSettings(repository.settings.update(partial));

    const handleLogo = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        try {
            const dataUrl = await fileToCompressedDataUrl(file);
            update({ logo: dataUrl });
            toast("Logo atualizada!");
        } catch {
            toast("Não foi possível processar a imagem", "error");
        }
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(repository.backup.export(), null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `rba-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast("Backup exportado!");
    };

    const handleImportFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                setImportData(JSON.parse(reader.result));
            } catch {
                toast("Arquivo de backup inválido", "error");
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <PageHeader title="Configurações" subtitle="Perfil, relatório e dados" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <Card title="Perfil" subtitle="Usado no cabeçalho e assinatura do relatório">
                    <div className="space-y-3">
                        <Input label="Técnico responsável" placeholder="Seu nome" value={settings.technician}
                            onChange={(e) => update({ technician: e.target.value })} />
                        <Input label="Empresa" placeholder="Nome da empresa" value={settings.company}
                            onChange={(e) => update({ company: e.target.value })} />
                        <Input label="Contato" placeholder="E-mail ou telefone" value={settings.contact}
                            onChange={(e) => update({ contact: e.target.value })} />
                    </div>
                </Card>

                <Card title="Logo do relatório" subtitle="Aparece no cabeçalho do PDF (white-label)">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg border border-dashed border-border-strong bg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
                            {settings.logo
                                ? <img src={settings.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                : <span className="text-[10px] text-text-subtle text-center px-1">Sem logo</span>}
                        </div>
                        <div className="space-y-2">
                            <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogo} />
                            <Button icon={Upload} onClick={() => logoInput.current?.click()}>Enviar logo</Button>
                            {settings.logo && (
                                <Button variant="ghost" icon={Trash2} onClick={() => update({ logo: null })}>Remover</Button>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="Preferências">
                    <div className="grid grid-cols-2 gap-3">
                        <Select label="Unidade padrão" options={UNITS} value={settings.defaultUnit}
                            onChange={(e) => update({ defaultUnit: e.target.value })} />
                        <Select label="Tema"
                            options={[
                                { value: "system", label: "Sistema" },
                                { value: "light", label: "Claro" },
                                { value: "dark", label: "Escuro" },
                            ]}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)} />
                    </div>
                </Card>

                <Card title="Dados" subtitle="Backup local em JSON">
                    <div className="flex flex-wrap gap-2">
                        <Button icon={Download} onClick={handleExport}>Exportar backup</Button>
                        <input ref={importInput} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
                        <Button icon={FileUp} onClick={() => importInput.current?.click()}>Importar backup</Button>
                        <Button variant="danger" icon={AlertTriangle} onClick={() => setConfirmClear(true)}>
                            Limpar histórico
                        </Button>
                    </div>
                </Card>

                <Card title="Sobre" className="lg:col-span-2">
                    <p className="text-sm text-text-muted leading-relaxed">
                        <span className="font-semibold text-text">RotorBalance Automatic v2.0</span> — balanceamento de rotores
                        em um plano pelo método dos três pontos (four-run method), sem medição de fase.
                        Quatro medições de vibração (V₀, V₁ @ 0°, V₂ @ 120°, V₃ @ 240°) determinam a massa de correção:
                        Mc = Mₜ × V₀ / OP.
                    </p>
                </Card>
            </div>

            <ConfirmDialog
                open={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={() => { repository.sessions.clear(); toast("Histórico limpo."); }}
                title="Limpar histórico"
                message="TODAS as sessões salvas serão excluídas permanentemente. As configurações são mantidas. Continuar?"
                confirmLabel="Limpar tudo"
            />
            <ConfirmDialog
                open={!!importData}
                onClose={() => setImportData(null)}
                onConfirm={() => {
                    const { imported } = repository.backup.import(importData, { merge: true });
                    setSettings(repository.settings.get());
                    toast(`${imported} sessão(ões) importada(s).`);
                }}
                title="Importar backup"
                message={`O backup contém ${importData?.sessions?.length ?? 0} sessão(ões). Elas serão mescladas ao histórico atual (sem duplicar ids). Continuar?`}
                confirmLabel="Importar"
                danger={false}
            />
        </>
    );
}
