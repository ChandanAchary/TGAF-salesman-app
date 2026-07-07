import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { ApplyForLeaveParams } from "@/shared/zod";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { primary } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

const LEAVE_TYPES = [
  { label: "Sick Leave", value: "SICK", icon: "thermometer" },
  { label: "Vacation", value: "VACATION", icon: "umbrella" },
  { label: "Personal", value: "PERSONAL", icon: "user" },
  { label: "Other", value: "OTHER", icon: "more-horizontal" },
] as const;

export default function ApplyLeave() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState<"SICK" | "VACATION" | "PERSONAL" | "OTHER">("SICK");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isFormValid = leaveType && startDate && endDate && reason.trim().length > 2;

  const applyLeaveMutation = useMutation({
    mutationFn: async (data: ApplyForLeaveParams) => {
      const res = await api.post(API_ROUTES.ATTENDENCE.APPLY_FOR_LEAVE, data);
      return res.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Your leave request has been submitted", [
        {
          text: "OK",
          onPress: () => {
            if (Platform.OS === "android") {
              BackHandler.exitApp();
            } else {
              router.replace("/");
            }
          },
        }
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        "Error", 
        error?.response?.data?.message || "Couldn't submit your request. Please try again."
      );
    },
  });

  const handleSubmit = () => {
    if (!isFormValid) return;
    
    const payload = {
      leaveType,
      startDate: startDate ? new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0, 0, 0, 0
      ).toISOString() : "",
      endDate: endDate ? new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        0, 0, 0, 0
      ).toISOString() : "",
      reason,
    };
    
    applyLeaveMutation.mutate(payload);
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return "";
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <TabBar title="Apply for Leave" showHomeButton={false}/>
        
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Leave Type</Text>
            <View style={styles.leaveTypeContainer}>
              {LEAVE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.leaveTypeButton,
                    leaveType === type.value && styles.leaveTypeButtonActive,
                  ]}
                  onPress={() => setLeaveType(type.value)}
                >
                  <Feather 
                    name={type.icon} 
                    size={20} 
                    color={leaveType === type.value ? "#fff" : primary} 
                  />
                  <Text style={[
                    styles.leaveTypeLabel,
                    leaveType === type.value && styles.leaveTypeLabelActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Feather name="calendar" size={18} color="#64748b" />
                  <Text style={styles.dateText}>
                    {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                  </Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(_, date) => {
                      setShowStartPicker(false);
                      if (date) {
                        setStartDate(date);
                        if (!endDate || date > endDate) {
                          setEndDate(date);
                        }
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              <View style={{ width: 16 }} />

              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>End Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndPicker(true)}
                  disabled={!startDate}
                >
                  <Feather name="calendar" size={18} color="#64748b" />
                  <Text style={[
                    styles.dateText,
                    !startDate && { color: "#cbd5e1" }
                  ]}>
                    {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
                  </Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate || startDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(_, date) => {
                      setShowEndPicker(false);
                      if (date) setEndDate(date);
                    }}
                    minimumDate={startDate || new Date()}
                  />
                )}
              </View>
            </View>

            {startDate && endDate && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{calculateDuration()}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Reason</Text>
            <TextInput
              style={[
                styles.input,
                isFocused && styles.inputFocused,
              ]}
              placeholder="Briefly explain the reason for your leave..."
              placeholderTextColor="#94a3b8"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid || applyLeaveMutation.isPending) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || applyLeaveMutation.isPending}
              activeOpacity={0.8}
            >
              {applyLeaveMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                  <Feather name="send" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  leaveTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  leaveTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  leaveTypeButtonActive: {
    backgroundColor: primary,
    borderColor: primary,
  },
  leaveTypeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: primary,
  },
  leaveTypeLabelActive: {
    color: "#fff",
  },
  dateRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  dateText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  durationBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  durationText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#f8fafc",
    fontSize: 14,
    minHeight: 120,
    color: "#334155",
    marginBottom: 24,
    textAlignVertical: "top",
  },
  inputFocused: {
    borderColor: primary,
    backgroundColor: "#fff",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: primary,
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: "#b3c6f7",
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.2,
  },
});