import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { primary, secondary, text, background, border, primaryLight } from "@/constants/Colors";
import { api } from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { router } from "expo-router";
import Avatar from "@/components/lazy/Avatar";
import { SafeAreaView } from "react-native-safe-area-context";

export interface DistributorSalesman {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  tenantId: string;
  distributorId: string;
  salesmanId: string;
  distributor: {
    id: string;
    name: string;
    phone: string;
    avatar: string | null;
    marketName: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface MyDistributorResponse {
  success: boolean;
  message: string;
  data: DistributorSalesman[];
}

export default function MyDistributors() {
  const [search, setSearch] = useState("");
  const myDistributorQuery = useQuery({
    queryKey: ["myDistributors"],
    queryFn: async () => {
      const res = await api.get<MyDistributorResponse>(API_ROUTES.CITY_HEAD.MY_DISTRIBUTORS);
      return res.data;
    }
  })

  // Memoize filtered data for performance
  const filteredDistributors = useMemo(() => {
    if (!myDistributorQuery.data?.data) return [];
    if (!search.trim()) return myDistributorQuery.data.data;
    const q = search.trim().toLowerCase();
    return myDistributorQuery.data.data.filter(d =>
      d.distributor.name.toLowerCase().includes(q) ||
      d.distributor.phone.toLowerCase().includes(q)
    );
  }, [myDistributorQuery.data?.data, search]);

  return (
    <SafeAreaView style={styles.container}>
      <TabBar title="DISTRIBUTORS">
        {/* Search bar */}
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
            refreshing={myDistributorQuery.isRefetching}
            onRefresh={() => myDistributorQuery.refetch()}
            tintColor={primary}
          />
        }>
        {myDistributorQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : myDistributorQuery.isError ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={24} color="#dc2626" />
            <Text style={styles.errorText}>Failed to load distributors</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => myDistributorQuery.refetch()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : myDistributorQuery.data?.success && filteredDistributors.length > 0 ? (
          filteredDistributors.map((distributor) => (
            <Pressable
              style={({ pressed }) => [
                styles.distributorCard,
                { opacity: pressed ? 0.85 : 1 }, // snappy feedback
              ]}
              key={distributor.id}
              onPress={() => { router.push(`/screens/distributor/distributorActions?id=${encodeURIComponent(distributor.distributor.id)}`) }}
            >
              <View style={styles.avatarPlaceholder}>
                <Avatar
                  src={distributor.distributor.avatar}
                  alt={distributor.distributor.name}
                  size={48}
                />
              </View>
              <View style={styles.distributorInfo}>
                <Text style={styles.distributorName}>{distributor.distributor.name}</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={16} color={primary} />
                  <Text style={styles.distributorPhone}>{distributor.distributor.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={16} color={"hotpink"} />
                  <Text style={styles.distributorAddress} numberOfLines={1}>
                    {distributor.distributor.marketName}, {distributor.distributor.address}
                  </Text>
                </View>
              </View>
              {/* <MaterialIcons name="chevron-right" size={24} color={border} /> */}
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="store-mall-directory" size={48} color={border} />
            <Text style={styles.emptyText}>No distributors found</Text>
            <Text style={styles.emptySubtext}>Add new distributors to get started</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: border,
  },
  refreshButton: {
    padding: 8,
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
  distributorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#aaa',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  distributorInfo: {
    flex: 1,
  },
  distributorName: {
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
  distributorPhone: {
    fontSize: 12,
    color: text.secondary,
    marginLeft: 6,
  },
  distributorAddress: {
    fontSize: 12,
    color: text.secondary,
    marginLeft: 6,
    flex: 1,
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
});