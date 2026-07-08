import React from "react";
import { View, StyleSheet, Pressable, Text, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Theme, useAppTheme } from "@/constants/Theme";
import { House, PlusCircle, ChartDonut, SquaresFour } from "phosphor-react-native";

const { width } = Dimensions.get("window");

interface CustomBottomBarProps {
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export default function CustomBottomBar({ activeIndex, onTabPress }: CustomBottomBarProps) {
  const { colors } = useAppTheme();

  const tabs = [
    {
      label: "Home",
      icon: (focused: boolean) => (
        <House size={20} weight={focused ? "fill" : "regular"} color={focused ? "#FFFFFF" : "#94A3B8"} />
      )
    },
    {
      label: "Store",
      icon: (focused: boolean) => (
        <PlusCircle size={20} weight={focused ? "fill" : "regular"} color={focused ? "#FFFFFF" : "#94A3B8"} />
      )
    },
    {
      label: "Report",
      icon: (focused: boolean) => (
        <ChartDonut size={20} weight={focused ? "fill" : "regular"} color={focused ? "#FFFFFF" : "#94A3B8"} />
      )
    },
    {
      label: "Menu",
      icon: (focused: boolean) => (
        <SquaresFour size={20} weight={focused ? "fill" : "regular"} color={focused ? "#FFFFFF" : "#94A3B8"} />
      )
    }
  ];

  return (
    <View style={styles.containerWrapper}>
      {/* Gradient Background Fade behind the floating bar */}
      <LinearGradient
        colors={["transparent", "rgba(248,250,252,0.8)", "#F8FAFC"]}
        style={styles.gradientBackground}
        pointerEvents="none"
      />

      {/* Floating Pill Menu */}
      <View style={styles.floatingMenu}>
        {tabs.map((tab, index) => {
          const isFocused = activeIndex === index;

          return (
            <Pressable
              key={index}
              onPress={() => onTabPress(index)}
              style={styles.tabButton}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={styles.tabContent}>
                {isFocused ? (
                  <LinearGradient
                    colors={[Theme.colors.primary, Theme.colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeBackground}
                  >
                    {tab.icon(true)}
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveContainer}>{tab.icon(false)}</View>
                )}
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    zIndex: 1000,
  },
  gradientBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  floatingMenu: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: Theme.radius.xl,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-between",
    width: width - 40,
    gap: 8,
    ...Theme.shadows.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  activeBackground: {
    width: 38,
    height: 38,
    borderRadius: Theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    ...Theme.shadows.sm,
  },
  inactiveContainer: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.caption,
    color: "#94A3B8",
  },
  tabLabelActive: {
    color: "#FFFFFF",
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
});
