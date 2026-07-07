import Input from "../ui/Input.jsx";

export default function IdentificationForm({ value, onChange }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Cliente / Empresa" placeholder="Ex.: Metalúrgica Alfa"
                value={value.client.name}
                onChange={(e) => onChange({ client: { ...value.client, name: e.target.value } })} />
            <Input label="Contato" placeholder="E-mail ou telefone"
                value={value.client.contact}
                onChange={(e) => onChange({ client: { ...value.client, contact: e.target.value } })} />
            <Input label="Técnico responsável" placeholder="Seu nome"
                value={value.technician}
                onChange={(e) => onChange({ technician: e.target.value })} />
            <Input label="Notas" placeholder="Observações (opcional)"
                value={value.notes}
                onChange={(e) => onChange({ notes: e.target.value })} />
        </div>
    );
}
