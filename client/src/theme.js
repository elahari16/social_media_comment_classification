import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5", // Light background
      paper: "#ffffff",   // White paper
    },
    primary: {
      main: "#00adb5",    // Vibrant Cyan Accents
    },
    text: {
      primary: "#333333", // Dark text
      secondary: "#757575", // Secondary text
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Montserrat', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#00adb5",
            color: "#ffffff",
            boxShadow: "0 0 8px #00adb5",
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...{
            padding: theme.spacing(2),
            borderWidth: "1.5px",
          },
        }),
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: "md",
      },
    },
  },
});

export default theme;