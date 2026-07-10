import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useUserStore } from "@/store";
import { useAnalytics } from "../../hooks/useAnalytics";
import { FilterType } from "../../lib/types/analytics";
import AnalyticsFilter from "./AnalyticsFilter";
import CityHeadDashboard from "./CityHeadDashboard";
import FieldExecutiveDashboard from "./FieldExecutiveDashboard";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExecutiveAnalyticsDashboard() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  
  // Resolve active role
  const rawRole = useUserStore((state) => state.salesmanType);
  const salesmanType = (rawRole === "CITYHEAD" || rawRole === "FIELDEXECUTIVE") ? rawRole : undefined;

  const isCityHead = salesmanType === "CITYHEAD";

  // Active filter state
  const [filterType, setFilterType] = useState<FilterType>("TODAY");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const selectedBranch = "Lagos Branch";
  const [selectedArea, setSelectedArea] = useState<string>("All Areas");
  const [selectedMarket, setSelectedMarket] = useState<string>("All Markets");

  useEffect(() => {
    setSelectedArea(isCityHead ? "All Areas" : "Ikeja Area");
    setSelectedMarket("All Markets");
  }, [salesmanType]);

  const { data, isLoading, isError, refetch, isRefetching } = useAnalytics(salesmanType, {
    filterType,
    startDate,
    endDate,
    branch: selectedBranch,
    area: selectedArea,
    market: selectedMarket,
  });

  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    setSelectedMarket("All Markets");
  };

  const handleMarketChange = (market: string) => {
    setSelectedMarket(market);
  };

  const handleFilterChange = (filter: FilterType, start?: string, end?: string) => {
    setFilterType(filter);
    setStartDate(start);
    setEndDate(end);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (isError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Theme.colors.danger} />
        <Text style={[styles.errorText, { color: colors.text.primary }]}>
          Failed to load analytics dashboard
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.retryBtnText}>Retry Loading</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={isDark ? "#FFFFFF" : colors.primary}
          />
        }
      >
        {/* Dynamic Header details */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Executive Analytics
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {salesmanType === "CITYHEAD"
              ? "Aggregated Regional Control Dashboard"
              : "Team Performance Dashboard"}
          </Text>
        </View>

        {/* Date Range Segment Selector (Bypasses parent padding, scrolls edge-to-edge) */}
        {/* Region & Timeframe Double Dropdown Filter */}
        <AnalyticsFilter
          activeFilter={filterType}
          onChangeFilter={handleFilterChange}
          startDate={startDate}
          endDate={endDate}
          selectedBranch={selectedBranch}
          selectedArea={selectedArea}
          onChangeArea={handleAreaChange}
          selectedMarket={selectedMarket}
          onChangeMarket={handleMarketChange}
          showHierarchyFilters={salesmanType === "CITYHEAD" || salesmanType === "FIELDEXECUTIVE"}
          isCityHead={isCityHead}
        />

        {/* Dashboard Body Content */}
        <View style={styles.bodyContent}>
          {isLoading ? (
            <View style={styles.loaderWrapper}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                Analyzing region metrics...
              </Text>
            </View>
          ) : data ? (
            salesmanType === "CITYHEAD" ? (
              <CityHeadDashboard data={data} loading={isLoading} />
            ) : (
              <FieldExecutiveDashboard data={data} loading={isLoading} />
            )
          ) : (
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                No analytics summary records found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 110, // Generous padding to prevent overlap with bottom navigation bar tabs
  },
  header: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  bodyContent: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 20,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 11,
    marginTop: 2,
  },
  loaderWrapper: {
    marginTop: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 11,
  },
  centerContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 13,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    fontFamily: Theme.typography.fontFamily.bold,
    color: "#FFFFFF",
    fontSize: 12,
  },
  emptyText: {
    fontSize: 12,
  },
});
