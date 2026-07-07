import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Excluir", danger = true }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-text-muted">{message}</p>
        </Modal>
    );
}
