import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { Response } from "@/lib/types/types";
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, useAppTheme } from "@/constants/Theme";

interface LedgerBalanceQueryReponse extends Response {
  data: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    distributorId: string;
    balance: number;
    distributor: {
      id: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
      name: string;
      tenantId: string;
      email: string | null;
      phone: string;
      virtualAccountNumber: string | null;
      fcmbVirtualAccountNumber: string | null;
      globusVirtualAccountNumber: string | null;
      password: string;
      virified: boolean;
      avatar: string | null;
      marketName: string;
      address: string;
      latitude: number;
      longitude: number;
      hierarchyItemId: string;
      bankAccountNumber: string;
      bankHolderName: string;
      currentAccountNumber: string;
      coi: string | null;
    };
  }[]
}

export default function DistributorActions() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const ledgerBalanceQuery = useQuery({
    queryKey: ['distributorLedger', id],
    queryFn: async () => {
      const res = await api.get<LedgerBalanceQueryReponse>(API_ROUTES.CITY_HEAD.GET_DISTRIBUTOR_LEDGER(id as string));
      console.log("Ledger Balance Response:", res.data);
      return res.data;
    }
  })

  const distributorInfo = ledgerBalanceQuery.data?.data?.[0]?.distributor;
  const ledgerBalance = ledgerBalanceQuery.data?.data?.[0]?.balance;

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined || balance === null) return "0.00";
    return balance.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const actions = [
    {
      id: 'order',
      title: 'Create Order',
      icon: <MaterialIcons name="add-shopping-cart" size={22} color="#fff" />,
      description: 'Place a new order',
      color: '#0B72FF',
      gradient: ['#0B72FF', '#3D93FF'] as [string, string],
      action: () => router.push(`/screens/distributor/CreateOrder?distributorId=${encodeURIComponent(id as string)}`)
    },
    {
      id: 'invoice',
      title: 'Invoices',
      icon: <FontAwesome5 name="file-invoice-dollar" size={20} color="#fff" />,
      description: 'View invoices',
      color: '#7C3AED',
      gradient: ['#7C3AED', '#9F67FF'] as [string, string],
      action: () => router.push(`/screens/distributor/Invoice?distributorId=${encodeURIComponent(id as string)}`)
    },
    {
      id: 'stock-take',
      title: 'Stock Take',
      icon: <Ionicons name="clipboard-outline" size={22} color="#fff" />,
      description: 'Inventory count',
      color: '#059669',
      gradient: ['#059669', '#34D399'] as [string, string],
      action: () => router.push(`/screens/distributor/Stt?distributorId=${encodeURIComponent(id as string)}`)
    },
    {
      id: 'order-history',
      title: 'Order History',
      icon: <MaterialIcons name="history" size={22} color="#fff" />,
      description: 'Past orders',
      color: '#EA580C',
      gradient: ['#EA580C', '#FB923C'] as [string, string],
      action: () => router.push(`/screens/distributor/OrderHistory?distributorId=${encodeURIComponent(id as string)}`)
    },
    // {
    //   id: 'reports',
    //   title: 'Reports',
    //   icon: <MaterialIcons name="bar-chart" size={22} color="#fff" />,
    //   description: 'View analytics',
    //   color: '#0891B2',
    //   gradient: ['#0891B2', '#22D3EE'] as [string, string],
    //   action: () => {}
    // },
    // {
    //   id: 'messages',
    //   title: 'Messages',
    //   icon: <MaterialIcons name="chat-bubble-outline" size={22} color="#fff" />,
    //   description: 'Send messages',
    //   color: '#DC2626',
    //   gradient: ['#DC2626', '#F87171'] as [string, string],
    //   action: () => {}
    // },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TabBar title="ACTIONS" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Full-width Ledger Balance Hero ── */}
        <LinearGradient
          colors={['#005effff', '#0B72FF', '#3D93FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceHero}
        >
          <View style={styles.balanceHeroInner}>
            <Text style={styles.balanceHeroLabel}>Ledger Balance</Text>
            {ledgerBalanceQuery.isLoading ? (
              <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 8 }} />
            ) : (
              <Text style={styles.balanceHeroAmount} numberOfLines={1} adjustsFontSizeToFit>
                ₦{formatBalance(ledgerBalance)}
              </Text>
            )}
            <View style={styles.balanceCurrencyBadge}>
              <Text style={styles.balanceCurrencyText}>NGN</Text>
            </View>
          </View>
          {/* Decorative circles */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
        </LinearGradient>

        {/* ── Distributor Info Strip ── */}
        <TouchableOpacity
          style={[styles.infoStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => {
            router.push(`/screens/distributor/distributorDetails?distId=${encodeURIComponent(id as string)}`);
          }}
        >
          <View style={[styles.infoAvatar, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(11, 114, 255, 0.1)' }]}>
            <Text style={[styles.infoAvatarText, { color: colors.primary }]}>
              {distributorInfo?.name?.charAt(0)?.toUpperCase() || "D"}
            </Text>
          </View>
          <View style={styles.infoDetails}>
            <Text style={[styles.infoName, { color: colors.text.primary }]} numberOfLines={1}>
              {distributorInfo?.name || "—"}
            </Text>
            <View style={styles.infoMeta}>
              <Ionicons name="location-outline" size={13} color={colors.text.secondary} />
              <Text style={[styles.infoMetaText, { color: colors.text.secondary }]} numberOfLines={1}>
                {distributorInfo?.marketName || "—"}
              </Text>
              <View style={[styles.infoDot, { backgroundColor: colors.text.secondary }]} />
              <Ionicons name="call-outline" size={13} color={colors.text.secondary} />
              <Text style={[styles.infoMetaText, { color: colors.text.secondary }]} numberOfLines={1}>
                {distributorInfo?.phone || "—"}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.text.secondary} />
        </TouchableOpacity>

        {/* ── Actions Grid ── */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Actions</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.75}
              onPress={action.action}
            >
              <LinearGradient
                colors={action.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconCircle}
              >
                {action.icon}
              </LinearGradient>
              <Text style={[styles.actionTileTitle, { color: colors.text.primary }]}>{action.title}</Text>
              <Text style={[styles.actionTileDesc, { color: colors.text.secondary }]}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    paddingBottom: 32,
  },

  /* ── Balance Hero ── */
  balanceHero: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceHeroInner: {
    alignItems: 'center',
    zIndex: 2,
  },
  balanceHeroLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  balanceHeroAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
    width: '100%',
  },
  balanceCurrencyBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  balanceCurrencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
  },
  decoCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -30,
    right: -30,
  },
  decoCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: -20,
  },

  /* ── Info Strip ── */
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(29, 78, 216, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: "#1d4ed8",
  },
  infoDetails: {
    flex: 1,
  },
  infoName: {
    fontSize: 16,
    fontWeight: '600',
    color: "#111827",
    marginBottom: 3,
  },
  infoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoMetaText: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 3,
    marginRight: 2,
  },
  infoDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#9ca3af",
    marginHorizontal: 6,
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: "#111827",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  /* ── Actions Grid ── */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  actionTile: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F0F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    flexGrow: 1,
  },
  actionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionTileTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: "#111827",
    marginBottom: 4,
  },
  actionTileDesc: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },

  /* ── Details CTA ── */
  detailsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(29, 78, 216, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(29, 78, 216, 0.12)',
  },
  detailsCtaText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: "#1d4ed8",
  },
});