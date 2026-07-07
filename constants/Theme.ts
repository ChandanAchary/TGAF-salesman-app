import { primary } from "./Colors";

export const Theme = {
  colors: {
    primary: primary, // #0B72FF
    primaryLight: "#0B72FF15",
    primaryDark: "#0045F4",
    accent: "#6366F1", // Indigo
    accentLight: "#6366F115",
    success: "#10B981",
    successLight: "#ECFDF5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    danger: "#EF4444",
    dangerLight: "#FEE2E2",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F5F9",
    border: "#E2E8F0",
    text: {
      primary: "#0F172A", // Slate 900
      secondary: "#475569", // Slate 600
      muted: "#94A3B8", // Slate 400
      light: "#FFFFFF",
    },
    glass: "rgba(255, 255, 255, 0.75)",
    glassDark: "rgba(15, 23, 42, 0.75)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 6,
    },
  },
  typography: {
    fontFamily: {
      regular: "Inter_400Regular",
      medium: "Inter_500Medium",
      semiBold: "Inter_600SemiBold",
      bold: "Inter_700Bold",
    },
    sizes: {
      caption: 11,
      bodySm: 13,
      body: 15,
      h3: 17,
      h2: 20,
      h1: 26,
    },
  },
};
