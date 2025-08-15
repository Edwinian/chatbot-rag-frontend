import { Box, Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
import { ChatMessage, StructuredChunk, StructuredChunkType } from "../../types";
import React from "react";
import Loader from "./Loader";
import { PaletteMode } from "@mui/material";
import MessageAction from "./MessageAction";

interface Props {
    messages: ChatMessage[];
    isLoading: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    regenerate: () => void;
    mode: PaletteMode;
}

const ChatScreen: React.FC<Props> = ({ messages, isLoading, messagesEndRef, regenerate, mode }) => {
    const renderChunk = (chunk: string | StructuredChunk, index: number) => {
        if (typeof chunk === "string") {
            return (
                <Typography key={index} variant="body2">
                    {chunk}
                </Typography>
            );
        }

        const parseContent = (content: string) => {
            const parts = content.split(/(<b>[^<]+<\/b>)/g);
            return parts.map((part, i) => {
                const match = part.match(/^<b>(.*?)<\/b>$/);
                if (match) {
                    return (
                        <Typography
                            key={`${index}-${i}`}
                            component="span"
                            variant="inherit"
                            sx={{ fontWeight: "bold" }}
                        >
                            {match[1]}
                        </Typography>
                    );
                }
                return <Typography key={`${index}-${i}`} component="span" variant="inherit">{part}</Typography>;
            });
        };

        switch (chunk.type) {
            case StructuredChunkType.HEADING:
                return (
                    <Typography key={index} variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                        {parseContent(chunk.content)}
                    </Typography>
                );
            case StructuredChunkType.BULLET:
                return (
                    <ListItem key={index} sx={{ display: "list-item", pl: 2, py: 0.5 }}>
                        <ListItemText primary={parseContent(chunk.content)} />
                    </ListItem>
                );
            case StructuredChunkType.PARAGRAPH:
                return (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                        {parseContent(chunk.content)}
                    </Typography>
                );
            default:
                return (
                    <Typography key={index} variant="body2">
                        {parseContent(chunk.content)}
                    </Typography>
                );
        }
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                overflowY: "auto",
                pr: 1,
                pb: { xs: 10, sm: 12 },
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "text.secondary",
                    borderRadius: "4px",
                },
            }}
        >
            <List>
                {messages.map((msg, i) => (
                    <React.Fragment key={msg.id}>
                        <ListItem
                            sx={{
                                justifyContent: msg.isUser ? "flex-end" : "flex-start",
                                py: 1,
                                flexDirection: "column",
                                alignItems: msg.isUser ? "flex-end" : "flex-start",
                            }}
                        >
                            <Box
                                sx={{
                                    maxWidth: { xs: "85%", sm: "70%" },
                                    bgcolor: "background.default",
                                    color: "text.primary",
                                    borderRadius: 2,
                                    p: 1,
                                    boxShadow: 1,
                                }}
                            >
                                {msg.isUser ? (
                                    <Typography variant="body2">
                                        {typeof msg.content[0] === "string" ? msg.content[0] : msg.content[0].content}
                                    </Typography>
                                ) : (
                                    <List sx={{ p: 0 }}>{msg.content.map(renderChunk)}</List>
                                )}
                                <Typography
                                    variant="caption"
                                    sx={{ display: "block", textAlign: "right", color: "text.secondary" }}
                                >
                                    {msg.timestamp}
                                </Typography>
                            </Box>
                            {!msg.isUser && i !== 0 && (
                                <MessageAction
                                    message={msg}
                                    regenerate={regenerate} // Pass isRegeneration: true
                                    mode={mode}
                                    isLastMessage={i === messages.length - 1}
                                />
                            )}
                        </ListItem>
                        <Divider sx={{ bgcolor: "text.secondary" }} />
                    </React.Fragment>
                ))}
                {isLoading && <Loader />}
                <div ref={messagesEndRef} />
            </List>
        </Box>
    );
};

export default ChatScreen;