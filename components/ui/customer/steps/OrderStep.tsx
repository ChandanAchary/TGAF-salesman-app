import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import {
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Package,
  SkipForward,
  ShoppingBagOpen,
} from 'phosphor-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios/axios';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { CreateOrderParams } from '@/shared/zod';
import { primary } from '@/constants/Colors';
import { formatPrice } from '@/lib/formatters/formatter';
import { ErrorResponse } from '@/lib/types/types';
import Toast from 'react-native-toast-message';
import { CollectionModel } from '@/components/ui/Order/CollectionModel';
import { errorHandler } from '@/lib/axios/errorHandler';

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

interface OrderItemData {
  productId: string;
  quantity: number;
  price: number;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  orderId: string | null;
  product: {
    name: string;
    productImg: string;
  };
}

interface Order {
  customerId: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  totalPrice: number;
  items: OrderItemData[];
  approved: boolean;
}

interface OrderResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderStepProps {
  customerId: string;
  onComplete: (orderData: OrderItem[]) => void;
  onBack: () => void;
  onSkip: () => void;
  orderData: OrderItem[];
  setOrderData: React.Dispatch<React.SetStateAction<OrderItem[]>>;
}

export default function OrderStep({
  customerId,
  onComplete,
  onBack,
  onSkip,
  orderData,
  setOrderData,
}: OrderStepProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [isCollectionModelOpen, setIsCollectionModelOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    orderData.forEach((item) => {
      initial[item.productId] = item.quantity;
    });
    return initial;
  });
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    orderData.forEach((item) => {
      initial[item.productId] = item.price;
    });
    return initial;
  });

  // Query for existing orders
  const orderQuery = useQuery({
    queryKey: ['orders', customerId],
    queryFn: async () => {
      const res = await api.get<OrderResponse>(
        API_ROUTES.CUSTOMER.GET_ORDERS(customerId)
      );
      return res.data;
    },
  });

  const productQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get<ProductResponse>(
        API_ROUTES.PRODUCT.GET_PRODUCTS_WITH_PRICES("Retail")
      );
      return res.data;
    },
    enabled: showCreateOrder,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.CREATE_ORDER, data);
      return res.data;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Order Created',
        text2: 'Your order has been placed successfully',
      });
      const orderItems = buildOrderItems();
      setOrderData(orderItems);
      orderQuery.refetch();
      setShowCreateOrder(false);
      // Reset quantities and prices
      setQuantities({});
      setPrices({});
    },
    onError: (error: ErrorResponse) => {
      // Toast.show({
      //   type: 'error',
      //   text1: 'Order Failed',
      //   text2: error.response?.data?.message || 'Failed to create order',
      // });
      Alert.alert('Order Failed', error.response?.data?.message || 'Failed to create order');
    },
  });

  const deliverMutation = useMutation({
    mutationFn: async (data: { customerId: string; orderId: string }) => {
      const res = await api.post(
        API_ROUTES.CUSTOMER.DELIVER(data.customerId, data.orderId)
      );
      return res.data;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Delivery Successful',
        text2: 'Order has been marked as delivered',
      });
      orderQuery.refetch();
    },
    onError: (error) => {
      errorHandler(error);
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (showCreateOrder) {
        await productQuery.refetch();
      } else {
        await orderQuery.refetch();
      }
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

  const buildOrderItems = (): OrderItem[] => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => {
        const product = productQuery.data?.data.find((p) => p.id === productId);
        return {
          productId,
          productName: product?.name || '',
          quantity,
          price: prices[productId] ?? product?.price ?? 0,
        };
      });
  };

  const handlePlaceOrder = () => {
    const orderItems = buildOrderItems();
    if (orderItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Items Selected',
        text2: 'Please add at least one item to place an order',
      });
      return;
    }

    createOrderMutation.mutate({
      customerId,
      orderItems: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };

  const handleContinueToSummary = () => {
    onSkip();
  };

  const orders = orderQuery.data?.data || [];

  const selectedItems =
    productQuery.data?.data.filter((p) => quantities[p.id] > 0) ?? [];
  const totalPrice = selectedItems.reduce(
    (sum, p) =>
      sum + (prices[p.id] ?? p.price ?? 0) * (quantities[p.id] ?? 0),
    0
  );
  const totalItems = selectedItems.reduce(
    (sum, p) => sum + (quantities[p.id] ?? 0),
    0
  );

  // Render Order History View
  const renderOrderHistory = () => (
    <>
      <CollectionModel
        open={isCollectionModelOpen}
        setOpen={setIsCollectionModelOpen}
        selectedOrder={selectedOrder}
      />

      {orderQuery.isLoading && !refreshing ? (
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
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <ShoppingBagOpen size={48} color="#E5E7EB" weight="duotone" />
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>
                Create a new order for this customer
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderId}>
                      ORDER #{order.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>
                    {formatPrice(order.totalPrice)}
                  </Text>
                </View>

                {/* Order Items */}
                <View style={styles.itemsContainer}>
                  {order.items.slice(0, 2).map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Image
                        source={{
                          uri: item.product.productImg || '/default.img',
                        }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.product.name}
                        </Text>
                        <Text style={styles.itemQuantity}>
                          {item.quantity} × {formatPrice(item.price)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {order.items.length > 2 && (
                    <Text style={styles.moreItems}>
                      +{order.items.length - 2} more items
                    </Text>
                  )}
                </View>

                {/* Order Actions */}
                <View style={styles.actionButtons}>
                  {order.approved ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.collectionButton]}
                      onPress={() => {
                        setIsCollectionModelOpen(true);
                        setSelectedOrder(order);
                      }}
                    >
                      <Text style={styles.collectionButtonText}>
                        Collect Payment
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deliveryButton]}
                      onPress={() => {
                        deliverMutation.mutate({
                          customerId,
                          orderId: order.id,
                        });
                      }}
                      disabled={deliverMutation.isPending}
                    >
                      {deliverMutation.isPending ? (
                        <ActivityIndicator size="small" color="#3B82F6" />
                      ) : (
                        <Text style={styles.deliveryButtonText}>
                          Deliver Now
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={18} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createOrderButton}
          onPress={() => setShowCreateOrder(true)}
        >
          <Plus size={18} color="#FFF" />
          <Text style={styles.createOrderButtonText}>New Order</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinueToSummary}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <ArrowRight size={18} color="#FFF" weight="bold" />
        </TouchableOpacity>
      </View>
    </>
  );

  // Render Create Order View
  const renderCreateOrder = () => (
    <>
      {/* Order Summary Bar */}
      {totalItems > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryLeft}>
            <Package size={18} color="#FFF" />
            <Text style={styles.summaryText}>
              {totalItems} item{totalItems > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.summaryPrice}>{formatPrice(totalPrice)}</Text>
        </View>
      )}

      {productQuery.isLoading ? (
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
            const qty = quantities[product.id] || 0;
            const isSelected = qty > 0;

            return (
              <View
                key={product.id}
                style={[
                  styles.productCard,
                  isSelected && styles.productCardSelected,
                ]}
              >
                <Image
                  source={{
                    uri:
                      product.productImg || 'https://via.placeholder.com/150',
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {product.price ? formatPrice(product.price) : 'N/A'}
                  </Text>
                  {isSelected && (
                    <TextInput
                      style={styles.priceInput}
                      keyboardType="numeric"
                      placeholder="Price"
                      value={
                        prices[product.id] !== undefined
                          ? prices[product.id].toString()
                          : product.price?.toString() ?? ''
                      }
                      onChangeText={(value) =>
                        handlePriceChange(product.id, value)
                      }
                    />
                  )}
                </View>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      !qty && styles.quantityButtonDisabled,
                    ]}
                    onPress={() => handleDecrement(product.id)}
                    disabled={!qty}
                  >
                    <Minus size={16} color={qty ? primary : '#D1D5DB'} />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={qty.toString()}
                    onChangeText={(value) =>
                      handleQuantityChange(product.id, value)
                    }
                  />

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleIncrement(product.id)}
                  >
                    <Plus size={16} color={primary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowCreateOrder(false)}
        >
          <ArrowLeft size={18} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            totalItems === 0 && styles.placeOrderButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={createOrderMutation.isPending || totalItems === 0}
        >
          {createOrderMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.placeOrderButtonText}>
                Place Order {totalItems > 0 && `• ${formatPrice(totalPrice)}`}
              </Text>
              <ArrowRight size={18} color="#FFF" weight="bold" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {showCreateOrder ? renderCreateOrder() : renderOrderHistory()}
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
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryPrice: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
  // Order History Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderMeta: {
    flex: 1,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreItems: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionButton: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  collectionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  deliveryButton: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  deliveryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  // Product Card Styles
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
  productCardSelected: {
    borderColor: primary,
    backgroundColor: `${primary}05`,
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
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  priceInput: {
    marginTop: 4,
    width: 80,
    height: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#FFF',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  quantityInput: {
    width: 40,
    height: 36,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 4,
  },
  // Button Styles
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
    paddingHorizontal: 16,
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
  createOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  createOrderButtonText: {
    color: '#FFF',
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
  continueButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  placeOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  placeOrderButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: primary,
    backgroundColor: '#FFF',
  },
  skipButtonText: {
    color: primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
