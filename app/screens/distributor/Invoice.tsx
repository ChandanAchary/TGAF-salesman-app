import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput, Pressable } from "react-native";
import { secondary, primary, primaryLight } from "@/constants/Colors";
import TabBar from "@/components/ui/layout/TabBar";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatters/formatter";
import { RecieveInvoiceParams } from "@/shared/zod";
import { LinearGradient } from 'expo-linear-gradient';
import ModalView from "@/components/ui/layout/Modal";
import { X } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface InvoiceData {
  id: string;
  distributorId: string;
  totalPrice: number;
  approved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  orderId: string;
  InvoiceItems: {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    productId: string;
    quantity: number;
    price: number;
    invoiceId: string | null;
    recived: boolean;
    recivedQuantity: number | null;
    product: {
      productImg: string;
      name: string;
    };
  }[];
}

interface InvoiceResponse {
  success: boolean;
  message: string;
  data: InvoiceData[];
}

interface ReceiveItemsInput {
  invoiceId: string;
  items: {
    id: string;
    recivedQuantity: number;
  }[];
}

export default function Invoice() {
  const { distributorId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isReceiveModalVisible, setIsReceiveModalVisible] = useState(false);
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});

  const invoiceQuery = useQuery({
    queryKey: ["invoices", distributorId],
    queryFn: async () => {
      const res = await api.get<InvoiceResponse>(API_ROUTES.CITY_HEAD.ORDER.GET_INVOICES(distributorId as string));
      return res.data;
    }
  });

  const receiveMutation = useMutation({
    mutationFn: async (data: RecieveInvoiceParams) => {
      const res = await api.post(API_ROUTES.CITY_HEAD.ORDER.RECEIVE_INVOICE_ITEMS, data);
      return res.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Items received successfully!");
      setIsReceiveModalVisible(false);
      setSelectedInvoice(null);
      setReceivedQuantities({});
      invoiceQuery.refetch();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to receive items");
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invoiceQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleReceivePress = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
    // Initialize received quantities with current quantities
    const initialQuantities: Record<string, number> = {};
    invoice.InvoiceItems.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setReceivedQuantities(initialQuantities);
    setIsReceiveModalVisible(true);
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const num = parseInt(value, 10);
    setReceivedQuantities(prev => ({
      ...prev,
      [itemId]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  const handleSubmitReceive = () => {
    if (!selectedInvoice) return;

    const items = Object.entries(receivedQuantities).map(([id, recivedQuantity]) => ({
      id,
      recivedQuantity
    }));

    receiveMutation.mutate({
      invoiceId: selectedInvoice.id,
      items
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TabBar title="INVOICE" />

      {/* Content */}
      {invoiceQuery.isFetching && !refreshing ? (
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
          {invoiceQuery.data?.data.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No invoices found</Text>
            </View>
          ) : (
            invoiceQuery.data?.data.map((invoice) => (
              <View key={invoice.id} style={styles.invoiceCard}>
                {/* Invoice Header */}
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceMeta}>
                    <Text style={styles.invoiceId}>INVOICE #{invoice.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.invoiceDate}>
                      {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <Text style={styles.invoiceTotal}>
                    {formatPrice(invoice.totalPrice)}
                  </Text>
                </View>

                {/* Invoice Items */}
                <View style={styles.itemsContainer}>
                  {invoice.InvoiceItems.slice(0, 2).map((item) => (
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
                          {item.quantity} × {formatPrice(item.price)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {invoice.InvoiceItems.length > 2 && (
                    <Text style={styles.moreItems}>
                      +{invoice.InvoiceItems.length - 2} more items
                    </Text>
                  )}
                </View>

                {/* Invoice Actions */}
                <View style={styles.actionButtons}>
                  {!invoice.InvoiceItems.every(item => item.recived) && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.receiveButton]}
                      onPress={() => handleReceivePress(invoice)}
                    >
                      <Text style={styles.actionButtonText}>Receive Items</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Receive Modal */}
      <ModalView
        isReceiveModalVisible={isReceiveModalVisible}
        setIsReceiveModalVisible={setIsReceiveModalVisible}
      >
        <View style={styles.modalContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 }}>
            <Text style={styles.modalTitle}>Receive Items</Text>
            <TouchableOpacity
              onPress={() => {
                setIsReceiveModalVisible(false);
                setSelectedInvoice(null);
                setReceivedQuantities({});
              }}
            >
              <X size={24} color="hotpink" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {selectedInvoice?.InvoiceItems.map((item) => (
              <View key={item.id} style={styles.modalItem}>
                <View style={styles.modalItemInfo}>
                  <Text style={styles.modalItemName}>{item.product.name}</Text>
                  <Text style={styles.modalItemQuantity}>
                    Ordered: {item.quantity}
                  </Text>
                </View>
                <View style={styles.modalItemInput}>
                  <Text style={styles.modalItemLabel}>Received:</Text>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={receivedQuantities[item.id]?.toString() || '0'}
                    onChangeText={(value) => handleQuantityChange(item.id, value)}
                  />
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmitReceive}
              disabled={receiveMutation.isPending}
            >
              {receiveMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ModalView>
    </SafeAreaView>
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
  invoiceCard: {
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
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceMeta: {
    flex: 1,
  },
  invoiceId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  invoiceDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  invoiceTotal: {
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
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  receiveButton: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
    maxHeight: '80%',
    minHeight: "50%"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: '70%',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  modalItemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalItemInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    borderColor: 'hotpink',
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: primaryLight,
    width: '100%',
    borderColor: primary,
    borderWidth: 1,
    color: primary,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: primary,
  },
});