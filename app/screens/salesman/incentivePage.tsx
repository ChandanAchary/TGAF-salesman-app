import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { Response } from "@/lib/types/types";
import { useQuery } from "@tanstack/react-query";
import { Image, Text, View, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, useAppTheme } from "@/constants/Theme";
import { LinearGradient } from "expo-linear-gradient";

interface MyCoinsResponse extends Response {
  data: number;
}

interface MyCoinsSettlementHistoryResponse extends Response {
  data: {
    salesmanId: string;
    date: Date;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    amount: number;
    coinAmount: number;
  }[]
}

export default function incentivePage() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  const myCoinsQuery = useQuery({
    queryKey: ['myCoins'],
    queryFn: async () => {
      const res = await api.get<MyCoinsResponse>(API_ROUTES.SALESMAN.GET_MY_COINS);
      return res.data;
    }
  });

  const myCoinsSettlementHistoryQuery = useQuery({
    queryKey: ['myCoinsSettlementHistory'],
    queryFn: async () => {
      const res = await api.get<MyCoinsSettlementHistoryResponse>(API_ROUTES.SALESMAN.GET_MY_COINS_SETTLEMENT_HISTORY);
      return res.data;
    }
  });

  if (myCoinsQuery.isLoading || myCoinsSettlementHistoryQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TabBar title="Incentives" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const coins = myCoinsQuery.data?.data ?? 0;
  const settlementHistory = myCoinsSettlementHistoryQuery.data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabBar title="Incentives" />

      <LinearGradient
        colors={colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          padding: 24, 
          borderRadius: Theme.radius.xl, 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          margin: 16, 
          marginVertical: 24,
          ...Theme.shadows.md,
        }}
      >
        <Image
          source={require('@/assets/images/coins.png')}
          style={{ width: 80, height: 80, marginRight: 10, resizeMode: "contain" }}
        />

        <View style={{ display: "flex", justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'column' }}>
          <Text style={{ color: '#fff', fontSize: 32, fontFamily: Theme.typography.fontFamily.bold }}>
            {coins}
          </Text>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, fontFamily: Theme.typography.fontFamily.semiBold, marginTop: 4 }}>Coins Earned</Text>
        </View>
      </LinearGradient>

      <Text style={{ 
        marginLeft: 20, 
        marginBottom: 12, 
        fontFamily: Theme.typography.fontFamily.bold, 
        fontSize: Theme.typography.sizes.h3, 
        color: colors.text.primary 
      }}>
        Settlement History
      </Text>

      <ScrollView style={{ flex: 1, marginHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        {settlementHistory.length === 0 ? (
          <Text style={{ color: colors.text.muted, textAlign: 'center', marginTop: 32, fontFamily: Theme.typography.fontFamily.regular }}>
            No settlements yet.
          </Text>
        ) : (
          settlementHistory.map(item => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: Theme.radius.md,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
                ...Theme.shadows.sm,
              }}
            >
              <MaterialIcons
                name={item.isActive ? "check-circle" : "history"}
                size={28}
                color={item.isActive ? colors.success : colors.text.muted}
                style={{ marginRight: 16 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontFamily: Theme.typography.fontFamily.bold, 
                  fontSize: Theme.typography.sizes.body, 
                  color: colors.text.primary 
                }}>
                  ₹{item.amount} / {item.coinAmount} coins
                </Text>
                <Text style={{ 
                  color: colors.text.secondary, 
                  fontSize: Theme.typography.sizes.bodySm, 
                  marginTop: 2,
                  fontFamily: Theme.typography.fontFamily.regular 
                }}>
                  {new Date(item.date).toLocaleDateString()} {item.isActive ? "(Active)" : "(Settled)"}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}