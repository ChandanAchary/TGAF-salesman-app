import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "react-native";
import { setupOnlineManager } from "@/lib/setupOnlineManager";
import Toast from "react-native-toast-message";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold 
} from "@expo-google-fonts/inter";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 2 } },
  });

  setupOnlineManager();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
          animation: "none",
          gestureEnabled: false
        }}
      />

      <Toast 
        position="top"
        visibilityTime={3000}
        autoHide={true}
        topOffset={40}
        swipeable={true}
      />
    </QueryClientProvider>
  );
}

