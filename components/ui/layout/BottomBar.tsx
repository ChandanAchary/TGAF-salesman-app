import React from "react";
import { View, StyleSheet, Pressable, Text, Dimensions, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "@/constants/Theme";

const { width } = Dimensions.get("window");

export const BottomBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
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
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Icon rendering
          const Icon = options.tabBarIcon
            ? options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? "#FFFFFF" : "#94A3B8", // White if active, Slate 400 if inactive
              size: 20,
            })
            : null;

          // Get clean display labels
          const getLabel = () => {
            if (options.title) {
              if (options.title.toLowerCase() === "menu") return "Menu";
              return options.title;
            }
            return route.name;
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
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
                    {Icon}
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveContainer}>{Icon}</View>
                )}
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {getLabel()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 34 : 20, // Clean padding for bottom safe areas
    zIndex: 1000,
  },
  gradientBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120, // Smooth fade height
  },
  floatingMenu: {
    flexDirection: "row",
    backgroundColor: "#0F172A", // Dark Slate background
    borderRadius: Theme.radius.xl,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-between",
    width: width - 40, // Elegant margin around the screen
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
    borderRadius: Theme.radius.sm, // Matching squircle theme
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
    color: "#94A3B8", // Slate 400
  },
  tabLabelActive: {
    color: "#FFFFFF",
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
});
