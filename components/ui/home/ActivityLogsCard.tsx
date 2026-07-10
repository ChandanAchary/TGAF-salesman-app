import { API_ROUTES } from "@/constants/ApiRoutes"
import { api } from "@/lib/axios/axios"
import { ErrorResponse, Response } from "@/lib/types/types";
import { StartSalesmanActivityLogParams } from "@/shared/models/salesman";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Theme, useAppTheme } from "@/constants/Theme";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const primary = Theme.colors.primary;
const primaryLight = Theme.colors.primaryLight;
const border = Theme.colors.border;
const textColors = Theme.colors.text;
import { formatDistanceToNow } from "date-fns";

interface ActivityLog extends Response {
  data: {
    id: string;
    createdAt: Date;
    salesmanId: string;
    activity: {
      name: string;
      id: string;
      description: string | null;
    };
    endTime: Date | null;
    activityId: string;
  }[]
}

interface GetActivityOptions extends Response {
  data: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    description: string | null;
  }[]
}

export default function ActivityLogsCard() {
  const queryClient = useQueryClient();
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  const getActivityLogs = useQuery({
    queryKey: ['getMyActivityLogs'],
    queryFn: async () => {
      const res = await api.get<ActivityLog>(API_ROUTES.ACTIVITY.GET_MY_ACTIVITY_LOGS);
      return res.data;
    }
  });

  const getActivityOptions = useQuery({
    queryKey: ['getActivities'],
    queryFn: async () => {
      const res = await api.get<GetActivityOptions>(API_ROUTES.ACTIVITY.GET_ACTIVITIES);
      return res.data;
    }
  });

  const ongoingActivity = (getActivityLogs.data?.data || []).find(log => log && log.endTime === null);

  const startActivityMutation = useMutation({
    mutationFn: async (data: StartSalesmanActivityLogParams) => {
      const res = await api.post(API_ROUTES.ACTIVITY.START_LOG, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getMyActivityLogs'] });
      setShowStartModal(false);
      setSelectedActivityId("");
      Toast.show({
        type: 'success',
        text1: 'Activity Started',
        text2: 'The activity has been started successfully',
      });
    },
    onError: (error: ErrorResponse) => {
      Toast.show({
        type: 'error',
        text1: 'Activity Start Failed',
        text2: error.response?.data?.message || "Couldn't start the activity",
      });
    }
  });

  const endActivityMutation = useMutation({
    mutationFn: async (activityLogId: string) => {
      const res = await api.post(API_ROUTES.ACTIVITY.END_LOG(activityLogId));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getMyActivityLogs'] });
      Toast.show({
        type: 'success',
        text1: 'Activity Ended',
        text2: 'The activity has been ended successfully',
      });
    },
    onError: (error: ErrorResponse) => {
      Toast.show({
        type: 'error',
        text1: 'Activity End Failed',
        text2: error.response?.data?.message || "Couldn't end the activity",
      });
    }
  });

  const handleStartActivity = () => {
    if (!selectedActivityId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select an activity',
      });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startActivityMutation.mutate({ activityId: selectedActivityId });
  };

  const handleEndActivity = () => {
    if (!ongoingActivity) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    endActivityMutation.mutate(ongoingActivity.id);
  };

  const openStartModal = () => {
    Haptics.selectionAsync();
    setShowStartModal(true);
  };

  if (getActivityLogs.isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading activities...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Stack Effect Cards */}
        <View style={[styles.stackCard, styles.stackCard2, { backgroundColor: colors.surface, borderColor: colors.border }]} />
        <View style={[styles.stackCard, styles.stackCard1, { backgroundColor: colors.surface, borderColor: colors.border }]} />

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Ongoing Activity Section */}
          {ongoingActivity ? (
            <LinearGradient
              colors={isDark ? ['#022c22', '#064e3b'] : ['#E6FDF0', '#C6F6D5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.ongoingContainer, { borderColor: isDark ? '#065f46' : '#86EFAC', borderWidth: 1 }]}
            >
              <View style={styles.ongoingHeader}>
                <Ionicons name="time" size={16} color="#059669" />
                <Text style={[styles.ongoingLabel, { color: '#059669' }]}>Ongoing Activity</Text>
              </View>
              <Text style={[styles.activityName, { color: colors.text.primary }]} numberOfLines={2}>
                {ongoingActivity.activity?.name || "Unknown Activity"}
              </Text>
              <Text style={[styles.duration, { color: colors.text.secondary }]}>
                Started {formatDistanceToNow(new Date(ongoingActivity.createdAt), { addSuffix: true })}
              </Text>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={isDark ? ['#451a03', '#78350f'] : ['#FEF3C7', '#FDE68A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.noActivityContainer, { borderColor: isDark ? '#92400e' : '#FCD34D', borderWidth: 1 }]}
            >
              <MaterialCommunityIcons name="clipboard-check-outline" size={32} color={isDark ? '#F59E0B' : '#D97706'} />
              <Text style={[styles.noActivityText, { color: colors.text.primary }]}>No ongoing activity</Text>
              <Text style={[styles.noActivitySubtext, { color: colors.text.secondary }]}>Start a new activity to track your work</Text>
            </LinearGradient>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {ongoingActivity ? (
              <TouchableOpacity
                style={styles.endButton}
                onPress={handleEndActivity}
                disabled={endActivityMutation.isPending}
                activeOpacity={0.8}
              >
                {endActivityMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="stop-circle" size={20} color="#fff" />
                    <Text style={styles.endButtonText}>End Activity</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.startButton}
                onPress={openStartModal}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={styles.startButtonText}>Start Activity</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Start Activity Modal */}
      <Modal
        visible={showStartModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStartModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowStartModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select New Activity</Text>
              <TouchableOpacity
                onPress={() => setShowStartModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {getActivityOptions.isLoading ? (
              <View style={styles.loadingSelectContainer}>
                <ActivityIndicator size="small" color={primary} />
                <Text style={styles.loadingSelectText}>Loading activities...</Text>
              </View>
            ) : (
              <ScrollView style={styles.selectContainer}>
                {(getActivityOptions.data?.data || []).map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      styles.activityOption,
                      selectedActivityId === activity.id && styles.activityOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedActivityId(activity.id);
                      Haptics.selectionAsync();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.activityOptionContent}>
                      <View style={[
                        styles.radioButton,
                        selectedActivityId === activity.id && styles.radioButtonSelected
                      ]}>
                        {selectedActivityId === activity.id && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={[
                          styles.activityOptionName,
                          selectedActivityId === activity.id && styles.activityOptionNameSelected
                        ]}>
                          {activity.name}
                        </Text>
                        {activity.description && (
                          <Text style={styles.activityDescription} numberOfLines={2}>
                            {activity.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    {selectedActivityId === activity.id && (
                      <Ionicons name="checkmark-circle" size={24} color={primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowStartModal(false);
                  setSelectedActivityId("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedActivityId && styles.confirmButtonDisabled
                ]}
                onPress={handleStartActivity}
                disabled={startActivityMutation.isPending || !selectedActivityId}
              >
                {startActivityMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Start</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 10,
  },
  stackCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stackCard1: {
    transform: [{ translateY: -24 }, { scale: 0.92 }],
    zIndex: -1,
    opacity: 0.9,
  },
  stackCard2: {
    transform: [{ translateY: -44 }, { scale: 0.84 }],
    zIndex: -2,
    opacity: 0.8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 0,
    marginVertical: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: textColors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  ongoingContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  ongoingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ongoingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  duration: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  noActivityContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  noActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
  },
  noActivitySubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  endButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 16,
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  loadingSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  loadingSelectText: {
    fontSize: 14,
    color: textColors.secondary,
  },
  selectContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  activityOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: primary,
  },
  activityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: primary,
  },
  activityInfo: {
    flex: 1,
  },
  activityOptionName: {
    fontSize: 14,
    color: '#475569',
  },
  activityOptionNameSelected: {
    color: '#1E293B',
  },
  activityDescription: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: primary,
  },
  confirmButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});