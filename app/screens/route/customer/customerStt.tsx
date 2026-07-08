import React, { useEffect } from "react";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import TabBar from "@/components/ui/layout/TabBar";
import { primary, secondary } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { UpdateClosingStockParams, UpdateCustomerClosingStockParams } from "@/shared/zod";
import ClickOnce from "@/components/ui/layout/ClickOnceButton";
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

interface Stt {
  CustomerSTTItem: {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    productId: string;
    sttId: string;
    opening: number;
    closing: number;
    supply: number;
  }[];
  id: string;
  customerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

interface SttResponse {
  success: boolean;
  message: string;
  data: Stt | null;
}

interface StockSummary {
  productId: string;
  productName: string;
  openingStock: number;
  supplyStock: number;
  closingStock: number;
  stt: number;
}

export default function Stt() {
  const [closingStock, setClosingStock] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { customerId } = useLocalSearchParams();
  const router = useRouter();

  const productQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<ProductResponse>(
        API_ROUTES.PRODUCT.GET_PRODUCTS_WITH_PRICES("Retail")
      );
      return res.data;
    },
  });

  const customersttQuery = useQuery({
    queryKey: ["customerstt"],
    queryFn: async () => {
      const res = await api.get<SttResponse>(API_ROUTES.CITY_HEAD.STT.GET_TODAY_CUSTOMER_STT(customerId as string));
      return res.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await productQuery.refetch();
      await customersttQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleStockChange = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    setClosingStock((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const closingStockMuation = useMutation({
    mutationFn: async (data: UpdateCustomerClosingStockParams) => {
      const res = await api.post(
        API_ROUTES.CITY_HEAD.ORDER.UPDATE_CUSTOMER_STOCK,
        data
      );
      return res.data;
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setLoading(false);
      alert("Closing stock updated successfully");
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    },
    onError: (err) => {
      setLoading(false);
      console.error("Error updating closing stock", err);
    }
  })

  const handleSubmit = () => {
    console.log(closingStock);
    if (typeof customerId !== "string") {
      alert("Invalid distributor ID");
      return;
    }

    closingStockMuation.mutate({
      customerId: customerId,
      closingStock: closingStock,
    });
  };

  const productsWithStock = productQuery.data?.data.filter(
    (p) => closingStock[p.id] > 0
  ) ?? [];

  const calculateStockSummary = (): StockSummary[] => {
    if (!productQuery.data?.data || !customersttQuery.data?.data) return [];

    return productQuery.data.data.map(product => {
      const sttItem = customersttQuery.data.data?.CustomerSTTItem.find(item => item.productId === product.id);

      const supplyStock = sttItem?.supply ?? 0;
      const openingStock = sttItem?.opening ?? 0;
      const currentClosing = sttItem?.closing ?? closingStock[product.id] ?? 0;
      const stt = openingStock + supplyStock - currentClosing;

      return {
        productId: product.id,
        productName: product.name,
        openingStock,
        supplyStock,
        closingStock: currentClosing,
        stt,
      };
    });
  };

  const stockSummary = calculateStockSummary();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <TabBar title="Enter Closing Stock" />

      {productQuery.isLoading || customersttQuery.isLoading ? (
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
          {/* Stock Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Stock Summary</Text>
            {stockSummary.map((summary) => (
              <View key={summary.productId} style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>{summary.productName}</Text>
                <View style={styles.summaryDetails}>
                  <Text style={styles.summaryDetail}>Opening: {summary.openingStock}</Text>
                  <Text style={styles.summaryDetail}>Supply: {summary.supplyStock}</Text>
                  <Text style={styles.summaryDetail}>Closing: {summary.closingStock}</Text>
                  <Text style={[styles.summaryDetail, styles.sttText]}>
                    STT: {summary.stt}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Product List */}
          <Text style={styles.sectionTitle}>Enter Closing Stock</Text>

          {productQuery.data?.data.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={{ uri: product.productImg || "https://via.placeholder.com/150" }}
                style={styles.productImage}
                resizeMode="cover"
              />

              <View style={styles.productDetails}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockInfoText}>
                    Opening: {stockSummary.find(s => s.productId === product.id)?.openingStock ?? 0}
                  </Text>
                  <Text style={styles.stockInfoText}>
                    Invoice: {stockSummary.find(s => s.productId === product.id)?.supplyStock ?? 0}
                  </Text>
                </View>
              </View>

              <View style={styles.stockInput}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Closing"
                  value={closingStock[product.id]?.toString() || ""}
                  onChangeText={(value) => handleStockChange(product.id, value)}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Submit Button */}
      {productsWithStock.length > 0 && (
        <ClickOnce isLoading={loading}>
          <Pressable
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              Submit Closing Stock
            </Text>
          </Pressable>
        </ClickOnce>
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
    padding: 16,
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
  stockInput: {
    marginLeft: 12,
  },
  input: {
    width: 100,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    textAlign: "center",
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
  summaryDetails: {
    marginTop: 4,
  },
  summaryDetail: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  sttText: {
    color: primary,
    fontWeight: "600",
  },
  stockInfo: {
    marginTop: 4,
  },
  stockInfoText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
});
