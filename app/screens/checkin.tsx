import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WifiButton from "@/components/ui/WifiButton";
import { useEffect, useState } from "react";
import { Theme } from "@/constants/Theme";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useRouter, useLocalSearchParams } from "expo-router";
import { formatDate } from "@/lib/date/dateFormater";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/axios";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { useUserStore } from "@/store";
import { errorHandler } from "@/lib/axios/errorHandler";
import { salesmanType } from "@/shared/zod";
import { storageManager } from "@/lib/asyncStorage/asnycStoreMannager";
import Avatar from "@/components/lazy/Avatar";
import { AppConfig } from "@/constants/AppConfig";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export interface myDataQuery {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  password: string;
  bank: string;
  address: string;
  addressProof: string;
  avatar: string | null;
  hierarchyItemId: string;
  salesmanType: salesmanType;
}

export default function Checkin() {
  const { fromMenu } = useLocalSearchParams();
  const startPoint = "HOME";
  const isOnline = useIsOnline();
  const router = useRouter();
  const now = new Date();
  const { fullDate, timeOnly } = formatDate(now);
  const setUser = useUserStore((state) => state.setUser);
  const [selectedActivity, setSelectedActivity] = useState<"WORKING" | "TASK_FORCE" | "ON_LEAVE" | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth/login");
    }
  };

  const handleActivitySelect = (activity: "WORKING" | "TASK_FORCE" | "ON_LEAVE") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedActivity(activity);

    if (!isOnline) {
      alert("You need an internet connection to continue");
      return;
    }

    if (activity === "ON_LEAVE") {
      router.replace("/screens/attendence/applyLeave");
      return;
    }

    router.replace(`/screens/Selfi?startPoint=${encodeURIComponent(startPoint)}&activity=${encodeURIComponent(activity)}`);
  };

  const myDetailsQuery = useQuery<{ success: Boolean, message: String, data: myDataQuery }>({
    queryKey: ["myDetails"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.AUTH.ME);
      return res.data;
    }
  });

  const checkinCheckQuery = useQuery({
    queryKey: ["checkinCheck"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.ATTENDENCE.IS_CHECKED_IN);
      return res.data;
    },
  });

  useEffect(() => {
    if (myDetailsQuery.isError) {
      const { status } = errorHandler(myDetailsQuery.error)
      if (status == 401 || status == 403) {
        isOnline ? router.replace("/auth/login") : confirm("Internet connection is required to login. Would you like to retry?") && router.replace("/auth/login");
      }
    }
  }, [myDetailsQuery.error]);

  useEffect(() => {
    if (myDetailsQuery.data) {
      setUser(myDetailsQuery.data.data);
    }
    async function setUserDetails(data: myDataQuery) {
      try {
        await storageManager.set(AppConfig.USER_DETAILS, `${JSON.stringify(data)}`);
      }
      catch (error) {
        console.error("Error setting user details in storage:", error);
      }
    }
    if (myDetailsQuery.isSuccess && myDetailsQuery.data?.data) {
      setUserDetails(myDetailsQuery.data.data);
    }
  }, [myDetailsQuery.data]);

  useEffect(() => {
    if (checkinCheckQuery.data?.data && myDetailsQuery.data?.data && checkinCheckQuery.isSuccess && myDetailsQuery.isSuccess) {
      if (fromMenu === "true") {
        router.replace("/screens/checkout");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [checkinCheckQuery.data, myDetailsQuery.data, fromMenu]);

  if (checkinCheckQuery.isLoading || myDetailsQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {isOnline ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        ) : (
          <View style={styles.offlineContainer}>
            <Text style={styles.offlineText}>No internet connection</Text>
          </View>
        )}
      </View>
    );
  }

  if (myDetailsQuery.data?.data) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={Theme.colors.gradients.primary}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
                  <Feather name="chevron-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Avatar
                  src={myDetailsQuery.data?.data.avatar ?? undefined}
                  alt={myDetailsQuery.data?.data.name ?? "N"}
                  size={50}
                />
                <View style={styles.userText}>
                  <Text style={styles.userName}>
                    Hi, {myDetailsQuery.data?.data.name.split(" ")[0]}
                  </Text>
                  <Text style={styles.userRole}>
                    {myDetailsQuery.data?.data.salesmanType.replace("_", " ")}
                  </Text>
                </View>
              </View>
              <View style={styles.wifiButtonWrapper}>
                <WifiButton />
              </View>
            </View>
 
            {/* Date Time Dashboard Card */}
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.05)"]}
              style={styles.dateTimeCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.timeText}>{timeOnly}</Text>
              <Text style={styles.dateText}>{fullDate}</Text>
            </LinearGradient>

            {/* Main Content */}
            <View style={styles.content}>
              <Text style={styles.welcomeText}>Attendance Portal</Text>
              <Text style={styles.instructionText}>
                Ready to start your day? Choose your activity below to begin the check-in process.
              </Text>

              <View style={styles.activityGrid}>
                {/* Regular Shift Card */}
                <TouchableOpacity
                  style={[
                    styles.activityCard,
                    selectedActivity === "WORKING" && styles.activityCardWorkingActive
                  ]}
                  onPress={() => handleActivitySelect("WORKING")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
                    <Feather name="briefcase" size={24} color={Theme.colors.success} />
                  </View>
                  <View style={styles.activityCardText}>
                    <Text style={styles.activityTitle}>Regular Shift</Text>
                    <Text style={styles.activityHint}>Standard route plan visit</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={Theme.colors.text.muted} />
                </TouchableOpacity>

                {/* Special Mission Card */}
                <TouchableOpacity
                  style={[
                    styles.activityCard,
                    selectedActivity === "TASK_FORCE" && styles.activityCardTaskForceActive
                  ]}
                  onPress={() => handleActivitySelect("TASK_FORCE")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
                    <Feather name="zap" size={24} color={Theme.colors.warning} />
                  </View>
                  <View style={styles.activityCardText}>
                    <Text style={styles.activityTitle}>Task Force</Text>
                    <Text style={styles.activityHint}>Special assignments & target beats</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={Theme.colors.text.muted} />
                </TouchableOpacity>

                {/* Apply Leave Card */}
                <TouchableOpacity
                  style={[
                    styles.activityCard,
                    selectedActivity === "ON_LEAVE" && styles.activityCardLeaveActive
                  ]}
                  onPress={() => handleActivitySelect("ON_LEAVE")}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
                    <Feather name="coffee" size={24} color={Theme.colors.danger} />
                  </View>
                  <View style={styles.activityCardText}>
                    <Text style={styles.activityTitle}>Request Time Off</Text>
                    <Text style={styles.activityHint}>Apply for leaves / rest day</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={Theme.colors.text.muted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      {isOnline ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      ) : (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F8FAFC',
  },
  offlineContainer: {
    padding: 16,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.dangerLight,
  },
  offlineText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.danger,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    marginRight: 4,
  },
  userText: {
    gap: 2,
  },
  userName: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h2,
    color: "#FFFFFF",
  },
  userRole: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.caption,
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  wifiButtonWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 4,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  dateTimeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: Theme.radius.xl,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    marginBottom: 20,
  },
  timeText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 42,
    color: "#FFFFFF",
  },
  dateText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.body,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 6,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.xl,
    padding: 24,
    justifyContent: "center",
    ...Theme.shadows.lg,
  },
  welcomeText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h2,
    color: Theme.colors.text.primary,
    textAlign: "center",
  },
  instructionText: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
  },
  activityGrid: {
    width: "100%",
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: Theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 14,
  },
  activityCardWorkingActive: {
    borderColor: Theme.colors.success,
    backgroundColor: "#ECFDF5",
    ...Theme.shadows.sm,
  },
  activityCardTaskForceActive: {
    borderColor: Theme.colors.warning,
    backgroundColor: "#FEF3C7",
    ...Theme.shadows.sm,
  },
  activityCardLeaveActive: {
    borderColor: Theme.colors.danger,
    backgroundColor: "#FEE2E2",
    ...Theme.shadows.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  activityCardText: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.h3,
    color: Theme.colors.text.primary,
  },
  activityHint: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
  },
});