import React, { useState } from "react";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import TabBar from "@/components/ui/layout/TabBar";
import { secondary, primary } from "@/constants/Colors";
import { formatPrice } from "@/lib/formatters/formatter";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRefreshOnFocus } from "@/hooks/useRefetchOnFocus";
import { Receipt, ArrowDown, ArrowUp } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Collection {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  customerId: string;
  orderId: string;
  totaldebt: number;
  totalpaid: number;
  CustomerCollectionHistory: {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    customerId: string;
    orderId: string;
    paid: number;
    debt: number;
    collectionId: string;
  }[];
}

interface CollectionResponse {
  success: boolean;
  message: string;
  data: Collection[];
}

export default function CollectionHistory() {
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  const collectionQuery = useQuery({
    queryKey: ["collection History", id],
    queryFn: async () => {
      const res = await api.get<CollectionResponse>(API_ROUTES.CUSTOMER.GET_CUSTOMER_COLLECTION(id as string))
      return res.data;
    }
  });

  const collectionRefetch = collectionQuery.refetch;
  useRefreshOnFocus(collectionRefetch);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await collectionQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const collections = collectionQuery.data?.data || [];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <TabBar title="HISTORY" />

      {/* Content */}
      {collectionQuery.isFetching && !refreshing ? (
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
          {collections.length === 0 ? (
            <View style={styles.emptyState}>
              <Receipt size={48} color="#E5E7EB" weight="duotone" />
              <Text style={styles.emptyText}>No collection history found</Text>
            </View>
          ) : (
            collections.map((collection) => (
              <View key={collection.id} style={styles.collectionCard}>
                {/* Collection Header */}
                <View style={styles.collectionHeader}>
                  <View style={styles.collectionMeta}>
                    <Text style={styles.collectionId}>
                      COLLECTION #{collection.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <Text style={styles.collectionDate}>
                      {new Date(collection.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.collectionTotals}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Debt:</Text>
                      <Text style={[styles.totalAmount, styles.debtAmount]}>
                        ₦{formatPrice(collection.totaldebt)}
                      </Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Paid:</Text>
                      <Text style={[styles.totalAmount, styles.paidAmount]}>
                        ₦{formatPrice(collection.totalpaid)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Collection History Items */}
                <View style={styles.historyContainer}>
                  {collection.CustomerCollectionHistory.map((history) => (
                    <View key={history.id} style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        {history.paid > 0 ? (
                          <ArrowDown size={20} color="#10B981" weight="bold" />
                        ) : (
                          <ArrowUp size={20} color="#EF4444" weight="bold" />
                        )}
                      </View>
                      <View style={styles.historyDetails}>
                        <Text style={styles.historyDate}>
                          {new Date(history.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        <View style={styles.historyAmounts}>
                          {history.paid > 0 && (
                            <Text style={[styles.historyAmount, styles.paidAmount]}>
                              Paid: ₦{formatPrice(history.paid)}
                            </Text>
                          )}
                          {history.debt > 0 && (
                            <Text style={[styles.historyAmount, styles.debtAmount]}>
                              Debt: ₦{formatPrice(history.debt)}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
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
  collectionCard: {
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
  collectionHeader: {
    marginBottom: 16,
  },
  collectionMeta: {
    marginBottom: 8,
  },
  collectionId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  collectionDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  collectionTotals: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  debtAmount: {
    color: '#EF4444',
  },
  paidAmount: {
    color: '#10B981',
  },
  historyContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  historyAmounts: {
    flexDirection: 'row',
    gap: 12,
  },
  historyAmount: {
    fontSize: 13,
    fontWeight: '500',
  },
});