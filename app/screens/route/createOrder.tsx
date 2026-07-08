import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { ErrorResponse } from "@/lib/types/types";
import { CreateOrderParams } from "@/shared/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { primary, secondary } from "@/constants/Colors";
import { formatPrice } from "@/lib/formatters/formatter";

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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({}); // NEW: store price per product
  const [refreshing, setRefreshing] = useState(false);

  const productQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<ProductResponse>(
        API_ROUTES.PRODUCT.GET_PRODUCTS_WITH_PRICES("Retail")
      );
      return res.data;
    },
    refetchOnWindowFocus: true,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.CREATE_ORDER, data);
      return res.data;
    },
    onSuccess: (data) => {
      Alert.alert("Success", "Order created successfully!");
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    },
    onError: (error: ErrorResponse) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to create order");
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await productQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handlePriceChange = (productId: string, value: string) => {
    const num = parseFloat(value);
    setPrices((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleIncrement = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleDecrement = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));
  };

  const handleSubmit = () => {
    if (typeof id !== "string") {
      Alert.alert("Error", "Invalid customer ID");
      return;
    }

    const orderItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity,
        price: prices[productId] ?? (productQuery.data?.data.find(p => p.id === productId)?.price ?? 0), // include price
      }));

    if (orderItems.length === 0) {
      Alert.alert("Error", "Please add at least one item to the order");
      return;
    }

    createOrderMutation.mutate({
      customerId: id,
      orderItems,
    });
  };

  const selectedItems = productQuery.data?.data.filter(
    (p) => quantities[p.id] > 0
  ) ?? [];

  const totalPrice = selectedItems.reduce(
    (sum, p) => sum + ((prices[p.id] ?? p.price ?? 0) * (quantities[p.id] ?? 0)),
    0
  );

  if (!id) {
    return (
      <View style={styles.container}>
        <Text>Invalid customer ID</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <TabBar title="ORDER" />

      {productQuery.isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primary}
            />
          }
        >
          {/* Order Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            {selectedItems.length === 0 ? (
              <View style={styles.emptySummary}>
                <Feather name="shopping-cart" size={24} color="#E5E7EB" />
                <Text style={styles.emptySummaryText}>No items added</Text>
              </View>
            ) : (
              <>
                {selectedItems.map((p) => (
                  <View key={p.id} style={styles.summaryItem}>
                    <Text style={styles.summaryItemName}>
                      {p.name} × {quantities[p.id]}
                    </Text>
                    <Text style={styles.summaryItemPrice}>
                      {formatPrice((prices[p.id] ?? p.price ?? 0) * quantities[p.id])}
                    </Text>
                  </View>
                ))}
                <View style={styles.summaryTotal}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalAmount}>
                    {formatPrice(totalPrice)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Product List */}
          <Text style={styles.sectionTitle}>Available Products</Text>

          {productQuery.data?.data.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={{ uri: product.productImg || "https://via.placeholder.com/150" }}
                style={styles.productImage}
                resizeMode="cover"
              />

              <View style={styles.productDetails}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>
                  {product.price ? formatPrice(product.price) : "Price not available"}
                </Text>
                {/* NEW: Price Input */}
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  placeholder="Enter price"
                  value={
                    prices[product.id] !== undefined
                      ? prices[product.id].toString()
                      : (product.price?.toString() ?? "")
                  }
                  onChangeText={(value) => handlePriceChange(product.id, value)}
                />
              </View>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrement(product.id)}
                  disabled={!quantities[product.id]}
                >
                  <Feather name="minus" size={16} color={quantities[product.id] ? primary : "#D1D5DB"} />
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  value={quantities[product.id]?.toString() || "0"}
                  onChangeText={(value) => handleQuantityChange(product.id, value)}
                />

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrement(product.id)}
                >
                  <Feather name="plus" size={16} color={primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Submit Button */}
      {selectedItems.length > 0 && (
        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              Place Order • {formatPrice(totalPrice)}
            </Text>
          )}
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary,
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    padding: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  emptySummary: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptySummaryText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryItemName: {
    fontSize: 14,
    color: "#4B5563",
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  summaryTotalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    alignItems: "center",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#10B981",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    width: 40,
    height: 40,
    textAlign: "center",
    fontSize: 14,
    color: "#111827",
    marginHorizontal: 4,
  },
  // NEW: style for price input
  priceInput: {
    width: 100,
    height: 36,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 4,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  submitButton: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});