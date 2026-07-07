import { tokenManager } from "@/lib/axios/tokenManager";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View, Alert, ActivityIndicator } from "react-native";
import * as Updates from 'expo-updates';

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const runChecks = async () => {
      try {
        // OTA updates only work in real (non-dev) builds. In Expo Go / dev,
        // checkForUpdateAsync() throws, so skip it and proceed straight in.
        if (__DEV__ || !Updates.isEnabled) {
          setReady(true);
          return;
        }

        // 1. Check for updates
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
                  await Updates.reloadAsync(); // Will reload the whole app
                }
              }
            ]
          );
        } else {
          setReady(true); // No update, proceed
        }
      } catch (error) {
        console.error("Update check failed:", error);
        setReady(true); // Continue anyway
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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: -50,
        backgroundColor: "white"
      }}
    >
      <Image source={require('@/assets/images/logo.png')} style={{ width: 100, height: 100 }} />
      {!ready && <ActivityIndicator size="large" color="black" style={{ marginTop: 20 }} />}
    </View>
  );
}
