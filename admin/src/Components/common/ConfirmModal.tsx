import { Modal, Box } from "@mui/material";
import Button from "../ui/button/Button";
import ComponentCard from "./ComponentCard";
import { ReactNode } from "react";

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: ReactNode;
}

const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 300,
    textAlign: "center",
};

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
}: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onClose} style={{ zIndex: 999999999 }}>
            <Box sx={modalStyle}>
                <ComponentCard title={title}>
                    <p className="mb-6">{description}</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={onConfirm}>
                            Confirm
                        </Button>
                    </div>
                </ComponentCard>
            </Box>
        </Modal>
    );
}
