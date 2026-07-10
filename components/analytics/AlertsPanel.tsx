import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, Linking, Alert, ScrollView } from "react-native";
import { AnalyticsAlert } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";

interface AlertsPanelProps {
  alerts: AnalyticsAlert[];
}

const MOCK_ALERT_DETAILS: Record<string, {
  title: string;
  details: string;
  checklist?: string[];
  actions: { label: string; icon: keyof typeof Ionicons.glyphMap; actionType: "call" | "toast" | "close"; value?: string }[];
}> = {
  "1": {
    title: "Missed Allen Avenue Visits",
    details: "Tunde Oshin missed 2 scheduled merchant check-ins on the Allen Avenue route today. Customers at these retail outlets reported no salesman contact by scheduled hours.",
    checklist: [
      "❌ Allen Avenue Pharmacy (Missed - 09:00 AM)",
      "❌ Allen Square Spar (Missed - 09:20 AM)",
      "✅ Allen Retail Hub (Completed check-in at 08:45 AM)"
    ],
    actions: [
      { label: "Call Tunde Oshin", icon: "call-outline", actionType: "call", value: "+2347088715499" },
      { label: "Re-Route / Flag Alert", icon: "flag-outline", actionType: "toast", value: "Alert logged. Re-routing task has been dispatched to Tunde." }
    ]
  },
  "2": {
    title: "Daily Sales Target Milestones",
    details: "Your branch team (Lagos Branch) is performing exceptionally well today, achieving 90% of the cumulative daily sales target of ₦15,000,000 by noon.",
    checklist: [
      "🎯 Daily Sales Target: ₦15,000,000",
      "📈 Achieved Sales: ₦14,250,000",
      "🔥 Remaining Needed: ₦750,000"
    ],
    actions: [
      { label: "Broadcast Kudos to Team", icon: "megaphone-outline", actionType: "toast", value: "Broadcasted 'Exceptional performance, keep it up!' motivation alert to all branch agents." }
    ]
  }
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  
  const [selectedAlert, setSelectedAlert] = useState<AnalyticsAlert | null>(null);

  if (!alerts || alerts.length === 0) return null;

  const handleAction = (actionType: "call" | "toast" | "close", value?: string) => {
    if (actionType === "call" && value) {
      Linking.openURL(`tel:${value}`).catch(() => {
        Alert.alert("Error", "Unable to open phone dialer");
      });
    } else if (actionType === "toast" && value) {
      Alert.alert("Action Dispatched", value);
      setSelectedAlert(null);
    } else {
      setSelectedAlert(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        Operational Alerts
      </Text>
      
      <View style={styles.list}>
        {alerts.map((alert) => {
          const isDanger = alert.type === "danger";
          const isWarning = alert.type === "warning";
          const alertColor = isDanger ? "#EF4444" : isWarning ? "#F59E0B" : "#3B82F6";
          const alertBg = isDanger 
            ? (isDark ? "rgba(239, 68, 68, 0.15)" : "#FDF2F2") 
            : isWarning 
            ? (isDark ? "rgba(245, 158, 11, 0.15)" : "#FFFBEB") 
            : (isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF");

          return (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertCard,
                { backgroundColor: alertBg, borderColor: alertColor },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedAlert(alert)}
            >
              <Ionicons
                name={
                  isDanger
                    ? "alert-circle-outline"
                    : isWarning
                    ? "warning-outline"
                    : "information-circle-outline"
                }
                size={20}
                color={alertColor}
              />
              <View style={styles.textWrapper}>
                <Text style={[styles.message, { color: colors.text.primary }]}>
                  {alert.message}
                </Text>
                <Text style={[styles.time, { color: colors.text.muted }]}>
                  {alert.timestamp}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={alertColor} style={styles.arrowIcon} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Alert Details Modal */}
      <Modal
        visible={selectedAlert !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAlert(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedAlert(null)}>
          <Pressable 
            style={[
              styles.modalContent, 
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            {selectedAlert && (() => {
              const details = MOCK_ALERT_DETAILS[selectedAlert.id] || {
                title: "Alert Action Center",
                details: selectedAlert.message,
                actions: []
              };

              const isDanger = selectedAlert.type === "danger";
              const isWarning = selectedAlert.type === "warning";
              const alertColor = isDanger ? "#EF4444" : isWarning ? "#F59E0B" : "#3B82F6";

              return (
                <View style={styles.modalBody}>
                  {/* Title & Icon Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleRow}>
                      <Ionicons
                        name={
                          isDanger
                            ? "alert-circle"
                            : isWarning
                            ? "warning"
                            : "information-circle"
                        }
                        size={24}
                        color={alertColor}
                      />
                      <Text style={[styles.modalTitleText, { color: colors.text.primary }]}>
                        {details.title}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedAlert(null)} style={styles.closeBtn}>
                      <Ionicons name="close" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={styles.detailsScroll}>
                    {/* Timestamp Banner */}
                    <Text style={[styles.modalTime, { color: colors.text.muted }]}>
                      Received at {selectedAlert.timestamp}
                    </Text>

                    {/* Long details paragraph */}
                    <Text style={[styles.modalDetailsText, { color: colors.text.primary }]}>
                      {details.details}
                    </Text>

                    {/* Checklist checklist indicators (e.g. store items) */}
                    {details.checklist && (
                      <View style={[styles.checklistCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                        <Text style={[styles.checklistTitle, { color: colors.text.secondary }]}>
                          Route Checklist Status:
                        </Text>
                        {details.checklist.map((item, idx) => (
                          <Text key={idx} style={[styles.checklistItem, { color: colors.text.primary }]}>
                            {item}
                          </Text>
                        ))}
                      </View>
                    )}
                  </ScrollView>

                  {/* Actions Grid */}
                  <View style={styles.modalFooter}>
                    {details.actions.map((action, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        activeOpacity={0.85}
                        onPress={() => handleAction(action.actionType, action.value)}
                      >
                        <Ionicons name={action.icon} size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>{action.label}</Text>
                      </TouchableOpacity>
                    ))}
                    
                    <TouchableOpacity
                      style={[
                        styles.actionButton, 
                        styles.dismissBtn, 
                        { backgroundColor: isDark ? "#334155" : "#E2E8F0" }
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedAlert(null)}
                    >
                      <Text style={[styles.dismissBtnText, { color: colors.text.primary }]}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>
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
  list: {
    gap: 10,
  },
  alertCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    alignItems: "center",
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  message: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  time: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: 10,
  },
  arrowIcon: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: "75%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalBody: {
    width: "100%",
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 10,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  modalTitleText: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bold,
    flex: 1,
  },
  closeBtn: {
    padding: 2,
  },
  detailsScroll: {
    marginVertical: 10,
    maxHeight: 250,
  },
  modalTime: {
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.regular,
    marginBottom: 8,
  },
  modalDetailsText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.typography.fontFamily.medium,
    marginBottom: 12,
  },
  checklistCard: {
    padding: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 6,
  },
  checklistTitle: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.bold,
    marginBottom: 4,
  },
  checklistItem: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  modalFooter: {
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  dismissBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CBD5E1",
  },
  dismissBtnText: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
});
