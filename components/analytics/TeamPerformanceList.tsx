import React, { useState, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { TeamMember } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import Pfp from "@/components/lazy/Pfp";
import { router } from "expo-router";
import { useUserStore } from "@/store";

const DEFAULT_VISIBLE = 2;

interface TeamPerformanceListProps {
  team: TeamMember[];
}

type SortOption = "sales" | "collection" | "visits" | "attendance" | "targetAchievement";

export default function TeamPerformanceList({ team }: TeamPerformanceListProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  const [sortBy, setSortBy] = useState<SortOption>("sales");
  const [expanded, setExpanded] = useState(false);
  const setScrollEnabled = useUserStore((state) => state.setScrollEnabled);

  const sortedTeam = useMemo(() => {
    return [...team].sort((a, b) => {
      if (sortBy === "sales") return b.sales - a.sales;
      if (sortBy === "collection") return b.collection - a.collection;
      if (sortBy === "visits") return b.visits - a.visits;
      if (sortBy === "attendance") return b.attendance - a.attendance;
      if (sortBy === "targetAchievement") return b.targetAchievement - a.targetAchievement;
      return 0;
    });
  }, [team, sortBy]);

  const visibleTeam = expanded ? sortedTeam : sortedTeam.slice(0, DEFAULT_VISIBLE);
  const hasMore = sortedTeam.length > DEFAULT_VISIBLE;

  const getStatusColor = (status: TeamMember["status"]) => {
    if (status === "Present") return { text: "#10B981", bg: isDark ? "rgba(16, 185, 129, 0.15)" : "#E6FBF3" };
    if (status === "Absent") return { text: "#EF4444", bg: isDark ? "rgba(239, 68, 68, 0.15)" : "#FDF2F2" };
    if (status === "Late") return { text: "#F59E0B", bg: isDark ? "rgba(245, 158, 11, 0.15)" : "#FFFBEB" };
    return { text: "#3B82F6", bg: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }; // Leave
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        Team Scorecard
      </Text>

      {/* Sorting Tabs */}
      <View style={styles.sortSection}>
        <Text style={[styles.sortLabel, { color: colors.text.muted }]}>Sort by:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortTabsContainer}
          style={styles.sortScrollView}
          onTouchStart={() => setScrollEnabled?.(false)}
          onTouchEnd={() => setScrollEnabled?.(true)}
          onTouchCancel={() => setScrollEnabled?.(true)}
        >
          {(["sales", "collection", "visits", "attendance", "targetAchievement"] as SortOption[]).map((option) => {
            const isActive = sortBy === option;
            const label = option === "targetAchievement" ? "Target %" : option.toUpperCase();
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setSortBy(option)}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: isActive ? colors.primary : isDark ? "#1E293B" : "#F1F5F9",
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: isActive ? "#FFFFFF" : colors.text.secondary, fontWeight: isActive ? "600" : "500" },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Employee List */}
      <View style={styles.list}>
        {visibleTeam.map((member, index) => {
          const statusColors = getStatusColor(member.status);
          return (
            <TouchableOpacity
              key={member.id}
              onPress={() => {
                router.push(`/screens/supervisor/SalesmanStats?salesmanId=${encodeURIComponent(member.id)}`);
              }}
              style={[
                styles.memberCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
              activeOpacity={0.9}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>

              <Pfp src={member.avatar} alt={member.name} size={44} />

              <View style={styles.infoWrapper}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.text.primary }]}>{member.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <Text style={[styles.statusText, { color: statusColors.text }]}>
                      {member.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.role, { color: colors.text.muted }]}>{member.role}</Text>

                {/* Score Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCell}>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      ₦{member.sales.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Sales</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      ₦{member.collection.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Collec.</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      {member.targetAchievement}%
                    </Text>
                    <Text style={styles.statLabel}>Target</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>
                      {member.attendance}%
                    </Text>
                    <Text style={styles.statLabel}>Attend.</Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward-outline" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          );
        })}
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
              : `Show ${sortedTeam.length - DEFAULT_VISIBLE} More`}
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
  sortSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sortScrollView: {
    flex: 1,
    marginLeft: 6,
  },
  sortTabsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  sortLabel: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 10,
  },
  list: {
    gap: 10,
  },
  memberCard: {
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
  rankBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 26,
  },
  rankText: {
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.bold,
    color: "#64748B",
  },
  infoWrapper: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  name: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 13,
  },
  role: {
    fontSize: 10,
    marginTop: -2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 8,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 4,
  },
  statCell: {
    flex: 1,
    alignItems: "flex-start",
  },
  statValue: {
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 1,
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
