import Input from "../ui/Input.jsx";

export default function MachineForm({ value, onChange }) {
    const set = (k) => (e) => onChange({ machine: { ...value.machine, [k]: e.target.value } });
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input label="TAG" placeholder="VT-001" value={value.machine.tag} onChange={set("tag")} />
            <Input label="Equipamento" placeholder="Exaustor" value={value.machine.name} onChange={set("name")} />
            <Input label="Local" placeholder="Setor / linha" value={value.machine.location} onChange={set("location")} />
            <Input label="Rotação" suffix="RPM" inputMode="numeric" placeholder="1750" value={value.machine.rpm} onChange={set("rpm")} />
            <Input label="Raio de fixação" suffix="mm" inputMode="decimal" placeholder="150" value={value.machine.radius} onChange={set("radius")} />
            <Input label="Nº de pás" sub="p/ divisão" inputMode="numeric" placeholder="6" value={value.machine.blades} onChange={set("blades")} />
            <Input label="Pá 1 em" sub="offset angular" suffix="°" inputMode="decimal" placeholder="0" value={value.machine.bladeOffset} onChange={set("bladeOffset")} />
        </div>
    );
}
