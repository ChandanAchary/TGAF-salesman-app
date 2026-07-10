import { View, Text, ScrollView, StyleSheet, Image, RefreshControl, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/axios";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { useLocalSearchParams } from "expo-router";
import { Response } from "@/lib/types/types";
import { useState } from "react";
import { formatPrice } from "@/lib/formatters/formatter";
import TabBar from "@/components/ui/layout/TabBar";
import { Theme, useAppTheme } from "@/constants/Theme";
import { ShoppingBagOpen, Receipt, Package } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Order {
    AdminOrderItems: {
        id: string;
        createdAt: Date;
        productId: string;
        quantity: number;
        price: number;
        product: {
            name: string;
            productImg: string;
        };
    }[];
    distributorId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    totalPrice: number;
    paymentProofUrl: string | null;
    approved: boolean;
    invoiced: boolean;
}

interface OrderResponse extends Response {
    data: Order[];
}

export default function OrderHistory() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const { distributorId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", distributorId],
    queryFn: async () => {
      const res = await api.get<OrderResponse>(API_ROUTES.CITY_HEAD.ORDER.GET_ADMIN_ORDERS(distributorId as string));
      return res.data;
    },
  });

  const handleProof = (url: string) => {
    Linking.openURL(url);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const orders = data?.data || [];

//   if(data) console.log(data.data[0].AdminOrderItems);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabBar title="ORDER HISTORY" />

      {isLoading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <ShoppingBagOpen size={48} color={colors.text.muted} weight="duotone" />
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No orders found</Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderMeta}>
                    <Text style={[styles.orderId, { color: colors.text.primary }]}>ORDER #{order.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={[styles.orderDate, { color: colors.text.secondary }]}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.orderStatus}>
                    <View style={[
                      styles.statusBadge,
                      order.approved ? styles.approvedBadge : styles.pendingBadge
                    ]}>
                      <Text style={styles.statusText}>
                        {order.approved ? 'Approved' : 'Pending'}
                      </Text>
                    </View>
                    {order.invoiced && (
                      <View style={[styles.statusBadge, styles.invoicedBadge]}>
                        <Text style={styles.statusText}>Invoiced</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Order Items */}
                <View style={[styles.itemsContainer, { borderTopColor: colors.border }]}>
                  {order.AdminOrderItems.slice(0, 2).map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Image
                        source={{ uri: item.product.productImg || "https://via.placeholder.com/150" }}
                        style={[styles.itemImage, { backgroundColor: isDark ? '#1e293b' : '#F3F4F6' }]}
                        resizeMode="cover"
                      />
                      <View style={styles.itemDetails}>
                        <Text style={[styles.itemName, { color: colors.text.primary }]} numberOfLines={1}>
                          {item.product.name}
                        </Text>
                        <View style={styles.itemMeta}>
                          <Text style={[styles.itemQuantity, { color: colors.text.secondary }]}>
                            {item.quantity} × {item.price}
                          </Text>
                          <Text style={[styles.itemTotal, { color: colors.text.primary }]}>
                            {item.quantity * item.price}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                  {order.AdminOrderItems.length > 2 && (
                    <Text style={[styles.moreItems, { color: colors.text.muted }]}>
                      +{order.AdminOrderItems.length - 2} more items
                    </Text>
                  )}
                </View>

                {/* Order Summary */}
                <View style={[styles.orderSummary, { borderTopColor: colors.border }]}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Total Items</Text>
                    <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
                      {order.AdminOrderItems.length}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Total Quantity</Text>
                    <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
                      {order.AdminOrderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </Text>
                  </View>
                </View>

                {/* Order Footer */}
                <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.totalContainer}>
                    <Text style={[styles.totalLabel, { color: colors.text.secondary }]}>Total Amount</Text>
                    <Text style={[styles.orderTotal, { color: colors.primary }]}>
                      {order.totalPrice}
                    </Text>
                  </View>
                  {order.paymentProofUrl && (
                    <TouchableOpacity 
                      style={[styles.proofButton, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.05)' }]}
                      onPress={() => order.paymentProofUrl && handleProof(order.paymentProofUrl)}
                    >
                      <Receipt size={16} color={colors.primary} />
                      <Text style={[styles.proofButtonText, { color: colors.primary }]}>View Proof</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e7ff",
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
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
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
  orderStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  invoicedBadge: {
    backgroundColor: '#DBEAFE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  moreItems: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  proofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  proofButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
});