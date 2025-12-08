import React from "react";
import { Modal, Box } from "@mui/material";
import ComponentCard from "./ComponentCard"; // Adjust path if needed

interface CommonModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: "small" | "medium" | "large";
}

const modalWidths = {
    small: 400,
    medium: 600,
    large: 1200,
};

const CommonModal: React.FC<CommonModalProps> = ({
    open,
    onClose,
    title,
    children,
    width = "large",
}) => {
    const modalStyle = {
        position: "absolute" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: modalWidths[width],
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: 2,
        p: 0,
        outline: "none",
    };

    return (
        <Modal open={open} onClose={onClose} style={{ zIndex: 9999999 }}>
            <Box sx={modalStyle}>
                <ComponentCard title={title || ""}>{children}</ComponentCard>
            </Box>
        </Modal>
    );
};

export default CommonModal;
