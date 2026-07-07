import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios/axios';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { primary, secondary } from '@/constants/Colors';
import { formatPrice } from '@/lib/formatters/formatter';
import { CreateCollectionHistoryParams } from '@/shared/zod';
import { ErrorResponse } from '@/lib/types/types';

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

interface CustomerCollectionHistory {
  customerId: string;
  orderId: string;
  paid: number;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  debt: number;
  collectionId: string;
}

interface Collection {
  customerId: string;
  orderId: string;
  id: string;
  totaldebt: number;
  totalpaid: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  CustomerCollectionHistory: CustomerCollectionHistory[];
}

interface CollectionQueryData {
  success: boolean;
  message: string;
  data: Collection | null;
}

interface CollectionModelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedOrder: Order | null;
}

export const CollectionModel: React.FC<CollectionModelProps> = ({ open, setOpen, selectedOrder }) => {
  const [paid, setPaid] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderCollection = useQuery({
    queryKey: ['orderCollection', selectedOrder?.id],
    queryFn: async () => {
      const res = await api.get<CollectionQueryData>(API_ROUTES.CUSTOMER.GET_ORDER_COLLECTION(selectedOrder?.id || '', selectedOrder?.customerId || ''));
      return res.data;
    }
  });

  const addCollectionMutation = useMutation({
    mutationFn: async (data: CreateCollectionHistoryParams) => {
      if (!selectedOrder) return;
      const res = await api.post(API_ROUTES.CUSTOMER.UPDATE_ORDER_COLLECTION, data);
      return res.data;
    },
    onError: (error: ErrorResponse) => {
      alert(error?.response?.data?.message);
    }
  })

  const handleSubmit = () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    addCollectionMutation.mutateAsync({
      orderId: selectedOrder.id,
      customerId: selectedOrder.customerId,
      paid: parseFloat(paid),
    })
      .then(() => {
        setPaid('');
        orderCollection.refetch();
      })
      .catch((error) => {
        console.log('Error adding collection:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      onRequestClose={() => setOpen(false)}
      transparent={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Collection</Text>
          <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeButton}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {selectedOrder ? (
            <>
              {/* Order Summary Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Order Summary</Text>
                  <Text style={styles.orderDate}>
                    {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy')}
                  </Text>
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>{formatPrice(selectedOrder.totalPrice)}</Text>
                </View>

                {/* Order Items */}
                <View style={styles.itemsContainer}>
                  {selectedOrder.items.map((item) => (
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
                        <Text style={styles.itemMeta}>
                          {item.quantity} × ₦{item.price.toFixed(2)}
                        </Text>
                      </View>
                      <Text style={styles.itemTotal}>
                        {formatPrice(item.quantity * item.price)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Payment Status Card */}
              {orderCollection.data?.data && (
                <View style={{...styles.card, backgroundColor: orderCollection.data.data.totaldebt > 0 ? '#FEE2E2' : '#D1FAE5'}}>
                  <Text style={styles.cardTitle}>Payment Status</Text>

                  <View style={styles.paymentStatusContainer}>
                    <View style={styles.paymentStatusRow}>
                      <Text style={styles.paymentLabel}>Total Paid:</Text>
                      <Text style={styles.paymentValue}>
                        {formatPrice(orderCollection.data.data.totalpaid)}
                      </Text>
                    </View>
                    <View style={styles.paymentStatusRow}>
                      <Text style={styles.paymentLabel}>Remaining Debt:</Text>
                      <Text style={[styles.paymentValue, styles.debtValue]}>
                        {formatPrice(orderCollection.data.data.totaldebt)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Payment History */}
              {orderCollection.data?.data && orderCollection.data.data.CustomerCollectionHistory.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Payment History</Text>

                  <View style={styles.historyContainer}>
                    {orderCollection.data.data.CustomerCollectionHistory.map((history) => (
                      <View key={history.id} style={styles.historyItem}>
                        <View style={styles.historyLeft}>
                          <Feather name="check-circle" size={16} color="#10B981" />
                          <Text style={styles.historyDate}>
                            {format(new Date(history.createdAt), 'MMM dd, hh:mm a')}
                          </Text>
                        </View>
                        <View style={styles.historyRight}>
                          <Text style={styles.historyAmount}>₦{history.paid.toFixed(2)}</Text>
                          <Text style={styles.historyDebt}>Debt: ₦{history.debt.toFixed(2)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Payment Input */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>New Payment</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Amount (₦)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={paid}
                    onChangeText={setPaid}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Record Payment</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Feather name="shopping-bag" size={48} color="#E5E7EB" />
              <Text style={styles.emptyStateText}>No order selected</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
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
  itemMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  paymentStatusContainer: {
    marginTop: 8,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  debtValue: {
    color: '#EF4444',
  },
  historyContainer: {
    marginTop: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  historyDebt: {
    fontSize: 12,
    color: '#6B7280',
  },
  inputContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});