import React, { useState } from "react";
import { StyleSheet, Text, View, Modal, FlatList, TouchableOpacity, Linking, Image, TextInput, Platform } from "react-native";
import { TeamMember } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/lazy/Avatar";
import { formatPrice } from "../../lib/formatters/formatter";

interface ActiveStaffModalProps {
  visible: boolean;
  onClose: () => void;
  staffList: TeamMember[];
}

export default function ActiveStaffModal({
  visible,
  onClose,
  staffList,
}: ActiveStaffModalProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter staff who are active (Present or Late)
  const activeStaff = staffList.filter(
    (member) => member.status === "Present" || member.status === "Late"
  );

  const filteredStaff = activeStaff.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text.primary }]}>Active Field Staff</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBarContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.text.secondary} />
          <TextInput
            placeholder="Search active staff by name..."
            placeholderTextColor={colors.text.secondary}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text.primary }]}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Staff List */}
        {filteredStaff.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.text.muted} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No active field staff found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStaff}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const isExpanded = expandedId === item.id;
              
              // Simulate check-in times and odomoter readings based on ID hash
              const checkInTime = item.status === "Late" ? "09:12 AM" : "08:15 AM";
              const idNum = parseInt(item.id.replace(/\D/g, "")) || 1;
              const baseOdo = 12450 + (idNum * 347) % 5230;
              const odometerReading = `${baseOdo.toLocaleString()} km`;

              const mockMarkets = [
                "Ikeja Main Market",
                "Computer Village",
                "Oregun Market",
                "Lekki Phase 1",
                "Surulere Main Market",
                "Yaba Market",
                "Victoria Island Main Market"
              ];
              const startLocation = item.market || mockMarkets[idNum % mockMarkets.length];
              
              return (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: isDark ? 1 : 0,
                    },
                  ]}
                >
                  {/* Row Header */}
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.7}
                  >
                    <Avatar src={item.avatar} alt={item.name} size={44} />
                    <View style={styles.infoCol}>
                      <Text style={[styles.name, { color: colors.text.primary }]}>{item.name}</Text>
                      <Text style={[styles.role, { color: colors.text.secondary }]}>{item.role}</Text>
                    </View>

                    {/* Status Badge */}
                    <View style={styles.badgeCol}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              item.status === "Present"
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(245, 158, 11, 0.12)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: item.status === "Present" ? "#10B981" : "#F59E0B",
                            },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                      <Text style={[styles.checkInTimeText, { color: colors.text.muted }]}>
                        {checkInTime}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={colors.text.secondary}
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>

                  {/* Expanded check-in parameters */}
                  {isExpanded && (
                    <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                      {/* Performance Indicators */}
                      <View style={styles.metricsRow}>
                        <View style={styles.metricBlock}>
                          <Text style={[styles.metricLabel, { color: colors.text.muted }]}>Daily Achieved</Text>
                          <Text style={[styles.metricValue, { color: colors.text.primary }]}>
                            {formatPrice(item.sales)}
                          </Text>
                        </View>
                        <View style={styles.metricBlock}>
                          <Text style={[styles.metricLabel, { color: colors.text.muted }]}>Target Completion</Text>
                          <Text style={[styles.metricValue, { color: colors.primary }]}>
                            {item.targetAchievement}%
                          </Text>
                        </View>
                      </View>

                      {/* Check-In Details Odometer & Selfie */}
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <Ionicons name="speedometer-outline" size={14} color={colors.text.secondary} />
                          <Text style={[styles.detailText, { color: colors.text.secondary }]}>Odometer: <Text style={{ color: colors.text.primary, fontWeight: "600" }}>{odometerReading}</Text></Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                          <Text style={[styles.detailText, { color: colors.text.secondary }]} numberOfLines={1}>
                            Start: {startLocation}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.selfieRow}>
                        <Text style={[styles.selfieLabel, { color: colors.text.muted }]}>Check-In Selfie</Text>
                        <View style={[styles.selfiePlaceholder, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
                          <Ionicons name="image-outline" size={24} color={colors.text.muted} />
                          <Text style={[styles.selfieText, { color: colors.text.muted }]}>Odometer Start Selfie Verified</Text>
                        </View>
                      </View>

                      {/* Actions */}
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleCall("08012345678")}
                        >
                          <Ionicons name="call" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.actionButtonText}>Call Staff</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginTop: Platform.OS === "ios" ? 44 : 0,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  infoCol: {
    flex: 1,
    marginLeft: 10,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  role: {
    fontSize: 11,
  },
  badgeCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  checkInTimeText: {
    fontSize: 9,
  },
  expandedContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 12,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricBlock: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  metricValue: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 10,
    flex: 1,
  },
  selfieRow: {
    gap: 6,
  },
  selfieLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  selfiePlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  selfieText: {
    fontSize: 10,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
