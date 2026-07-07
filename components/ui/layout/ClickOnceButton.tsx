import { ActivityIndicator, StyleSheet, View } from 'react-native'
import React from 'react'
import { primary } from '@/constants/Colors';

export default function ClickOnce({ children, isLoading }: { children: React.ReactNode, isLoading: boolean }) {

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({})