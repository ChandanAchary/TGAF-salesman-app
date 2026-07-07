import React from "react";
import NotificationButton from "@/components/ui/NotificationButton";
import UserDetailBar from "@/components/ui/UserDetailBar";
import { StyleSheet, View, ScrollView, ActivityIndicator, RefreshControl, ImageBackground, Text } from "react-native";
import AttendanceCard from "@/components/ui/home/AttendanceCatd";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/axios";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { Theme } from "@/constants/Theme";
import { useState } from "react";
import { useUserStore } from "@/store";
import TargetChart from "@/components/ui/home/TargetChart";
import OutletChart from "@/components/ui/home/OutletChart";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityLogsCard from "@/components/ui/home/ActivityLogsCard";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

interface Target {
  id: string;
  tenantId: string;
  salesmanId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  routeId: string;
  date: Date;
  target: number;
  actual: number;
  route: Route;
}

interface Route {
  id: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  hierarchyItemId: string;
  RouteCustomer: {
    id: string;
    tenantId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    routeId: string;
    customerId: string;
  }[];
}

interface Attendance {
  id: string;
  tenantId: string;
  salesmanId: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  startPoint: string;
  selfieUrl: string;
  oddometerUrl: string | null;
  updatedBy: string | null;
}

interface IndexQueryData {
  success: boolean;
  message: string;
  data: {
    target: Target;
    attendance: Attendance[];
  };
}

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const salesmanType = useUserStore((state) => state.salesmanType);

  const indexQuery = useQuery({
    queryKey: ["index"],
    queryFn: async () => {
      const res = await api.get<IndexQueryData>(API_ROUTES.ATTENDENCE.GET_INDEX);
      return res.data;
    },
  });

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await indexQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ImageBackground
        source={require("@/assets/images/dark_blue_blurry_light_beam.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      {/* Visual fade transition from top dark image to slate background */}
      <LinearGradient
        colors={["rgba(15, 23, 42, 0.4)", "rgba(248, 250, 252, 0.95)", "#F8FAFC"]}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.4, 0.65]}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <UserDetailBar />
            <View style={styles.headerRight}>
              <View style={styles.notificationWrapper}>
                <NotificationButton />
              </View>
            </View>
          </View>

          {/* Cards & Content Grid */}
          <View style={styles.contentGrid}>
            {indexQuery.data ? (
              <>
                {/* Tracker Section Header */}
                <View style={styles.sectionHeader}>
                  <Feather name="activity" size={16} color={Theme.colors.text.secondary} />
                  <Text style={styles.sectionHeaderText}>Activity Tracking</Text>
                </View>
                <ActivityLogsCard />

                {salesmanType !== "OFFICE" && (
                  <>
                    {/* Performance Summary Header */}
                    <View style={styles.sectionHeader}>
                      <Feather name="bar-chart-2" size={16} color={Theme.colors.text.secondary} />
                      <Text style={styles.sectionHeaderText}>Performance Summary</Text>
                    </View>
                    <View style={styles.cardsRow}>
                      <OutletChart />
                      <TargetChart target={indexQuery.data.data.target} />
                    </View>
                  </>
                )}

                {/* Log History Section Header */}
                <View style={styles.sectionHeader}>
                  <Feather name="calendar" size={16} color={Theme.colors.text.secondary} />
                  <Text style={styles.sectionHeaderText}>Attendance Log</Text>
                </View>
                <AttendanceCard attendence={indexQuery.data.data.attendance} />
              </>
            ) : (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120, // Add generous padding to avoid overlap with bottom navigation bar
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notificationWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 6,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  contentGrid: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: -4,
  },
  sectionHeaderText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardsRow: {
    gap: 20,
  },
  loadingWrapper: {
    marginTop: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});