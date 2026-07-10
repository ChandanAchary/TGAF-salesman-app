import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { Response } from "@/lib/types/types";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import Avatar from "@/components/lazy/Avatar";
import TabBar from "@/components/ui/layout/TabBar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, useAppTheme } from "@/constants/Theme";

interface ForSettelmentResponse extends Response {
  data: {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    salesmanId: string;
    totaldebt: number;
    totalpaid: number;
    salesman: {
      id: string;
      tenantId: string;
      password: string;
      name: string;
      phone: string;
      virified: boolean;
      avatar: string | null;
      address: string;
      hierarchyItemId: string;
      isActive: boolean;
    }
  }[]
}

export default function ListSettelment() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const [search, setSearch] = useState("");
  const forSattelmentQuery = useQuery({
    queryKey: ["forSettlement"],
    queryFn: async () => {
      const res = await api.get<ForSettelmentResponse>(API_ROUTES.CITY_HEAD.SETTELMENT.GET_FOR_SETTLEMENT);
      return res.data;
    },
  });

  // Memoize filtered salesmen for performance
  const filteredSalesmen = useMemo(() => {
    if (!forSattelmentQuery.data?.data) return [];
    if (!search.trim()) return forSattelmentQuery.data.data;
    const q = search.trim().toLowerCase();
    return forSattelmentQuery.data.data.filter(item =>
      item.salesman.name.toLowerCase().includes(q) ||
      item.salesman.phone.toLowerCase().includes(q)
    );
  }, [forSattelmentQuery.data?.data, search]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabBar title="SETTLEMENTS">
        {/* Search bar */}
        <View style={[styles.searchBarContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Feather name="search" size={18} color={colors.text.secondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Search by name or phone"
            placeholderTextColor={colors.text.secondary}
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
            refreshing={forSattelmentQuery.isRefetching}
            onRefresh={() => forSattelmentQuery.refetch()}
            tintColor={colors.primary}
          />
        }>
        {forSattelmentQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : forSattelmentQuery.isError ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={24} color="#dc2626" />
            <Text style={[styles.errorText, { color: colors.text.secondary }]}>Failed to load salesmen</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => forSattelmentQuery.refetch()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : forSattelmentQuery.data?.success && filteredSalesmen.length > 0 ? (
          filteredSalesmen.map((item) => (
            <Pressable
              style={({ pressed }) => [
                styles.salesmanCard,
                { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 },
                { opacity: pressed ? 0.85 : 1 },
              ]}
              key={item.salesman.id}
              onPress={() => { router.push(`/screens/settelment/Settelment?id=${encodeURIComponent(item.salesman.id)}`) }}
            >
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#1e293b' : colors.primaryLight }]}>
                <Avatar
                  src={item.salesman.avatar}
                  alt={item.salesman.name}
                  size={48}
                />
              </View>
              <View style={styles.salesmanInfo}>
                <Text style={[styles.salesmanName, { color: colors.text.primary }]}>{item.salesman.name}</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={16} color={colors.primary} />
                  <Text style={[styles.salesmanPhone, { color: colors.text.secondary }]}>{item.salesman.phone}</Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="person-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>No salesmen found</Text>
            <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>Add new salesmen to get started</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 13,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  salesmanCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  salesmanInfo: {
    flex: 1,
  },
  salesmanName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  salesmanPhone: {
    fontSize: 12,
    marginLeft: 6,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
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
    paddingVertical: 16,
  },
});