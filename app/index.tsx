import { tokenManager } from "@/lib/axios/tokenManager";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Image, View, Alert, ActivityIndicator, Animated, Easing, Text, StyleSheet } from "react-native";
import * as Updates from 'expo-updates';
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "@/constants/Theme";

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    const runChecks = async () => {
      try {
        if (__DEV__ || !Updates.isEnabled) {
          setReady(true);
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert(
            "🚀 New Update Available",
            "Do you want to apply it now?",
            [
              {
                text: "Later",
                onPress: () => setReady(true),
                style: "cancel"
              },
              {
                text: "Update Now",
                onPress: async () => {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                }
              }
            ]
          );
        } else {
          setReady(true);
        }
      } catch (error) {
        console.error("Update check failed:", error);
        setReady(true);
      }
    };

    runChecks();
  }, []);

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      if (!ready) return;

      try {
        const token = await tokenManager.getToken();
        console.log("FETCHED TOKEN IN INDEX: ", token);
        if (!token) {
          router.replace("/auth/login");
        } else {
          router.replace("/screens/checkin");
        }
      } catch (err) {
        console.error("Token check error:", err);
        Alert.alert("Startup error", "Contact developer.");
      }
    };

    checkTokenAndNavigate();
  }, [ready]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Theme.colors.gradients.primary}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoWrapper}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.brandName}>NexForce</Text>
        <Text style={styles.subtitle}>Smart Sales Execution Platform</Text>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 16,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  brandName: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 28,
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 6,
  },
  loadingWrapper: {
    marginTop: 40,
    height: 20,
    justifyContent: "center",
  },
});
