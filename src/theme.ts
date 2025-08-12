import { createTheme, PaletteMode, PaletteOptions } from "@mui/material/styles";

const lightTheme: { palette: PaletteOptions } = {
    palette: {
        mode: "light" as PaletteMode, // Explicitly type as PaletteMode
        primary: {
            main: "#1976d2", // Blue for primary actions
        },
        secondary: {
            main: "#dc004e", // Red for secondary actions
        },
        background: {
            default: "#f5f5f5",
            paper: "#ffffff",
        },
        text: {
            primary: "#333333",
            secondary: "#555555",
        },
    },
};

const darkTheme: { palette: PaletteOptions } = {
    palette: {
        mode: "dark" as PaletteMode, // Explicitly type as PaletteMode
        primary: {
            main: "#90caf9", // Lighter blue for dark mode
        },
        secondary: {
            main: "#f48fb1", // Softer red for dark mode
        },
        background: {
            default: "#121212", // Dark background
            paper: "#1e1e1e", // Darker paper for cards
        },
        text: {
            primary: "#ffffff",
            secondary: "#bbbbbb",
        },
    },
};

const theme = (mode: PaletteMode) =>
    createTheme({
        palette: mode === "light" ? lightTheme.palette : darkTheme.palette,
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        borderRadius: 8,
                        padding: "8px 16px",
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 8,
                        },
                    },
                },
            },
            MuiAutocomplete: {
                styleOverrides: {
                    root: {
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 8,
                        },
                    },
                },
            },
            MuiListItem: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        "&:hover": {
                            backgroundColor: theme.palette.mode === "light" ? "#e3f2fd" : "#333333", // Use theme palette mode
                        },
                    }),
                },
            },
        },
    });

export default theme;