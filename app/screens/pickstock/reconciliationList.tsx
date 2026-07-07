import { API_ROUTES } from "@/constants/ApiRoutes"
import { background, border, primary, secondary, text } from "@/constants/Colors"
import { api } from "@/lib/axios/axios"
import { Response } from "@/lib/types/types";
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import TabBar from "@/components/ui/layout/TabBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import Avatar from "@/components/lazy/Avatar";
import { router } from "expo-router";

interface PickStockResponse extends Response {
  data: {
    id: string;
    createdAt: string;
    distributor: {
      id: string;
      cseName: string;
      avatar: string | null;
    };
    pickStockItems: {
      id: string;
      productId: string;
      quantity: number;
      createdAt: Date | string;
      updatedAt: Date | string;
      isActive: boolean;
      pickStockId: string;
    }[];
  }[]
}

export default function reconciliationList() {
  const [search, setSearch] = useState("");

  const getPickStocksQuery = useQuery({
    queryKey: ["myPickStocks"],
    queryFn: async () => {
      const res = await api.get<PickStockResponse>(API_ROUTES.DISTRIBUTOR.GET_MY_PICK_STOCKS);
      return res.data;
    }
  })

  const filteredPickStocks = useMemo(() => {
    if (!getPickStocksQuery.data?.data) return [];

    const q = search.trim().toLowerCase();
    const baseData = q
      ? getPickStocksQuery.data.data.filter((pickStock) =>
        pickStock.distributor.cseName.toLowerCase().includes(q)
      )
      : getPickStocksQuery.data.data;

    return baseData.map((pickStock) => {
      const totalQuantity = pickStock.pickStockItems.reduce((sum, item) => sum + item.quantity, 0);
      const latestItemTimeMs = pickStock.pickStockItems.reduce((latest, item) => {
        const time = new Date(item.createdAt).getTime();
        if (Number.isNaN(time)) return latest;
        return Math.max(latest, time);
      }, 0);

      // data and time
      const pickStockTime = new Date(pickStock.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        ...pickStock,
        totalQuantity,
        pickStockTime,
      };
    });
  }, [getPickStocksQuery.data?.data, search]);

  return (
    <SafeAreaView style={styles.container}>
      <TabBar title="RECONCILIATION">
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={18} color={text.secondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by distributor name"
            placeholderTextColor={text.secondary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </TabBar>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={getPickStocksQuery.isRefetching}
            onRefresh={() => getPickStocksQuery.refetch()}
            tintColor={primary}
          />
        }
      >
        {getPickStocksQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : getPickStocksQuery.isError ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={24} color="#dc2626" />
            <Text style={styles.errorText}>Failed to load pick stocks</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => getPickStocksQuery.refetch()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : getPickStocksQuery.data?.success && filteredPickStocks.length > 0 ? (
          filteredPickStocks.map((pickStock) => (
            <Pressable
              style={({ pressed }) => [styles.pickStockCard, { opacity: pressed ? 0.85 : 1 }]}
              key={pickStock.id}
              onPress={() => { router.push(`/screens/pickstock/createReconcillation?pickstockId=${encodeURIComponent(pickStock.id)}`) }}
            >
              <View style={styles.avatarPlaceholder}>
                <Avatar
                  src={pickStock.distributor.avatar}
                  alt={pickStock.distributor.cseName}
                  size={48}
                />
              </View>

              <View style={styles.pickStockInfo}>
                <Text style={styles.distributorName}>{pickStock.distributor.cseName}</Text>

                <View style={styles.infoRow}>
                  <MaterialIcons name="inventory-2" size={16} color={primary} />
                  <Text style={styles.infoText}>Items Taken: {pickStock.totalQuantity}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="access-time" size={16} color="hotpink" />
                  <Text style={styles.infoText}>Pick Stock Time: {pickStock.pickStockTime}</Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={48} color={border} />
            <Text style={styles.emptyText}>No pick stock entries found</Text>
            <Text style={styles.emptySubtext}>Create a pick stock entry to get started</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    color: text.primary,
    fontSize: 13,
  },
  retryButton: {
    backgroundColor: primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  pickStockCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#aaa",
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  pickStockInfo: {
    flex: 1,
  },
  distributorName: {
    fontSize: 14,
    fontWeight: "600",
    color: text.primary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: text.secondary,
    marginLeft: 6,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: text.primary,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: text.primary,
    paddingVertical: 16,
  },
});