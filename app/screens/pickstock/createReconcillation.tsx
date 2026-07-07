import ModalView from "@/components/ui/layout/Modal";
import { OtpInput } from "@/components/ui/layout/OtpInput";
import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { primary } from "@/constants/Colors";
import { api } from "@/lib/axios/axios";
import { Response } from "@/lib/types/types";
import { ApproveReconciliationParams, CreateReconciliationParams } from "@/shared/models/salesman";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ReconciliationDetailsResponse extends Response {
  data: {
    pickStockId: string;
    distributor: {
      id: string;
      avatar: string | null;
      cseName: string;
    };
    items: {
      soldQuantity: number;
      remainingQuantity: number;
      id: string;
      productId: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        productImg: string;
      };
    }[];
    totalCollected: number;
  }
}

interface CreateReconciliationResponse extends Response {
  data: {
    id: string;
    otp: string;
  }
}

export default function createReconcillation() {
  const { pickstockId } = useLocalSearchParams();
  const router = useRouter();
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [createdReconciliationId, setCreatedReconciliationId] = useState<string | null>(null);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const getReconcillationDetailsQuery = useQuery({
    queryKey: ["reconciliationDetails", pickstockId],
    queryFn: async () => {
      const res = await api.get<ReconciliationDetailsResponse>(API_ROUTES.DISTRIBUTOR.GET_RECONCILIATIONS(pickstockId as string));
      return res.data;
    },
    enabled: !!pickstockId
  });

  const createReconciliationMutation = useMutation({
    mutationFn: async (data: CreateReconciliationParams) => {
      const res = await api.post<CreateReconciliationResponse>(API_ROUTES.DISTRIBUTOR.CREATE_RECONCILIATION, data);
      return res.data;
    }
  });

  const createApproveOtpReconMutation = useMutation({
    mutationFn: async ({ reconId, data }: { reconId: string; data: ApproveReconciliationParams }) => {
      const res = await api.post(API_ROUTES.DISTRIBUTOR.APPROVE_RECONCILIATION(reconId), data);
      return res.data;
    }
  });

  const details = getReconcillationDetailsQuery.data?.data;
  const stockItems = details?.items ?? [];

  const totalReturned = useMemo(
    () => stockItems.reduce((sum, item) => sum + (returnQuantities[item.productId] ?? 0), 0),
    [returnQuantities, stockItems]
  );

  const paidAmountNumber = Number(paidAmountInput || "0");
  const isPaidAmountInvalid = paidAmountInput.trim().length === 0 || Number.isNaN(paidAmountNumber) || paidAmountNumber < 0;

  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setErrorModalVisible(true);
  };

  const showSuccessModal = (message: string) => {
    setModalMessage(message);
    setSuccessModalVisible(true);
  };

  const handleReturnQuantityChange = (productId: string, value: string, max: number) => {
    const parsed = parseInt(value, 10);
    const normalized = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, max));
    setReturnQuantities((prev) => ({
      ...prev,
      [productId]: normalized,
    }));
  };

  const handleCreateReconciliation = () => {
    if (typeof pickstockId !== "string") {
      showErrorModal("Invalid pick stock reference.");
      return;
    }

    if (isPaidAmountInvalid) {
      showErrorModal("Please enter a valid amount to remit.");
      return;
    }

    if (!details || stockItems.length === 0) {
      showErrorModal("No reconciliation items found.");
      return;
    }

    const payload: CreateReconciliationParams = {
      pickStockId: details.pickStockId,
      paidAmount: paidAmountNumber,
      items: stockItems.map((item) => ({
        productId: item.productId,
        quantity: returnQuantities[item.productId] ?? 0,
      })),
    };

    createReconciliationMutation.mutate(payload, {
      onSuccess: (response) => {
        if (response?.success === false || !response?.data?.id) {
          showErrorModal(response?.message ?? "Failed to create reconciliation. Please try again.");
          return;
        }

        setCreatedReconciliationId(response.data.id);
        setOtp(null);
        setOtpModalVisible(true);
      },
      onError: () => {
        showErrorModal("Failed to create reconciliation. Please try again.");
      },
    });
  };

  const handleVerifyOtp = () => {
    if (!createdReconciliationId) {
      setOtpModalVisible(false);
      showErrorModal("Missing reconciliation reference. Please submit again.");
      return;
    }

    if (!otp || otp.trim().length === 0) {
      showErrorModal("Please enter OTP.");
      return;
    }

    createApproveOtpReconMutation.mutate(
      { reconId: createdReconciliationId, data: { otp } },
      {
        onSuccess: (response: Response) => {
          if (response?.success === false) {
            setOtpModalVisible(false);
            setCreatedReconciliationId(null);
            setOtp(null);
            showErrorModal(response?.message ?? "OTP verification failed. Please edit and submit again.");
            return;
          }

          console.log("Reconciliation approval response:", response);
          setOtpModalVisible(false);
          setCreatedReconciliationId(null);
          setOtp(null);
          showSuccessModal(response?.message ?? "Reconciliation approved successfully.");
        },
        onError: () => {
          setOtpModalVisible(false);
          setCreatedReconciliationId(null);
          setOtp(null);
          showErrorModal("OTP verification failed. Please edit and submit again.");
        },
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TabBar title="RECONCILIATION" />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          {getReconcillationDetailsQuery.isLoading ? (
            <ActivityIndicator size="small" color={primary} />
          ) : getReconcillationDetailsQuery.isError ? (
            <Text style={styles.errorText}>Failed to load reconciliation details.</Text>
          ) : !details ? (
            <Text style={styles.errorText}>No reconciliation details available.</Text>
          ) : (
            <>
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Debt (Total Collected)</Text>
                <Text style={styles.totalAmount}>₦{(details.totalCollected ?? 0).toLocaleString()}</Text>
              </View>

              {stockItems.map((item) => {
                const skuLabel = item.product?.name ?? item.productId;
                const totalStock = item.soldQuantity + item.remainingQuantity;
                const productImg = item.product?.productImg;

                return (
                  <View key={item.id} style={styles.stockCard}>
                    <View style={styles.stockTopRow}>
                      {productImg ? (
                        <Image source={{ uri: productImg }} style={styles.productImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <Text style={styles.productImagePlaceholderText}>N/A</Text>
                        </View>
                      )}

                      <View style={styles.stockInfo}>
                        <Text style={styles.stockSku} numberOfLines={1}>{skuLabel}</Text>
                        <View style={styles.stockMetaRow}>
                          <View style={[styles.metricChip, { backgroundColor: "#dcfce7", borderColor: "#86efac" }]}>
                            <Text style={[styles.metricLabel, { color: "#166534" }]}>Sold</Text>
                            <Text style={[styles.metricValue, { color: "#166534" }]}>{item.soldQuantity}</Text>
                          </View>
                          <View style={[styles.metricChip, { backgroundColor: "#fce7f3", borderColor: "#fbcfe8" }]}>
                            <Text style={[styles.metricLabel, { color: "#be185d" }]}>Remaining</Text>
                            <Text style={[styles.metricValue, { color: "#be185d" }]}>{item.remainingQuantity}</Text>
                          </View>
                          <View style={[styles.metricChip, styles.metricChipPrimary]}>
                            <Text style={[styles.metricLabel, styles.metricLabelPrimary]}>Total</Text>
                            <Text style={[styles.metricValue, styles.metricValuePrimary]}>{totalStock}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.returnSection}>
                      <View style={styles.quantityContainer}>
                        <View>
                          <Text style={styles.quantityLabel}>Amount to Return</Text>
                          <Text style={styles.returnHint}>Max returnable: {totalStock}</Text>
                        </View>
                        <TextInput
                          style={styles.input}
                          placeholder="0"
                          keyboardType="numeric"
                          value={(returnQuantities[item.productId] ?? 0).toString()}
                          onChangeText={(value) => handleReturnQuantityChange(item.productId, value, totalStock)}
                          editable={!createReconciliationMutation.isPending && !createApproveOtpReconMutation.isPending}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount to Remit</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.currencyPrefix}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={paidAmountInput}
              onChangeText={setPaidAmountInput}
              editable={!createReconciliationMutation.isPending && !createApproveOtpReconMutation.isPending}
            />
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>Stocks to Return: {totalReturned}</Text>
            <Text style={styles.summaryText}>SKUs: {stockItems.length}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              (createReconciliationMutation.isPending || createApproveOtpReconMutation.isPending || stockItems.length === 0) && styles.submitButtonDisabled,
            ]}
            onPress={handleCreateReconciliation}
            disabled={createReconciliationMutation.isPending || createApproveOtpReconMutation.isPending || stockItems.length === 0}
          >
            {createReconciliationMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>Submit Reconciliation</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <ModalView
        isReceiveModalVisible={otpModalVisible}
        setIsReceiveModalVisible={setOtpModalVisible}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Verify OTP</Text>
          <Text style={styles.modalMessage}>Enter OTP to approve this reconciliation.</Text>
          <OtpInput setOtp={setOtp} />
          <Pressable
            style={[styles.modalButton, createApproveOtpReconMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleVerifyOtp}
            disabled={createApproveOtpReconMutation.isPending}
          >
            {createApproveOtpReconMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.modalButtonText}>Verify OTP</Text>
            )}
          </Pressable>
        </View>
      </ModalView>

      <ModalView
        isReceiveModalVisible={successModalVisible}
        setIsReceiveModalVisible={setSuccessModalVisible}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.successTitle}>Success</Text>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <Pressable
            style={[styles.modalButton, styles.successButton]}
            onPress={() => {
              setSuccessModalVisible(false);
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </Pressable>
        </View>
      </ModalView>

      <ModalView
        isReceiveModalVisible={errorModalVisible}
        setIsReceiveModalVisible={setErrorModalVisible}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <Pressable
            style={[styles.modalButton, styles.errorButton]}
            onPress={() => setErrorModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </Pressable>
        </View>
      </ModalView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
    fontWeight: "600",
  },
  debtCard: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  debtLabel: {
    fontSize: 12,
    color: "#0369a1",
    fontWeight: "600",
    marginBottom: 2,
  },
  debtAmount: {
    fontSize: 20,
    color: "#0c4a6e",
    fontWeight: "800",
  },
  totalCard: {
    backgroundColor: "#fce7f3",
    borderWidth: 1,
    borderColor: "#fbcfe8",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: "#be185d",
    fontWeight: "600",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 20,
    color: "#831843",
    fontWeight: "800",
  },
  stockCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
    elevation: 1,
  },
  stockTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  productImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  productImagePlaceholderText: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
  },
  stockInfo: {
    flex: 1,
    gap: 2,
  },
  stockSku: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  stockMetaRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  metricChip: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  metricChipPrimary: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  metricLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
  },
  metricLabelPrimary: {
    color: "#1d4ed8",
  },
  metricValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  metricValuePrimary: {
    color: "#1e40af",
  },
  label: {
    fontSize: 14,
    color: primary,
    marginBottom: 8,
    fontWeight: "700",
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontSize: 15,
    color: primary,
    fontWeight: "700",
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginRight: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 10,
  },
  quantityLabel: {
    fontSize: 14,
    color: primary,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 90,
    textAlign: "center",
    fontSize: 15,
    color: primary,
    fontWeight: "700",
    backgroundColor: "#f9fafb",
  },
  returnSection: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: "#9ca3af",
    marginTop: 10,
    paddingTop: 10,
  },
  returnHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  summaryBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    backgroundColor: "#aaa",
  },
  submitText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#ff4444",
    textAlign: "center",
    marginVertical: 10,
  },
  modalContainer: {
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  modalButton: {
    marginTop: 8,
    backgroundColor: primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065f46",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#991b1b",
  },
  successButton: {
    backgroundColor: "#059669",
  },
  errorButton: {
    backgroundColor: "hotpink",
  },
});