import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes"
import { primary, secondary, text, background, border, primaryLight } from "@/constants/Colors";
import { api } from "@/lib/axios/axios";
import { Response } from "@/lib/types/types";
import { salesmanType } from "@/shared/zod";
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo, useEffect } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import Avatar from "@/components/lazy/Avatar";
import { SafeAreaView } from "react-native-safe-area-context";
import { errorHandler } from "@/lib/axios/errorHandler";
import HapticPress from "@/components/ui/layout/HapticPress";
import { useRouter } from "expo-router";

interface LeaderboardResponse {
  id: string;
  salesmanId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  points: number;
  salesman: {
    id: string;
    name: string;
    phone: string;
    avatar: string | null;
    salesmanType: salesmanType;
  };
}

interface MySalesmanResponse extends Response {
  data: {
    mySalesmans: {
      name: string;
      id: string;
      tenantId: string;
      phone: string;
      virified: boolean;
      password: string;
      bank: string;
      bvnNumber: string;
      address: string;
      addressProof: string;
      avatar: string | null;
      hierarchyItemId: string;
      salesmanType: salesmanType;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
    }[];
    leaderboard: LeaderboardResponse[];
  }
}

export default function MySalesman() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const query = useQuery({
    queryKey: ["mySalesman"],
    queryFn: async () => {
      const res = await api.get<MySalesmanResponse>(API_ROUTES.SUPERVISOR.GET_MY_SALESMAN);
      return res.data;
    }
  })

  useEffect(() => {
    if (query.isError && query.error) {
      errorHandler(query.error);
      console.error("Error fetching my salesmans:", query.error);
    }
  }, [query.isError]);

  const rankedSalesmen = useMemo(() => {
    if (!query.data?.data) return [];
    const { mySalesmans, leaderboard } = query.data.data;

    const leaderboardBySalesman = new Map(
      leaderboard.map((l) => [l.salesmanId, l.points])
    );

    const merged = mySalesmans.map((s) => ({
      ...s,
      points: leaderboardBySalesman.get(s.id) ?? 0,
    }));

    merged.sort((a, b) => b.points - a.points);

    return merged.map((s, i) => ({
      ...s,
      rank: i + 1,
    }));
  }, [query.data?.data]);

  const filteredSalesmen = useMemo(() => {
    if (!search.trim()) return rankedSalesmen;
    const q = search.trim().toLowerCase();
    return rankedSalesmen.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  }, [rankedSalesmen, search]);

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return { backgroundColor: "#FFD700", color: "#fff" };
    if (rank === 2) return { backgroundColor: "#C0C0C0", color: "#fff" };
    if (rank === 3) return { backgroundColor: "#CD7F32", color: "#fff" };
    return { backgroundColor: border, color: text.secondary };
  };

  return (
    <SafeAreaView style={styles.container}>
      <TabBar title="SALESMEN">
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={18} color={text.secondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone"
            placeholderTextColor={text.secondary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </TabBar>

      <ScrollView contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={primary}
          />
        }>
        {query.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : query.isError ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={24} color="#dc2626" />
            <Text style={styles.errorText}>Failed to load salesmen</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => query.refetch()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : query.data?.success && filteredSalesmen.length > 0 ? (
          filteredSalesmen.map((salesman) => {
            const badgeStyle = getRankBadgeStyle(salesman.rank);
            return (
              <HapticPress
                onPress={() => {
                  router.push(`/screens/supervisor/SalesmanStats?salesmanId=${encodeURIComponent(salesman.id)}`);
                }}
                style={styles.card} key={salesman.id}
              >
                <View style={styles.avatarContainer}>
                  <Avatar
                    src={salesman.avatar}
                    alt={salesman.name}
                    size={48}
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{salesman.name}</Text>
                  <View style={styles.infoRow}>
                    <MaterialIcons name="phone" size={16} color={primary} />
                    <Text style={styles.phone}>{salesman.phone}</Text>
                    <MaterialIcons name="person" size={16} color={primary} style={{ marginLeft: 12 }} />
                    <Text style={styles.salesmanType}>{salesman.salesmanType}</Text>
                  </View>
                </View>
                <View style={styles.rankContainer}>
                  <View style={[styles.rankBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
                    <Text style={[styles.rankText, { color: badgeStyle.color }]}>#{salesman.rank}</Text>
                  </View>
                  <Text style={styles.points}>{salesman.points} pts</Text>
                </View>
              </HapticPress>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={48} color={border} />
            <Text style={styles.emptyText}>No salesmen found</Text>
            <Text style={styles.emptySubtext}>Add new salesmen to get started</Text>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
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
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#fff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#aaa',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: text.secondary,
    marginLeft: 6,
  },
  rankContainer: {
    alignItems: 'flex-end',
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  points: {
    fontSize: 12,
    fontWeight: '600',
    color: primary,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: text.secondary,
    marginTop: 4,
  },
  salesmanType: {
    fontSize: 10,
    color: text.primary,
    fontStyle: 'italic',
  },
});
