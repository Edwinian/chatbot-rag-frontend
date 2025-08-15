import { Box, CircularProgress, Divider, ListItem, Typography } from "@mui/material";

const Loader = () => {
    return <>
        <ListItem sx={{ justifyContent: "flex-start", py: 1 }}>
            <Box
                sx={{
                    maxWidth: "70%",
                    bgcolor: "background.default",
                    borderRadius: 2,
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    boxShadow: 1,
                }}
            >
                <CircularProgress size={16} color="inherit" />
                <Typography variant="body2" color="text.secondary">
                    Loading...
                </Typography>
            </Box>
        </ListItem>
        <Divider sx={{ bgcolor: "text.secondary" }} />
    </>
}

export default Loader;