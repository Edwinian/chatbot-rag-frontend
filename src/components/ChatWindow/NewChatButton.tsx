import { Button, PaletteMode } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

interface Props {
    startNewSession: () => void;
    mode: PaletteMode;
}

const NewChatButton = ({ startNewSession, mode }: Props) => {
    return (
        <Button
            variant="outlined"
            onClick={startNewSession}
            sx={{
                bgcolor: mode === "dark" ? "#cccccc" : "background.paper",
                color: mode === "dark" ? "text.primary" : "text.primary",
                "&:hover": { bgcolor: mode === "dark" ? "#bbbbbb" : "action.hover" },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "8px",
                mb: 2, // Space below button to separate from ChatScreen
                width: "10%", // Allow natural width
                minWidth: "120px", // Ensure readable width
            }}
            aria-label="New chat"
        >
            <ChatIcon sx={{ mr: 1 }} />
            New Chat
        </Button>
    );
};

export default NewChatButton;