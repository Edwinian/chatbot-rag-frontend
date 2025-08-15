import React, { useState } from "react";
import { Button, Box, PaletteMode, Snackbar, Alert, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ChatMessage, StructuredChunk } from "../../types";

interface MessageActionProps {
    message: ChatMessage;
    regenerate: () => void;
    mode: PaletteMode;
    enableRegenerate: boolean;
    isUser: boolean
}

const MessageAction = ({ message, regenerate, mode, enableRegenerate, isUser }: MessageActionProps) => {
    const [openToast, setOpenToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");

    const getMessageText = (content: (string | StructuredChunk)[]): string => {
        return content
            .map((chunk) => {
                if (typeof chunk === "string") return chunk;
                return chunk.content;
            })
            .join("\n");
    };

    const handleCopy = async () => {
        const text = getMessageText(message.content);
        try {
            await navigator.clipboard.writeText(text);
            setToastMessage("Copied to clipboard!");
            setToastSeverity("success");
            setOpenToast(true);
        } catch (error) {
            console.error("Failed to copy to clipboard:", error);
            setToastMessage("Failed to copy to clipboard.");
            setToastSeverity("error");
            setOpenToast(true);
        }
    };

    const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenToast(false);
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    gap: 0.5,
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    mt: 0.5,
                    width: { xs: "85%", sm: "70%" }, // Match message bubble width
                }}
            >
                {enableRegenerate && (
                    <Tooltip title="Regenerate" arrow enterDelay={300}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={regenerate}
                            sx={{
                                bgcolor: mode === "dark" ? "#cccccc" : "background.paper",
                                color: mode === "dark" ? "text.primary" : "text.primary",
                                "&:hover": { bgcolor: mode === "dark" ? "#bbbbbb" : "action.hover" },
                                textTransform: "none",
                                minWidth: "32px",
                                p: 0.5,
                                "& .MuiSvgIcon-root": { fontSize: "16px" },
                            }}
                            aria-label="Regenerate message"
                        >
                            <RefreshIcon />
                        </Button>
                    </Tooltip>
                )}
                <Tooltip title="Copy" arrow enterDelay={300}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCopy}
                        sx={{
                            bgcolor: mode === "dark" ? "#cccccc" : "background.paper",
                            color: mode === "dark" ? "text.primary" : "text.primary",
                            "&:hover": { bgcolor: mode === "dark" ? "#bbbbbb" : "action.hover" },
                            textTransform: "none",
                            minWidth: "32px",
                            p: 0.5,
                            "& .MuiSvgIcon-root": { fontSize: "16px" },
                        }}
                        aria-label="Copy message"
                    >
                        <ContentCopyIcon />
                    </Button>
                </Tooltip>
            </Box>
            <Snackbar
                open={openToast}
                autoHideDuration={3000}
                onClose={handleToastClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: "100%" }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default MessageAction;