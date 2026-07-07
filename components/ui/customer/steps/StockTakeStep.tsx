import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Package, ArrowRight, ArrowLeft, CheckCircle, Warning } from 'phosphor-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios/axios';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { UpdateCustomerClosingStockParams } from '@/shared/zod';
import { primary, secondary } from '@/constants/Colors';
import Toast from 'react-native-toast-message';

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

interface StockTakeStepProps {
  customerId: string;
  onComplete: (stockData: Record<string, number>) => void;
  onBack: () => void;
  stockData: Record<string, number>;
  setStockData: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export default function StockTakeStep({
  customerId,
  onComplete,
  onBack,
  stockData,
  setStockData,
}: StockTakeStepProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [localStock, setLocalStock] = useState<Record<string, number>>(stockData);

  const productQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<ProductResponse>(
        API_ROUTES.PRODUCT.GET_PRODUCTS_WITH_PRICES("Retail")
      );
      return res.data;
    },
  });

  const customerSttQuery = useQuery({
    queryKey: ['customerstt', customerId],
    queryFn: async () => {
      const res = await api.get<SttResponse>(
        API_ROUTES.CITY_HEAD.STT.GET_TODAY_CUSTOMER_STT(customerId)
      );
      return res.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await productQuery.refetch();
      await customerSttQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleStockChange = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    setLocalStock((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const closingStockMutation = useMutation({
    mutationFn: async (data: UpdateCustomerClosingStockParams) => {
      const res = await api.post(
        API_ROUTES.CITY_HEAD.ORDER.UPDATE_CUSTOMER_STOCK,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Stock Updated',
        text2: 'Closing stock has been saved successfully',
      });
      setStockData(localStock);
      onComplete(localStock);
    },
    onError: (err) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update closing stock',
      });
      console.error('Error updating closing stock', err);
    },
  });

  const handleContinue = () => {
    const hasAnyStock = Object.values(localStock).some((v) => v > 0);
    if (!hasAnyStock) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please enter closing stock for at least one product',
      });
      return;
    }

    closingStockMutation.mutate({
      customerId: customerId,
      closingStock: localStock,
    });
  };

  const getStockInfo = (productId: string) => {
    const sttItem = customerSttQuery.data?.data?.CustomerSTTItem.find(
      (item) => item.productId === productId
    );
    return {
      opening: sttItem?.opening ?? 0,
      supply: sttItem?.supply ?? 0,
    };
  };

  const hasAnyStock = Object.values(localStock).some((v) => v > 0);
  const isLoading = productQuery.isLoading || customerSttQuery.isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Package size={24} color={primary} weight="duotone" />
        </View>
        <Text style={styles.title}>Stock Take</Text>
        <Text style={styles.subtitle}>
          Enter the closing stock count for each product
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {productQuery.data?.data.map((product) => {
            const stockInfo = getStockInfo(product.id);
            const hasValue = localStock[product.id] > 0;

            return (
              <View key={product.id} style={styles.productCard}>
                <Image
                  source={{
                    uri: product.productImg || 'https://via.placeholder.com/150',
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {product.name}
                  </Text>
                  <View style={styles.stockInfoRow}>
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockBadgeText}>
                        Open: {stockInfo.opening}
                      </Text>
                    </View>
                    <View style={[styles.stockBadge, styles.stockBadgeSupply]}>
                      <Text style={styles.stockBadgeText}>
                        Supply: {stockInfo.supply}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      hasValue && styles.inputFilled,
                    ]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    value={localStock[product.id]?.toString() || ''}
                    onChangeText={(value) => handleStockChange(product.id, value)}
                  />
                  {hasValue && (
                    <CheckCircle
                      size={16}
                      color="#10B981"
                      weight="fill"
                      style={styles.checkIcon}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {!hasAnyStock && !isLoading && (
        <View style={styles.warningBox}>
          <Warning size={20} color="#D97706" />
          <Text style={styles.warningText}>
            Enter closing stock for at least one product to continue
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={18} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !hasAnyStock && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!hasAnyStock || closingStockMutation.isPending}
        >
          {closingStockMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Save & Continue</Text>
              <ArrowRight size={18} color="#FFF" weight="bold" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 32,
    backgroundColor: `${primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stockInfoRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stockBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeSupply: {
    backgroundColor: '#DBEAFE',
  },
  stockBadgeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
    marginLeft: 12,
  },
  input: {
    width: 70,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
  },
  inputFilled: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  checkIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
