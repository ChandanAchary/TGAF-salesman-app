import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { Theme, useAppTheme } from "@/constants/Theme";
import { useRefreshOnFocus } from "@/hooks/useRefetchOnFocus";
import { api } from "@/lib/axios/axios";
import { errorHandler } from "@/lib/axios/errorHandler";
import { responseErrorHandler } from "@/lib/axios/responseErrorHandler";
import { sanitizeFileName } from "@/lib/image-upload-util/imageUploadUtil";
import { ErrorResponse } from "@/lib/types/types";
import { CreateDistributorAdminOrderParams } from "@/shared/zod";
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "@tanstack/react-query";
import { File } from 'expo-file-system/next';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { fetch } from 'expo/fetch';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function CreateOrderScreen() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMega, setIsMega] = useState(false);
  const [megaName, setMegaName] = useState('');
  const [megaPhone, setMegaPhone] = useState('');
  const [megaAddress, setMegaAddress] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { distributorId } = useLocalSearchParams();

  const productQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<ProductResponse>(
        API_ROUTES.PRODUCT.GET_PRODUCTS_WITH_PRICES("Distributor")
      );
      return res.data;
    },
  });

  const refetch = productQuery.refetch;
  useRefreshOnFocus(refetch);

  const uploadImageMutation = useMutation({
    mutationFn: async (uri: string) => {
      const file = new File(uri);
      if (!file.exists) throw new Error('File does not exist');

      const fileName = uri.split('/').pop() || `payment_proof_${Date.now()}.jpg`;
      const fileType = 'image/jpeg';
      const encodedFileName = sanitizeFileName(fileName);

      const res = await fetch(
        `${API_ROUTES.UPLOAD.PRE_SIGNED_URL}?fileName=${encodedFileName}&fileType=${fileType}`
      );

      if (!res.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, fileUrl } = await res.json();

      const fileContent = file.base64Sync();
      const binaryString = atob(fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
          'x-amz-acl': 'public-read',
        },
        body: bytes,
      });

      if (!uploadResult.ok) throw new Error('Upload failed');
      return { fileUrl };
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateDistributorAdminOrderParams) => {
      const res = await api.post(API_ROUTES.CITY_HEAD.ORDER.CREATE, data);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("Order created successfully:", data);
      Alert.alert("Order Submitted", "Your order has been submitted successfully!");
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    },
    onError: (error: ErrorResponse) => {
      responseErrorHandler(error);
    },
  });

  useEffect(() => {
    if (productQuery.isError) {
      console.log("Error fetching products:", productQuery.error);
      errorHandler(productQuery.error);
    } else if (productQuery.isSuccess) {
      console.log("Products fetched successfully:", productQuery.data);
    }
  }, [productQuery.data, productQuery.isError]);

  const handleQuantityChange = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({ ...prev, [productId]: isNaN(num) ? 0 : num }));
  };

  const updateQuantity = (productId: string, nextQty: number) => {
    const safeQty = Math.max(0, nextQty);
    setQuantities((prev) => ({ ...prev, [productId]: safeQty }));
  };

  const incrementQuantity = (productId: string) => {
    const current = quantities[productId] ?? 0;
    updateQuantity(productId, current + 1);
  };

  const decrementQuantity = (productId: string) => {
    const current = quantities[productId] ?? 0;
    updateQuantity(productId, current - 1);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your media library');
      return;
    }

    // @ts-ignore: expo-image-picker types may not have allowsMultipleSelection yet
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets?.length) {
      const compressedUris: string[] = [];

      for (const asset of result.assets) {
        if (!asset.uri) continue;

        try {
          const context = ImageManipulator.manipulate(asset.uri);
          context.resize({ width: 700 });
          const renderedImage = await context.renderAsync();
          const compressed = await renderedImage.saveAsync({
            compress: 0.7,
            format: SaveFormat.JPEG,
          });

          compressedUris.push(compressed.uri);
        } catch (err) {
          console.error(`Compression failed for ${asset.uri}`, err);
        }
      }

      setSelectedImages((prev) => {
        const merged = [...prev, ...compressedUris];
        return merged.slice(0, 5);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (typeof (distributorId) !== "string") {
      Alert.alert("Invalid distributor ID");
      return;
    }

    if (!selectedImages.length) {
      Alert.alert("Payment Proof Required", "Please upload at least one payment proof image");
      return;
    }

    const orderItems = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

    if (!orderItems.length) {
      Alert.alert("Add Products", "Please add at least one product to the order");
      return;
    }

    if (isMega && (!megaName.trim() || !megaPhone.trim() || !megaAddress.trim())) {
      Alert.alert("Mega Details Required", "Please fill all Mega details.");
      return;
    }

    try {
      setIsUploading(true);

      const urls: string[] = [];
      for (const img of selectedImages) {
        const { fileUrl } = await uploadImageMutation.mutateAsync(img);
        urls.push(fileUrl);
      }

      const mutationData: CreateDistributorAdminOrderParams = {
        orderItems,
        distributorId: distributorId,
        paymentProofUrls: urls,
        mega: isMega
          ? {
            phone: megaPhone,
            name: megaName,
            address: megaAddress,
          }
          : undefined,
      };

      createOrderMutation.mutate(mutationData);
    } catch (error) {
      console.error("Error in submission process:", error);
      Alert.alert("Error", "Failed to process your order. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const selectedItems = productQuery.data?.data.filter(
    (p) => quantities[p.id] > 0
  ) ?? [];

  const totalPrice = selectedItems.reduce((sum, p) => {
    const qty = quantities[p.id] ?? 0;
    return sum + (p.price ?? 0) * qty;
  }, 0);

  const stepLabels = [
    "Order Items",
    "Payment Proof",
    "Mega Details & Summary",
  ];

  const canProceedStep1 = selectedItems.length > 0;
  const canProceedStep2 = selectedImages.length > 0;
  const canProceedStep3 = !isMega || (!!megaName.trim() && !!megaPhone.trim() && !!megaAddress.trim());

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) {
      Alert.alert("Add Products", "Please select at least one product");
      return;
    }

    if (step === 2 && !canProceedStep2) {
      Alert.alert("Payment Proof Required", "Please upload at least one payment proof image");
      return;
    }

    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TabBar title="Place Order" />
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.stepHeader, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
          <Text style={[styles.stepTitle, { color: colors.text.secondary }]}>Step {step} of 3</Text>
          <View style={[styles.stepBarTrack, { backgroundColor: isDark ? '#1e293b' : '#ddd' }]}>
            <View style={[styles.stepBarFill, { width: `${(step / 3) * 100}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.stepSubtitle, { color: colors.text.primary }]}>{stepLabels[step - 1]}</Text>
        </View>

        {step === 1 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Select Products</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>Tap + or - to adjust quantity</Text>
            {productQuery.isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : productQuery.isError ? (
              <Text style={styles.errorText}>Failed to load products</Text>
            ) : (
              productQuery.data?.data.map((product) => (
                <View key={product.id} style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Image
                    source={{ uri: product.productImg }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={2}>{product.name}</Text>
                    <Text style={[styles.price, { color: colors.primary }]}>₦{product.price?.toLocaleString() ?? "N/A"}</Text>
                    <View style={styles.quantityRow}>
                      <Pressable
                        style={[styles.qtyButton, { borderColor: colors.border, backgroundColor: isDark ? '#1e293b' : '#f3f7ff' }]}
                        onPress={() => decrementQuantity(product.id)}
                        disabled={isUploading}
                      >
                        <Text style={[styles.qtyButtonText, { color: colors.primary }]}>-</Text>
                      </Pressable>
                      <TextInput
                        style={[styles.input, { color: colors.text.primary, borderColor: colors.border, backgroundColor: isDark ? '#1e293b' : '#f9fafb' }]}
                        placeholder="0"
                        placeholderTextColor={colors.text.muted}
                        keyboardType="numeric"
                        onChangeText={(value) =>
                          handleQuantityChange(product.id, value)
                        }
                        value={quantities[product.id]?.toString() ?? ""}
                        editable={!isUploading}
                      />
                      <Pressable
                        style={[styles.qtyButton, { borderColor: colors.border, backgroundColor: isDark ? '#1e293b' : '#f3f7ff' }]}
                        onPress={() => incrementQuantity(product.id)}
                        disabled={isUploading}
                      >
                        <Text style={[styles.qtyButtonText, { color: colors.primary }]}>+</Text>
                      </Pressable>
                      <View style={styles.itemTotal}>
                        <Text style={[styles.itemTotalLabel, { color: colors.text.secondary }]}>Subtotal</Text>
                        <Text style={[styles.itemTotalAmount, { color: colors.text.primary }]}>
                          ₦{((product.price ?? 0) * (quantities[product.id] ?? 0)).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}

            <View style={[styles.orderHint, { backgroundColor: isDark ? '#1e293b' : '#f6f8fb' }]}>
              <Text style={[styles.orderHintText, { color: colors.text.secondary }]}>
                {selectedItems.length ? `${selectedItems.length} item(s) selected` : "No items selected"}
              </Text>
              <Text style={[styles.orderHintTotal, { color: colors.primary }]}>₦{totalPrice.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Payment Proof</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>Upload screenshot of payment confirmation</Text>

            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: colors.primary, backgroundColor: isDark ? '#1e293b' : '#f8f9fa' }]}
              onPress={pickImage}
              disabled={isUploading}
            >
              <Ionicons name="cloud-upload" size={20} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
                {selectedImages.length ? 'Add More Images' : 'Select Images'}
              </Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <View style={styles.imageGrid}>
                {selectedImages.map((uri, idx) => (
                  <View key={uri + idx} style={styles.imageWrapper}>
                    <Image
                      source={{ uri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(idx)}
                      disabled={isUploading}
                    >
                      <Ionicons name="close-circle" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {step === 3 && (
          <>
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
              <View style={styles.megaHeader}>
                <Switch
                  value={isMega}
                  onValueChange={setIsMega}
                  disabled={isUploading}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={isMega ? colors.primary : "#f4f3f4"}
                />
                <Text style={[styles.megaLabel, { color: colors.text.primary }]}>Is this a Mega Order?</Text>
              </View>

              {isMega && (
                <View style={styles.megaForm}>
                  <Text style={[styles.megaFormTitle, { color: colors.text.secondary }]}>Mega Order Details</Text>
                  <TextInput
                    style={[styles.textInput, { color: colors.text.primary, borderColor: colors.border, backgroundColor: isDark ? '#1e293b' : '#f8f9fa' }]}
                    placeholder="Customer Name"
                    placeholderTextColor={colors.text.muted}
                    value={megaName}
                    onChangeText={setMegaName}
                    editable={!isUploading}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.text.primary, borderColor: colors.border, backgroundColor: isDark ? '#1e293b' : '#f8f9fa' }]}
                    placeholder="Customer Phone"
                    placeholderTextColor={colors.text.muted}
                    value={megaPhone}
                    onChangeText={setMegaPhone}
                    keyboardType="phone-pad"
                    editable={!isUploading}
                  />
                  <TextInput
                    style={[styles.textInput, { height: 80, color: colors.text.primary, borderColor: colors.border, backgroundColor: isDark ? '#1e293b' : '#f8f9fa' }]}
                    placeholder="Delivery Address"
                    placeholderTextColor={colors.text.muted}
                    value={megaAddress}
                    onChangeText={setMegaAddress}
                    multiline
                    editable={!isUploading}
                  />
                </View>
              )}
            </View>

            {selectedItems.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Order Summary</Text>
                <View style={styles.summaryItems}>
                  {selectedItems.map((p) => (
                    <View key={p.id} style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.summaryName, { color: colors.text.secondary }]} numberOfLines={1}>
                        {p.name} × {quantities[p.id]}
                      </Text>
                      <Text style={[styles.summaryPrice, { color: colors.text.primary }]}>
                        ₦{((p.price ?? 0) * (quantities[p.id] ?? 0)).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.summaryTotal, { borderTopColor: colors.border }]}>
                  <Text style={[styles.totalLabel, { color: colors.text.primary }]}>Total</Text>
                  <Text style={[styles.totalAmount, { color: colors.primary }]}>₦{totalPrice.toLocaleString()}</Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.navButtons}>
          {step > 1 && (
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                styles.navButtonSecondary,
                { backgroundColor: isDark ? '#1e293b' : '#eef2f8' },
                styles.navButtonSpacing,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleBack}
              disabled={isUploading}
            >
              <Text style={[styles.navButtonTextSecondary, { color: colors.text.primary }]}>Back</Text>
            </Pressable>
          )}

          {step < 3 && (
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: colors.primary },
                pressed && styles.submitButtonPressed,
                ((step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)) && styles.submitButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={
                isUploading ||
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2)
              }
            >
              <Text style={styles.navButtonText}>Next</Text>
            </Pressable>
          )}

          {step === 3 && (
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: colors.primary },
                pressed && styles.submitButtonPressed,
                (isUploading || !canProceedStep3 || selectedItems.length === 0 || selectedImages.length === 0) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={
                isUploading ||
                !canProceedStep3 ||
                selectedItems.length === 0 ||
                selectedImages.length === 0
              }
            >
              {isUploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.navButtonText}>Confirm & Submit</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 24,
  },
  stepHeader: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  stepBarTrack: {
    height: 6,
    backgroundColor: "#e6eefb",
    borderRadius: 6,
    overflow: "hidden",
  },
  stepBarFill: {
    height: 6,
    backgroundColor: "#007bff",
    borderRadius: 6,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
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
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 56,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d9e3f7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f7ff',
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
  },
  itemTotal: {
    marginLeft: 10,
    alignItems: 'flex-end',
    flex: 1,
  },
  itemTotalLabel: {
    fontSize: 12,
    color: '#777',
  },
  itemTotalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderHint: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f6f8fb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderHintText: {
    fontSize: 14,
    color: '#555',
  },
  orderHintTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007bff',
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
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  navButtonSpacing: {
    marginRight: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  submitButtonDisabled: {
    backgroundColor: '#aaa',
  },
  navButtonSecondary: {
    backgroundColor: '#eef2f8',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  navButtonTextSecondary: {
    color: '#444',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 10,
  },
});