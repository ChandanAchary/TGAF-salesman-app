// components/ui/layout/BottomBar.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withTiming,
} from "react-native-reanimated";
import { bg, primary } from "@/constants/Colors";

export const BottomBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      {/* First group of tabs */}
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          // Reanimated scale
          const scale = useSharedValue(1);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }

            // Trigger smooth pop animation (ease-in-out, 300ms total)
            scale.value = withTiming(1.2, {
              duration: 100, // quick scale up
              easing: Easing.out(Easing.ease),
            }, () => {
              scale.value = withTiming(1, {
                duration: 200, // smooth scale down
                easing: Easing.in(Easing.ease),
              });
            });
          };

          // @ts-ignore – since tabBarIcon might be undefined
          const Icon = options.tabBarIcon?.({
            color: isFocused ? "#fff" : "#666",
            size: isFocused ? 30 : 24,
            focused: isFocused,
          });

          if (route.name === "menu") return null; // Skip store tab in this group

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              android_disableSound
              delayLongPress={0}
              onPress={onPress}
              style={{ flex: 1 }}
            >
              <Animated.View
                style={[isFocused ? styles.activeTab : styles.tab, animatedStyle]}
              >
                {Icon}
                {!isFocused && (
                  <Text style={styles.label}>{label?.toString()}</Text>
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>

      {/* Second group of tabs (store only) */}
      <View style={styles.tabContainer2}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          if (route.name !== "menu") return null;

          // Reanimated scale
          const scale = useSharedValue(1);
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }

            scale.value = withSpring(1.15, { damping: 6 }, () => {
              scale.value = withSpring(1);
            });
          };

          // @ts-ignore
          const Icon = options.tabBarIcon?.({
            color: isFocused ? "#fff" : "#666",
            size: isFocused ? 32 : 24,
            focused: isFocused,
          });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              android_disableSound
              delayLongPress={0}
              onPress={onPress}
              style={{ flex: 1 }}
            >
              <Animated.View
                style={[isFocused ? styles.activeTab : styles.tab, animatedStyle]}
              >
                {Icon}
                {!isFocused && (
                  <Text style={styles.label}>{label?.toString()}</Text>
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    borderRadius: 999,
    height: 70,
    width: "90%",
    alignSelf: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 999,
    width: "70%",
    padding: 10,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },
  tabContainer2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 999,
    width: "25%",
    padding: 10,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activeTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: primary,
    borderRadius: 999,
    paddingVertical: 10,
  },
});
