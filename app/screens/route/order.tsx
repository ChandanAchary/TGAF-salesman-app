import React from "react";
import TabBar from "@/components/ui/layout/TabBar";
import { CollectionModel } from "@/components/ui/Order/CollectionModel";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { primary, secondary } from "@/constants/Colors";
import { useRefreshOnFocus } from "@/hooks/useRefetchOnFocus";
import { api } from "@/lib/axios/axios";
import { errorHandler } from "@/lib/axios/errorHandler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus, ShoppingBagOpen } from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";

interface OrderItem {
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
  }
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
  items: OrderItem[];
  approved: boolean;
}

interface OrderResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isCollecitonModelOpen, setIsCollectionModelOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orderQuery = useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      if (typeof id == "string") {
        const res = await api.get<OrderResponse>(
          API_ROUTES.CUSTOMER.GET_ORDERS(id)
        );
        return res.data;
      }
    },
  });

  const orderRefetch = orderQuery.refetch;;
  useRefreshOnFocus(orderRefetch);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await orderQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const orders = orderQuery.data?.data || [];

  const deleverMuation = useMutation({
    mutationFn: async (data: { customerId: string, orderId: string }) => {
      const res = await api.post(
        API_ROUTES.CUSTOMER.DELIVER(data.customerId, data.orderId)
      );
      return res.data;
    },
    onSuccess: () => {
      orderQuery.refetch();
    },
    onError: (error) => {
      errorHandler(error);
    },
  })

  return (
    <>
      <CollectionModel
        open={isCollecitonModelOpen}
        setOpen={setIsCollectionModelOpen}
        selectedOrder={selectedOrder}
      />

      <View style={styles.container}>
        {/* Header */}
        <TabBar title="ORDERS" />

        {/* Content */}
        {orderQuery.isFetching && !refreshing ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4F46E5"
              />
            }
          >
            {orders.length === 0 ? (
              <View style={styles.emptyState}>
                <ShoppingBagOpen size={48} color="#E5E7EB" weight="duotone" />
                <Text style={styles.emptyText}>No orders found</Text>
              </View>
            ) : (
              orders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderMeta}>
                      <Text style={styles.orderId}>ORDER #{order.id.slice(0, 8).toUpperCase()}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                    <Text style={styles.orderTotal}>
                      ₦{order.totalPrice.toFixed(2)}
                    </Text>
                  </View>

                  {/* Order Items */}
                  <View style={styles.itemsContainer}>
                    {order.items.slice(0, 2).map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Image
                          source={{ uri: item.product.productImg || "/default.img" }}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.product.name}
                          </Text>
                          <Text style={styles.itemQuantity}>
                            {item.quantity} × ₦{item.price.toFixed(2)}
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
                        <Text style={styles.actionButtonText}>Collect Payment</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deliveryButton]}
                        onPress={() => {
                          if (typeof id !== "string") return;
                          deleverMuation.mutate({
                            customerId: id,
                            orderId: order.id
                          });
                        }}
                      >
                        <Text style={styles.actionButtonText}>Deliver Now</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/screens/route/createOrder?id=${encodeURIComponent(id as string)}`)}
        >
          <Plus size={24} color="white" weight="bold" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    marginHorizontal: 4,
  },
  collectionButton: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  deliveryButton: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});