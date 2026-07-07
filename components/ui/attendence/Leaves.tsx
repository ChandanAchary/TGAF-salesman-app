import { API_ROUTES } from "@/constants/ApiRoutes";
import { background, primary, secondary } from "@/constants/Colors";
import { useRefreshOnFocus } from "@/hooks/useRefetchOnFocus";
import { api } from "@/lib/axios/axios";
import { Response } from "@/lib/types/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Calendar, CaretRight, Check, Info, Plus } from "phosphor-react-native";
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";
import { format, formatDistance, isAfter, isBefore, subDays } from "date-fns";
import { useEffect } from "react";

interface LeaveResponse extends Response {
  data: {
    startDate: string;
    endDate: string;
    reason: string;
    leaveType: "SICK" | "VACATION" | "PERSONAL" | "OTHER";
    id: string;
    approved: boolean;
    createdAt: string;
  }[]
}

const LeaveTypeConfig = {
  SICK: { label: "Sick Leave", color: "#F59E0B", icon: "thermometer", bg: "#FFFBEB" },
  VACATION: { label: "Vacation", color: "#3B82F6", icon: "umbrella", bg: "#EFF6FF" },
  PERSONAL: { label: "Personal", color: "#8B5CF6", icon: "user", bg: "#F5F3FF" },
  OTHER: { label: "Other", color: "#64748B", icon: "more-horizontal", bg: "#F1F5F9" },
};

export default function Leaves() {
  const router = useRouter();

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      const res = await api.get<LeaveResponse>(API_ROUTES.ATTENDENCE.GET_MY_LEAVES);
      return res.data;
    },
  });

  useRefreshOnFocus(refetch);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getLeaveDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const getLeaveStatus = (approved: boolean, endDate: string) => {
    if (approved) {
      const isActive = isAfter(new Date(), new Date(endDate));
      return isActive ? "Completed" : "Approved";
    }
    return "Pending";
  };

  const getStatusColor = (approved: boolean, endDate: string) => {
    if (approved) {
      const isActive = isAfter(new Date(), new Date(endDate));
      return isActive ? "#10B981" : "#3B82F6";
    }
    return "#F59E0B";
  };

  const getStatusBgColor = (approved: boolean, endDate: string) => {
    if (approved) {
      const isActive = isAfter(new Date(), new Date(endDate));
      return isActive ? "#ECFDF5" : "#EFF6FF";
    }
    return "#FFFBEB";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LEAVES</Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.push("/screens/attendence/applyLeave")}
        >
          <Plus size={18} color={primary} />
          <Text style={styles.applyButtonText}>New Request</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load leaves</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : data?.data && data.data.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {data.data.map((leave) => (
            <View
              key={leave.id}
              style={styles.leaveCard}
            >
              <View style={styles.leaveHeader}>
                <View style={[
                  styles.leaveTypeBadge,
                  { backgroundColor: LeaveTypeConfig[leave.leaveType].bg }
                ]}>
                  <Text style={[
                    styles.leaveTypeText,
                    { color: LeaveTypeConfig[leave.leaveType].color }
                  ]}>
                    {LeaveTypeConfig[leave.leaveType].label}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusBgColor(leave.approved, leave.endDate),
                    borderColor: getStatusColor(leave.approved, leave.endDate)
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(leave.approved, leave.endDate) }
                  ]}>
                    {getLeaveStatus(leave.approved, leave.endDate)}
                  </Text>
                </View>
              </View>

              <Text style={styles.reasonText} numberOfLines={2}>
                {leave.reason}
              </Text>

              <View style={styles.datesContainer}>
                <View style={styles.dateItem}>
                  <Calendar size={16} color="#64748B" />
                  <Text style={styles.dateLabel}>From</Text>
                  <Text style={styles.dateValue}>{formatDate(leave.startDate)}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Calendar size={16} color="#64748B" />
                  <Text style={styles.dateLabel}>To</Text>
                  <Text style={styles.dateValue}>{formatDate(leave.endDate)}</Text>
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.createdAtText}>
                  Submitted {formatDistance(subDays(new Date(), 1), new Date(leave.createdAt))} ago
                </Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {getLeaveDuration(leave.startDate, leave.endDate)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No Leave Requests</Text>
          <Text style={styles.emptyStateText}>You haven't applied for any leaves yet</Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => router.push("/screens/attendence/applyLeave")}
          >
            <Plus size={18} color="#FFF" />
            <Text style={styles.emptyStateButtonText}>Apply for Leave</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary,
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#aaa',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  applyButtonText: {
    color: primary,
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#FECACA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  scrollContainer: {
    paddingBottom: 24,
    gap: 16,
  },
  leaveCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  leaveTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  leaveTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  datesContainer: {
    gap: 16,
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  durationBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  reasonText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  createdAtText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});