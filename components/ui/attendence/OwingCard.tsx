import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { errorHandler } from "@/lib/axios/errorHandler";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { CurrencyNgn, SmileySad } from "phosphor-react-native";
import { formatPrice } from "@/lib/formatters/formatter";

interface OwingData {
  salesmanId: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  totaldebt: number;
  totalpaid: number;
}

interface OwingResponse {
  success: boolean;
  message: string;
  data: OwingData | null;
}

export default function OwingCard() {
  const owingQuery = useQuery({
    queryKey: ["salesmanCollection"],
    queryFn: async () => {
      const res = await api.get<OwingResponse>(API_ROUTES.ATTENDENCE.GET_MY_OWING);
      return res.data;
    },
  });

  useEffect(() => {
    if (owingQuery.isSuccess) {
      console.log(owingQuery.data);
    }
    if (owingQuery.isError) {
      errorHandler(owingQuery.error);
    }
  }, [owingQuery.isSuccess, owingQuery.isError]);

  if (owingQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4a90e2" />
      </View>
    );
  }

  if (!owingQuery.data?.data || owingQuery.data.data.totaldebt <= 0) {
    return null; // Don't render anything if no debt
  }

  const { totaldebt, totalpaid } = owingQuery.data.data;
  const balance = totalpaid - totaldebt;
  const isPositiveBalance = balance >= 0;

  return (
    <View style={styles.container}>
      <View style={[
        styles.card,
        isPositiveBalance ? styles.positiveCard : styles.negativeCard
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={styles.header}>
            <CurrencyNgn size={20} color={isPositiveBalance ? "#4CAF50" : "#F44336"} weight="fill" />
            <Text style={styles.title}>
              {isPositiveBalance ? "Payment Status" : "Outstanding Balance"}
            </Text>
          </View>
          <SmileySad size={32} color="#ed333b" weight="duotone" />
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Paid</Text>
            <Text style={styles.paidValue}>{formatPrice(totalpaid)}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Debt</Text>
            <Text style={styles.debtValue}>{formatPrice(totaldebt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  loadingContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  positiveCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  negativeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    color: '#666',
    fontSize: 14,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  detailItem: {

  },
  detailLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  debtValue: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
  paidValue: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    width: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 8,
  },
});