import React, { useState, useEffect } from "react";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Typography,
    IconButton,
    Menu,
    MenuItem,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSearchParams } from "react-router-dom";
import { fetchLatestApplicationLogs, deleteApplicationLogs } from "../../api";
import { ApplicationLog, PageProps } from "../../types";

const ChatSideBar: React.FC<PageProps> = ({ mode }) => {
    const [logs, setLogs] = useState<ApplicationLog[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const itemTextStyle = {
        "&.Mui-selected": {
            backgroundColor: mode === "dark" ? "#444" : "#e0e0e0",
        },
        color: "text.secondary",
    }

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const latestLogs = await fetchLatestApplicationLogs();
                setLogs(latestLogs);
            } catch (error) {
                console.error("Error fetching latest application logs:", error);
            }
        };
        loadLogs();
    }, []);

    const handleItemClick = (sessionId: string) => {
        setSearchParams({ sessionId });
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, sessionId: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedSessionId(sessionId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedSessionId(null);
    };

    const handleDelete = async () => {
        if (selectedSessionId) {
            try {
                await deleteApplicationLogs({ session_id: selectedSessionId });
                // If the deleted session is the current one, clear the sessionId from searchParams
                if (searchParams.get("sessionId") === selectedSessionId) {
                    setSearchParams({});
                }
                // Refresh logs
                const latestLogs = await fetchLatestApplicationLogs();
                setLogs(latestLogs);
            } catch (error) {
                console.error("Error deleting application logs:", error);
            }
        }
        handleMenuClose();
    };

    return (
        <Box
            sx={{
                width: { xs: "100%", sm: 250 },
                bgcolor: mode === "dark" ? "background.paper" : "background.default",
                borderRight: mode === "dark" ? "1px solid #333" : "1px solid #ddd",
                height: "calc(100vh - 120px)",
                overflowY: "auto",
                p: 1,
                borderRadius: 0.75,
            }}
        >
            <Typography variant="h6" sx={{ p: 2, fontWeight: "bold", color: "text.secondary" }}>
                Recent Chats
            </Typography>
            <Divider />
            <List>
                {logs.length === 0 ? (
                    <ListItem>
                        <ListItemText sx={itemTextStyle} primary="No recent chats" />
                    </ListItem>
                ) : (
                    logs.map((log) => (
                        <ListItem
                            key={log.session_id}
                            disablePadding
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    aria-label="more"
                                    onClick={(event) => handleMenuClick(event, log.session_id)}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            }
                        >
                            <ListItemButton
                                selected={searchParams.get("sessionId") === log.session_id}
                                onClick={() => handleItemClick(log.session_id)}
                                sx={itemTextStyle}
                            >
                                <ListItemText
                                    primary={log.user_query.length > 20 ? `${log.user_query.slice(0, 20)}...` : log.user_query}
                                    secondary={new Date(log.created_at).toLocaleDateString()}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))
                )}
            </List>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem onClick={handleDelete}><DeleteIcon />Delete</MenuItem>
            </Menu>
        </Box>
    );
};

export default ChatSideBar;