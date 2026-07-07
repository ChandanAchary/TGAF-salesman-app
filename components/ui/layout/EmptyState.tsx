import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Theme } from "@/constants/Theme";
import { LinearGradient } from "expo-linear-gradient";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionText?: string;
  onActionPress?: () => void;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionText,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.primaryLight, "rgba(99,102,241,0.03)"]}
        style={styles.iconWrapper}
      >
        {icon}
      </LinearGradient>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {actionText && onActionPress && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h2,
    color: Theme.colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Theme.radius.md,
    ...Theme.shadows.sm,
  },
  buttonText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.bodySm,
    color: "#FFFFFF",
  },
});
