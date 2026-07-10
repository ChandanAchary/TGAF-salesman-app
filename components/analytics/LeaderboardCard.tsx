import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TeamMember } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import Pfp from "@/components/lazy/Pfp";

const DEFAULT_VISIBLE = 3;

interface LeaderboardCardProps {
  team: TeamMember[];
}

type TabType = "sales" | "collection" | "target";

export default function LeaderboardCard({ team }: LeaderboardCardProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  const [activeTab, setActiveTab] = useState<TabType>("sales");
  const [expanded, setExpanded] = useState(false);

  const sortedList = [...team].sort((a, b) => {
    if (activeTab === "sales") return b.sales - a.sales;
    if (activeTab === "collection") return b.collection - a.collection;
    return b.targetAchievement - a.targetAchievement; // target
  });

  const visibleList = expanded ? sortedList : sortedList.slice(0, DEFAULT_VISIBLE);
  const hasMore = sortedList.length > DEFAULT_VISIBLE;

  const getCrownColor = (idx: number) => {
    if (idx === 0) return "#FFD700"; // Gold
    if (idx === 1) return "#C0C0C0"; // Silver
    return "#CD7F32"; // Bronze
  };

  const getMetricLabel = (item: TeamMember) => {
    if (activeTab === "sales") return `₦${item.sales.toLocaleString()}`;
    if (activeTab === "collection") return `₦${item.collection.toLocaleString()}`;
    return `${item.targetAchievement}%`;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        Top Performers
      </Text>

      {/* Tabs */}
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab("sales")}
          style={[
            styles.tab,
            activeTab === "sales" && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "sales" ? "#FFFFFF" : colors.text.secondary,
                fontWeight: activeTab === "sales" ? "600" : "500",
              },
            ]}
          >
            Sales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("collection")}
          style={[
            styles.tab,
            activeTab === "collection" && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "collection" ? "#FFFFFF" : colors.text.secondary,
                fontWeight: activeTab === "collection" ? "600" : "500",
              },
            ]}
          >
            Collections
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("target")}
          style={[
            styles.tab,
            activeTab === "target" && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "target" ? "#FFFFFF" : colors.text.secondary,
                fontWeight: activeTab === "target" ? "600" : "500",
              },
            ]}
          >
            Targets
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard Cards */}
      <View style={styles.podiumList}>
        {visibleList.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <View style={styles.rankWrapper}>
              <Ionicons
                name="trophy"
                size={18}
                color={idx < 3 ? getCrownColor(idx) : "#94A3B8"}
              />
              <Text style={[styles.rankLabel, { color: colors.text.primary }]}>
                #{idx + 1}
              </Text>
            </View>

            <Pfp src={item.avatar} alt={item.name} size={36} />

            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.role, { color: colors.text.muted }]}>{item.role}</Text>
            </View>

            <View style={styles.metricWrapper}>
              <Text style={[styles.value, { color: colors.primary }]}>
                {getMetricLabel(item)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Show More / Show Less Button */}
      {hasMore && (
        <TouchableOpacity
          onPress={() => setExpanded(prev => !prev)}
          style={[
            styles.showMoreBtn,
            {
              backgroundColor: isDark ? "rgba(59,130,246,0.12)" : "#EFF6FF",
              borderColor: isDark ? "rgba(59,130,246,0.3)" : "#BFDBFE",
            },
          ]}
          activeOpacity={0.75}
        >
          <Text style={[styles.showMoreText, { color: colors.primary }]}>
            {expanded
              ? "Show Less"
              : `Show ${sortedList.length - DEFAULT_VISIBLE} More`}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={14}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  tabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
  },
  podiumList: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    gap: 12,
  },
  rankWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 42,
  },
  rankLabel: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  role: {
    fontSize: 9,
  },
  metricWrapper: {
    alignItems: "flex-end",
  },
  value: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  showMoreText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
});
