import React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { Theme } from "@/constants/Theme";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Theme.colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  text: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.secondary,
  },
});
