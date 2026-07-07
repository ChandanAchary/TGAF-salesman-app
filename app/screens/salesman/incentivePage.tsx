import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes"
import { primary, secondary } from "@/constants/Colors";
import { api } from "@/lib/axios/axios"
import { Response } from "@/lib/types/types";
import { useQuery } from "@tanstack/react-query"
import { Image, Text, View, ScrollView } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

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

  const myCoinsQuery = useQuery({
    queryKey: ['myCoins'],
    queryFn: async () => {
      const res = await api.get<MyCoinsResponse>(API_ROUTES.SALESMAN.GET_MY_COINS);
      return res.data;
    }
  })

  const myCoinsSettlementHistoryQuery = useQuery({
    queryKey: ['myCoinsSettlementHistory'],
    queryFn: async () => {
      const res = await api.get<MyCoinsSettlementHistoryResponse>(API_ROUTES.SALESMAN.GET_MY_COINS_SETTLEMENT_HISTORY);
      return res.data;
    }
  })

  if (myCoinsQuery.isLoading || myCoinsSettlementHistoryQuery.isLoading) {
    return <Text>Loading...</Text>
  }

  const coins = myCoinsQuery.data?.data ?? 0;
  const settlementHistory = myCoinsSettlementHistoryQuery.data?.data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: secondary }}>
      <TabBar title="INCENTIVES" />

      <View style={{ padding: 30, borderRadius: 20, backgroundColor: primary, flexDirection: 'row', justifyContent: 'space-between', margin: 20, marginVertical: 40 }}>
        <Image
          source={require('@/assets/images/coins.png')}
          style={{ width: 100, height: 100, marginRight: 10 }}
        />

        <View style={{ display: "flex", justifyContent: 'space-between', alignItems: 'flex-end', flexDirection: 'column' }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
            {coins}
          </Text>
          <Text style={{ color: '#ddd', fontSize: 14, fontWeight: 'bold' }}>Coins Earned</Text>
        </View>
      </View>

      <Text style={{ marginLeft: 24, marginBottom: 8, fontWeight: 'bold', fontSize: 18, color: primary }}>Settlement History</Text>
      <ScrollView style={{ flex: 1, marginHorizontal: 16 }}>
        {settlementHistory.length === 0 ? (
          <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>No settlements yet.</Text>
        ) : (
          settlementHistory.map(item => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <MaterialIcons
                name={item.isActive ? "check-circle" : "history"}
                size={32}
                color={item.isActive ? primary : "#bbb"}
                style={{ marginRight: 16 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: primary }}>
                  ₹{item.amount} / {item.coinAmount} coins
                </Text>
                <Text style={{ color: '#666', fontSize: 13 }}>
                  {new Date(item.date).toLocaleDateString()} {item.isActive ? "(Active)" : "(Settled)"}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}