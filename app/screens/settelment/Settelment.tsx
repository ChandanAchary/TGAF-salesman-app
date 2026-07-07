import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { background, border, primary, text } from "@/constants/Colors";
import { api } from "@/lib/axios/axios";
import { ErrorResponse, Response } from "@/lib/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ColorValue } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Money, Receipt, Wallet, CheckCircle, WarningCircle, Info, ReceiptIcon } from "phosphor-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from "react-native-safe-area-context";

interface SalesmanSettlementHistoryResponse extends Response {
  data: {
    settlementData: {
      id: string;
      salesmanId: string;
      totaldebt: number;
      totalpaid: number;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
    } | null;
    history: {
      id: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
      salesmanId: string;
      debt: number;
      paid: number;
      collectionId: string;
    }[]
  }
}

type SalesmanSettlementParams = {
  salesmanId: string;
  paidAmt: number;
}

export default function Settelment() {
  const { id } = useLocalSearchParams();
  const [paidAmt, setPaidAmt] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');

  const salesmanSettlementHistory = useQuery({
    queryKey: ["salesmanSettlementHistory", id],
    queryFn: async () => {
      const res = await api.get<SalesmanSettlementHistoryResponse>(API_ROUTES.CITY_HEAD.SETTELMENT.GET_SETTLEMENT_HISTORY(id as string));
      return res.data;
    },
    enabled: !!id,
  })

  const settlementMutation = useMutation({
    mutationFn: async (data: SalesmanSettlementParams) => {
      const res = await api.post(API_ROUTES.CITY_HEAD.SETTELMENT.SALESMAN_SETTLEMENT, data);
      return res.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Settlement recorded successfully");
      salesmanSettlementHistory.refetch();
      setPaidAmt("");
    },
    onError: (error: ErrorResponse) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to record settlement");
    }
  })

  const handleSubmit = () => {
    if (!paidAmt || isNaN(Number(paidAmt))) {
      Alert.alert("Invalid Amount", "Please enter a valid numeric amount");
      return;
    }
    settlementMutation.mutate({
      salesmanId: id as string,
      paidAmt: Number(paidAmt),
    });
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIconContainer}>
        <ReceiptIcon size={24} color={primary} weight="duotone" />
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyDate}>
          {format(new Date(item.createdAt), 'dd MMM yyyy')}
        </Text>
        <Text style={styles.historyTime}>
          {format(new Date(item.createdAt), 'hh:mm a')}
        </Text>
      </View>
      <View style={styles.historyAmountContainer}>
        <Text style={styles.historyPaidAmount}>+₦{item.paid.toFixed(2)}</Text>
        <Text style={styles.historyDebtAmount}>Debt: ₦{item.debt.toFixed(2)}</Text>
      </View>
    </View>
  );

  const getBalanceStatus = (debt: number, paid: number) => {
    const balance = debt - paid;
    if (Math.abs(balance) < 0.01) return { status: 'Settled', color: ['#10B981', '#059669'], icon: CheckCircle };
    if (balance > 0) return { status: 'Outstanding', color: ['#EF4444', '#DC2626'], icon: WarningCircle };
    return { status: 'Credit', color: ['#3B82F6', '#2563EB'], icon: Info };
  };

  return (
    <SafeAreaView style={styles.container}>
      <TabBar title="Settlement" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'record' && styles.activeTab]}
            onPress={() => setActiveTab('record')}
          >
            <Text style={[styles.tabText, activeTab === 'record' && styles.activeTabText]}>Record Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'record' ? (
          <>
            {/* Current Balance Summary */}
            {salesmanSettlementHistory.data?.data.settlementData && (() => {
              const { totaldebt, totalpaid } = salesmanSettlementHistory.data.data.settlementData;
              const { status, color, icon: StatusIcon } = getBalanceStatus(totaldebt, totalpaid);
              const balance = totaldebt - totalpaid;
              const displayDebt = totaldebt < 0 ? 0 : totaldebt;

              return (
                <LinearGradient
                  colors={color as [ColorValue, ColorValue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.balanceCard}
                >
                  <View style={styles.balanceHeader}>
                    <View style={styles.statusContainer}>
                      <StatusIcon size={24} color="#fff" weight="fill" />
                      <Text style={styles.statusText}>{status}</Text>
                    </View>
                    <Wallet size={32} color="rgba(255,255,255,0.8)" weight="duotone" />
                  </View>

                  <View style={styles.mainBalanceContainer}>
                    <Text style={styles.mainBalanceLabel}>Net Balance</Text>
                    <Text style={styles.mainBalanceValue}>
                      ₦{Math.abs(balance).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.balanceRow}>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>Total Debt</Text>
                      <Text style={styles.balanceValue}>
                        ₦{displayDebt.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>Total Paid</Text>
                      <Text style={styles.balanceValue}>
                        ₦{totalpaid.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              );
            })()}
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <View style={styles.currencySymbolContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={paidAmt}
                  onChangeText={setPaidAmt}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity
                style={[styles.submitButton, settlementMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={settlementMutation.isPending}
              >
                {settlementMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Money size={20} color="#fff" weight="bold" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Record Payment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.historyContainer}>
            {salesmanSettlementHistory.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={primary} />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : salesmanSettlementHistory.isError ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={24} color="#FF3B30" />
                <Text style={styles.errorText}>Failed to load history</Text>
              </View>
            ) : (
              <FlatList
                data={salesmanSettlementHistory.data?.data.history || []}
                keyExtractor={(item) => item.id}
                renderItem={renderHistoryItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Receipt size={48} color="#ddd" weight="duotone" />
                    <Text style={styles.emptyText}>No settlement history found</Text>
                  </View>
                }
              />
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  mainBalanceContainer: {
    marginBottom: 24,
  },
  mainBalanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  mainBalanceValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  balanceItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#eee",
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: text.secondary,
  },
  activeTabText: {
    color: primary,
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: text.primary,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: border,
    marginBottom: 12,
    height: 56,
    overflow: 'hidden',
  },
  currencySymbolContainer: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: border,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: text.secondary,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 18,
    color: text.primary,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primary,
    borderRadius: 12,
    height: 50,
    shadowColor: primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: border,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF', // Blue-50
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: text.secondary,
  },
  historyAmountContainer: {
    alignItems: 'flex-end',
  },
  historyPaidAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981', // Emerald-500
    marginBottom: 2,
  },
  historyDebtAmount: {
    fontSize: 12,
    color: text.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginLeft: 8,
    color: text.secondary,
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    color: '#EF4444',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    color: text.secondary,
    fontSize: 15,
  },
});