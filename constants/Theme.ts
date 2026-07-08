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
    gradients: {
      primary: ["#0045F4", "#0B72FF", "#6366F1"] as const,
      success: ["#059669", "#10B981", "#34D399"] as const,
      warning: ["#D97706", "#F59E0B", "#FBBF24"] as const,
      danger: ["#DC2626", "#EF4444", "#F87171"] as const,
      dark: ["#0F172A", "#1E293B", "#334155"] as const,
      glass: ["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.05)"] as const,
    }
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

import { useThemeStore } from "../store";

export const ThemeColors = {
  light: {
    primary: primary,
    primaryLight: "#0B72FF15",
    primaryDark: "#0045F4",
    accent: "#6366F1",
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
      primary: "#0F172A",
      secondary: "#475569",
      muted: "#94A3B8",
      light: "#FFFFFF",
    },
    glass: "rgba(255, 255, 255, 0.75)",
    glassDark: "rgba(15, 23, 42, 0.75)",
    gradients: {
      primary: ["#0045F4", "#0B72FF", "#6366F1"] as const,
      success: ["#059669", "#10B981", "#34D399"] as const,
      warning: ["#D97706", "#F59E0B", "#FBBF24"] as const,
      danger: ["#DC2626", "#EF4444", "#F87171"] as const,
      dark: ["#0F172A", "#1E293B", "#334155"] as const,
      glass: ["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.05)"] as const,
    }
  },
  dark: {
    primary: primary,
    primaryLight: "#0B72FF25",
    primaryDark: "#0045F4",
    accent: "#818CF8",
    accentLight: "#818CF815",
    success: "#10B981",
    successLight: "#064E3B",
    warning: "#F59E0B",
    warningLight: "#78350F",
    danger: "#EF4444",
    dangerLight: "#7F1D1D",
    background: "#0F172A",
    surface: "#1E293B",
    surfaceAlt: "#334155",
    border: "#334155",
    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
      muted: "#64748B",
      light: "#FFFFFF",
    },
    glass: "rgba(15, 23, 42, 0.75)",
    glassDark: "rgba(255, 255, 255, 0.75)",
    gradients: {
      primary: ["#1E293B", "#0F172A", "#0B72FF"] as const,
      success: ["#064E3B", "#10B981", "#059669"] as const,
      warning: ["#78350F", "#F59E0B", "#D97706"] as const,
      danger: ["#7F1D1D", "#EF4444", "#DC2626"] as const,
      dark: ["#020617", "#0F172A", "#1E293B"] as const,
      glass: ["rgba(15, 23, 42, 0.3)", "rgba(15, 23, 42, 0.1)"] as const,
    }
  }
};

export function useAppTheme() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = ThemeColors[themeMode];
  return {
    mode: themeMode,
    colors,
    typography: Theme.typography,
    spacing: Theme.spacing,
    radius: Theme.radius,
    shadows: Theme.shadows,
  };
}
