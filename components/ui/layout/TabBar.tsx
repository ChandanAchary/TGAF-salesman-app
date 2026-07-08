import { Href, router } from "expo-router";
import { CaretLeft, House } from "phosphor-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WifiButtonSmall from "../WifiButtonSmall";
import { Theme, useAppTheme } from "@/constants/Theme";

interface TabBarProps {
  title?: string,
  customLink?: { name: string; path: Href },
  children?: React.ReactNode,
  opacity?: number
  showHomeButton?: boolean
}

export default function TabBar({ title, customLink, children, opacity, showHomeButton = true }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  
  const handleBack = () => {
    if (customLink) {
      router.replace(customLink.path);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleHome = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={[
      styles.headerBar, 
      { opacity: opacity ?? 1, paddingTop: insets.top > 0 ? insets.top + 6 : 14, backgroundColor: colors.surface, borderColor: colors.border }
    ]}>
      <View style={styles.topRow}>
        
        {/* Left Side Navigation Pills */}
        <View style={styles.navigationWrapper}>
          
          {/* Back Trigger */}
          <TouchableOpacity 
            onPress={handleBack} 
            style={[
              styles.navButton,
              { backgroundColor: colors.background, borderColor: colors.border },
              customLink ? styles.customLinkButton : null
            ]}
            activeOpacity={0.7}
          >
            <CaretLeft size={20} color={colors.primary} weight="bold" />
            {customLink && (
              <Text style={[styles.customLinkText, { color: colors.primary }]} numberOfLines={1}>
                {customLink.name}
              </Text>
            )}
          </TouchableOpacity>

          {/* Home Trigger */}
          {showHomeButton && (
            <TouchableOpacity 
              onPress={handleHome} 
              style={[
                styles.navButton,
                { backgroundColor: colors.background, borderColor: colors.border }
              ]}
              activeOpacity={0.7}
            >
              <House size={20} color={colors.primary} weight="bold" />
            </TouchableOpacity>
          )}
        </View>

        {/* Centered Title */}
        <View style={styles.titleWrapper}>
          <Text style={[styles.titleText, { color: colors.text.primary }]} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </View>

        {/* Right Side Status Indicators */}
        <View style={styles.rightWrapper}>
          <WifiButtonSmall />
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    zIndex: 10,
    ...Theme.shadows.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
  },
  navigationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 90,
  },
  navButton: {
    padding: 8,
    borderRadius: Theme.radius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  customLinkButton: {
    flexDirection: "row",
    paddingRight: 12,
    gap: 4,
    borderRadius: Theme.radius.md,
  },
  customLinkText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.caption,
  },
  wifiWrapper: {
    marginLeft: 2,
  },
  titleWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.body,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  rightWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: 90,
  },
});