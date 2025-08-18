import { Box, Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
import { ChatMessage, StructuredChunk, StructuredChunkType } from "../../types";
import React from "react";
import Loader from "./Loader";
import { PaletteMode } from "@mui/material";
import MessageAction from "./MessageAction";
import MessageTypography from "./MessageTypography";

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
                <MessageTypography key={index} >
                    {chunk}
                </MessageTypography>
            );
        }

        const parseContent = (content: string) => {
            const parts = content.split(/(<b>[^<]+<\/b>)/g);
            return parts.map((part, i) => {
                const match = part.match(/^<b>(.*?)<\/b>$/);
                if (match) {
                    return (
                        <MessageTypography
                            key={`${index}-${i}`}
                            component="span"
                            variant="inherit"
                            sx={{ fontWeight: "bold" }}
                        >
                            {match[1]}
                        </MessageTypography>
                    );
                }
                return <MessageTypography key={`${index}-${i}`} component="span" variant="inherit">{part}</MessageTypography>;
            });
        };

        switch (chunk.type) {
            case StructuredChunkType.HEADING:
                return (
                    <MessageTypography key={index} variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                        {parseContent(chunk.content)}
                    </MessageTypography>
                );
            case StructuredChunkType.BULLET:
                return (
                    <ListItem key={index} sx={{ display: "list-item", pl: 2, py: 0.5 }}>
                        <ListItemText primary={parseContent(chunk.content)} />
                    </ListItem>
                );
            case StructuredChunkType.PARAGRAPH:
                return (
                    <MessageTypography key={index} sx={{ mb: 1 }}>
                        {parseContent(chunk.content)}
                    </MessageTypography>
                );
            default:
                return (
                    <MessageTypography key={index}>
                        {parseContent(chunk.content)}
                    </MessageTypography>
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
                                    <MessageTypography>
                                        {typeof msg.content[0] === "string" ? msg.content[0] : msg.content[0].content}
                                    </MessageTypography>
                                ) : (
                                    <List sx={{
                                        p: 0,
                                    }}>{msg.content.map(renderChunk)}</List>
                                )}
                                <Typography
                                    variant="caption"
                                    sx={{ display: "block", textAlign: "right", color: "text.secondary" }}
                                >
                                    {msg.timestamp}
                                </Typography>
                            </Box>
                            <MessageAction
                                message={msg}
                                regenerate={regenerate}
                                mode={mode}
                                enableRegenerate={!msg.isUser && i !== 0 && i === messages.length - 1}
                                isUser={msg.isUser}
                                enableCopy={i !== 0}
                            />
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