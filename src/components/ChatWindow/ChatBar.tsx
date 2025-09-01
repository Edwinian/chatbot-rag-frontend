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
    const buttonStyle = {
        bgcolor: mode === "dark" ? "#cccccc" : "primary.main",
        color: mode === "dark" ? "text.primary" : "primary.contrastText",
        "&:hover": { bgcolor: mode === "dark" ? "#bbbbbb" : "primary.dark" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "8px",
        minWidth: "48px",
        height: "40px",
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent default Enter behavior (form submission)
            sendMessage();
        }
        // Shift + Enter will automatically add a newline due to multiline prop
    };

    return (
        <Box
            sx={{
                display: "flex",
                gap: 1,
                position: "fixed",
                bottom: 5,
                left: "55.5%",
                transform: "translateX(-50%)",
                width: { xs: "95%", sm: "80%", md: "60%", lg: "50%" },
                maxWidth: "850px",
                p: { xs: 1, sm: 2 },
                bgcolor: mode === "dark" ? "background.paper" : "background.default",
                zIndex: 1000,
                boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
                borderRadius: 0.5,
            }}
        >
            <TextField
                fullWidth
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                multiline
                minRows={1}
                maxRows={10} // Limit maximum height to prevent excessive growth
                sx={{
                    "& .MuiInputBase-root": {
                        color: "text.primary",
                        alignItems: "flex-start",
                    },
                    "& .MuiInputBase-input": {
                        color: "text.primary",
                    },
                    "& .MuiInputLabel-root": {
                        color: "text.secondary",
                    },
                }}
            />
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    alignSelf: "flex-end",
                }}
            >
                <Button
                    variant="contained"
                    onClick={sendMessage}
                    sx={buttonStyle}
                    aria-label="Send message"
                >
                    <SendIcon />
                </Button>
                <Button
                    variant="contained"
                    onClick={stopStreaming}
                    sx={buttonStyle}
                    aria-label="Stop streaming"
                >
                    <StopIcon />
                </Button>
            </Box>
        </Box>
    );
};

export default ChatBar;