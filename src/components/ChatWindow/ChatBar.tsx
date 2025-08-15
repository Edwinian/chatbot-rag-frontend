import { Box, Button, PaletteMode, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";

interface Props {
    stopStreaming: () => void;
    sendMessage: () => void;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    input: string;
    mode: PaletteMode;
}

const ChatBar = ({ stopStreaming, sendMessage, setInput, input, mode }: Props) => {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <Box
            sx={{
                display: "flex",
                gap: 1,
                position: "fixed",
                bottom: 5,
                marginTop: '10px',
                left: "50%",
                transform: "translateX(-50%)",
                width: { xs: "95%", sm: "80%", md: "60%", lg: "50%" },
                maxWidth: "500px",
                p: { xs: 1, sm: 2 },
                bgcolor: mode === "dark" ? "background.paper" : "background.default",
                zIndex: 1000,
                boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
                borderRadius: 0.50,
            }}
        >
            <TextField
                fullWidth
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder="Type your message..."
                size="small"
                sx={{
                    "& .MuiInputBase-input": { color: "text.primary" },
                    "& .MuiInputLabel-root": { color: "text.secondary" },
                }}
            />
            <Button
                variant="contained"
                onClick={sendMessage}
                sx={{
                    bgcolor: mode === "dark" ? "#cccccc" : "primary.main",
                    color: mode === "dark" ? "text.primary" : "primary.contrastText",
                    "&:hover": { bgcolor: mode === "dark" ? "#bbbbbb" : "primary.dark" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px",
                    minWidth: "48px",
                }}
                aria-label="Send message"
            >
                <SendIcon />
            </Button>
            <Button
                variant="contained"
                onClick={stopStreaming}
                sx={{
                    bgcolor: mode === "dark" ? "#cccccc" : "secondary.main",
                    color: mode === "dark" ? "text.primary" : "secondary.contrastText",
                    "&:hover": { bgcolor: mode === "dark" ? "#bbbbbb" : "secondary.dark" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px",
                    minWidth: "48px",
                }}
                aria-label="Stop streaming"
            >
                <StopIcon />
            </Button>
        </Box>
    );
};

export default ChatBar;