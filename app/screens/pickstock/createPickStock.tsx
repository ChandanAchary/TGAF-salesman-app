import ModalView from "@/components/ui/layout/Modal";
import { OtpInput } from "@/components/ui/layout/OtpInput";
import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { primary } from "@/constants/Colors";
import { useRefreshOnFocus } from "@/hooks/useRefetchOnFocus";
import { api } from "@/lib/axios/axios";
import { ApprovePickStockParams, CreatePickStockParams } from "@/shared/models/salesman";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface CreatePickStockResponseData {
  id?: string;
  pickStockId?: string;
}

interface Product {
  price: number | null;
  tenantId: string;
  name: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  description: string;
  productImg: string;
  categoryId: string;
  brandId: string;
}

interface ProductResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export default function createPickStock() {
  const { distributorId } = useLocalSearchParams();
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [createdPickStockId, setCreatedPickStockId] = useState<string | null>(null);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const productQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<ProductResponse>(
        API_ROUTES.PRODUCT.GET_PRODUCTS_WITH_PRICES("Distributor")
      );
      return res.data;
    },
  });

  const createPickStockMutation = useMutation({
    mutationFn: async (data: CreatePickStockParams) => {
      const res = await api.post<ApiResponse<CreatePickStockResponseData>>(API_ROUTES.DISTRIBUTOR.CREATE_PICK_STOCK, data);
      return res.data;
    }
  })

  const approvePickStockMutation = useMutation({
    mutationFn: async ({ pickStockId, data }: { pickStockId: string; data: ApprovePickStockParams }) => {
      const res = await api.post<ApiResponse<null>>(API_ROUTES.DISTRIBUTOR.APPROVE_PICK_STOCK(pickStockId), data);
      return res.data;
    }
  })

  const refetch = productQuery.refetch;
  useRefreshOnFocus(refetch);

  const handleQuantityChange = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({ ...prev, [productId]: isNaN(num) ? 0 : num }));
  };

  const selectedItems = productQuery.data?.data.filter(
    (p) => quantities[p.id] > 0
  ) ?? [];

  const totalPrice = selectedItems.reduce((sum, p) => {
    const qty = quantities[p.id] ?? 0;
    return sum + (p.price ?? 0) * qty;
  }, 0);

  const getPickStockIdFromResponse = (response: ApiResponse<CreatePickStockResponseData>) => {
    if (typeof response?.data === "string") {
      return response.data;
    }

    if (response?.data?.pickStockId) {
      return response.data.pickStockId;
    }

    if (response?.data?.id) {
      return response.data.id;
    }

    return null;
  };

  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setErrorModalVisible(true);
  };

  const showSuccessModal = (message: string) => {
    setModalMessage(message);
    setSuccessModalVisible(true);
  };

  const handleSubmit = async () => {
    if (typeof distributorId !== "string") {
      showErrorModal("Invalid distributor ID");
      return;
    }

    const items = selectedItems.map((item) => ({
      productId: item.id,
      quantity: quantities[item.id] ?? 0,
    })).filter((item) => item.quantity > 0);

    if (items.length === 0) {
      showErrorModal("Please add at least one product.");
      return;
    }

    createPickStockMutation.mutate({
      distributorId,
      items,
    }, {
      onSuccess: (response) => {
        if (response?.success === false) {
          showErrorModal(response.message ?? "Failed to create pick stock.");
          return;
        }

        const pickStockId = getPickStockIdFromResponse(response);

        if (!pickStockId) {
          showErrorModal("Pick stock was created but OTP verification ID is missing. Please create again.");
          setQuantities({});
          return;
        }

        setCreatedPickStockId(pickStockId);
        setOtp(null);
        setOtpModalVisible(true);
      },
      onError: () => {
        showErrorModal("Failed to create pick stock. Please try again.");
      },
    });
  };

  const handleVerifyOtp = () => {
    if (!createdPickStockId) {
      setOtpModalVisible(false);
      showErrorModal("Missing pick stock reference. Please create pick stock again.");
      return;
    }

    if (!otp || otp.trim().length === 0) {
      showErrorModal("Please enter OTP.");
      return;
    }

    approvePickStockMutation.mutate({
      pickStockId: createdPickStockId,
      data: { otp },
    }, {
      onSuccess: (response) => {
        if (response?.success === false) {
          setOtpModalVisible(false);
          setCreatedPickStockId(null);
          setOtp(null);
          setQuantities({});
          showErrorModal(response.message ?? "OTP verification failed. Please create pick stock again.");
          return;
        }

        setOtpModalVisible(false);
        setCreatedPickStockId(null);
        setOtp(null);
        showSuccessModal(response?.message ?? "Pick stock approved successfully.");
      },
      onError: () => {
        setOtpModalVisible(false);
        setCreatedPickStockId(null);
        setOtp(null);
        setQuantities({});
        showErrorModal("OTP verification failed. Please create pick stock again.");
      },
    });

  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TabBar title="PICKSTOCK" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Products</Text>
          {productQuery.isLoading ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : productQuery.isError ? (
            <Text style={styles.errorText}>Failed to load products</Text>
          ) : (
            productQuery.data?.data.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Image
                  source={{ uri: product.productImg }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.name}>{product.name}</Text>
                  <Text style={styles.price}>₦{product.price?.toLocaleString() ?? "N/A"}</Text>
                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Qty:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      onChangeText={(value) =>
                        handleQuantityChange(product.id, value)
                      }
                      value={quantities[product.id]?.toString() ?? ""}
                      editable={!createPickStockMutation.isPending && !approvePickStockMutation.isPending}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Order Summary */}
        {selectedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryItems}>
              {selectedItems.map((p) => (
                <View key={p.id} style={styles.summaryItem}>
                  <Text style={styles.summaryName} numberOfLines={1}>
                    {p.name} × {quantities[p.id]}
                  </Text>
                  <Text style={styles.summaryPrice}>
                    ₦{((p.price ?? 0) * (quantities[p.id] ?? 0)).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.summaryTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₦{totalPrice.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            (createPickStockMutation.isPending || approvePickStockMutation.isPending || selectedItems.length === 0) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={createPickStockMutation.isPending || approvePickStockMutation.isPending || selectedItems.length === 0}
        >
          {createPickStockMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>
              {selectedItems.length === 0 ? 'Add Products to Order' : 'Submit Order'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <ModalView
        isReceiveModalVisible={otpModalVisible}
        setIsReceiveModalVisible={setOtpModalVisible}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Verify OTP</Text>
          <Text style={styles.modalMessage}>Enter the OTP to approve this pick stock.</Text>
          <OtpInput setOtp={setOtp} />
          <Pressable
            style={[styles.modalButton, approvePickStockMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleVerifyOtp}
            disabled={approvePickStockMutation.isPending}
          >
            {approvePickStockMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.modalButtonText}>Verify</Text>
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
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 60,
    textAlign: 'center',
    fontSize: 14,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#007bff',
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 15,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  megaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  megaLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  megaForm: {
    marginTop: 8,
  },
  megaFormTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  summaryItems: {
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryName: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    marginRight: 10,
  },
  summaryPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007bff',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    backgroundColor: '#aaa',
  },
  submitText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 10,
  },
  modalContainer: {
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalButton: {
    marginTop: 8,
    backgroundColor: primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991b1b',
  },
  successButton: {
    backgroundColor: '#059669',
  },
  errorButton: {
    backgroundColor: 'hotpink',
  },
});