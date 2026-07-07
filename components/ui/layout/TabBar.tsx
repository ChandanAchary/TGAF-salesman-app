import { Href, router } from "expo-router";
import { CaretLeft, House } from "phosphor-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WifiButtonSmall from "../WifiButtonSmall";
import { Theme } from "@/constants/Theme";

interface TabBarProps {
  title?: string,
  customLink?: { name: string; path: Href },
  children?: React.ReactNode,
  opacity?: number
  showHomeButton?: boolean
}

export default function TabBar({ title, customLink, children, opacity, showHomeButton = true }: TabBarProps) {
  
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
      { opacity: opacity ?? 1 }
    ]}>
      <View style={styles.topRow}>
        
        {/* Left Side Navigation Pills */}
        <View style={styles.navigationWrapper}>
          
          {/* Back Trigger */}
          <TouchableOpacity 
            onPress={handleBack} 
            style={[
              styles.navButton,
              customLink ? styles.customLinkButton : null
            ]}
            activeOpacity={0.7}
          >
            <CaretLeft size={20} color={Theme.colors.primary} weight="bold" />
            {customLink && (
              <Text style={styles.customLinkText} numberOfLines={1}>
                {customLink.name}
              </Text>
            )}
          </TouchableOpacity>

          {/* Home Trigger */}
          {showHomeButton && (
            <TouchableOpacity 
              onPress={handleHome} 
              style={styles.navButton}
              activeOpacity={0.7}
            >
              <House size={20} color={Theme.colors.primary} weight="bold" />
            </TouchableOpacity>
          )}

          {/* Small status indicators */}
          <View style={styles.wifiWrapper}>
            <WifiButtonSmall />
          </View>
        </View>

        {/* Centered Title */}
        <View style={styles.titleWrapper}>
          <Text style={styles.titleText}>{title}</Text>
        </View>

        {/* Empty matching right space to balance title centering */}
        <View style={styles.rightBuffer} />
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    zIndex: 10,
    ...Theme.shadows.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navigationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  navButton: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: Theme.radius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  customLinkButton: {
    flexDirection: "row",
    paddingRight: 14,
    gap: 4,
    borderRadius: Theme.radius.md,
  },
  customLinkText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.caption,
    color: Theme.colors.primary,
  },
  wifiWrapper: {
    marginLeft: 2,
  },
  titleWrapper: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h3,
    color: Theme.colors.text.primary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  rightBuffer: {
    flex: 1, // Balanced flex matches navigationWrapper to keep title center-aligned
  },
});