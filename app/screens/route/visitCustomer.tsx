import { API_ROUTES } from "@/constants/ApiRoutes";
import { Theme } from "@/constants/Theme";
import { api } from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Dimensions, SafeAreaView, StatusBar } from "react-native";
import React, { useState } from "react";
import CustomerImages from "@/components/ui/customer/CustomerImages";
import CustomerCheckinButton from "@/components/ui/customer/CustomerCheckinButton";
import CustomerDetailsCard from "@/components/ui/customer/CustomerDetailsCard";
import CustomerOrdersSection from "@/components/ui/customer/CustomerOrdersSection";
import CustomerCollectionsSection from "@/components/ui/customer/CustomerCollectionsSection";
import { ArrowLeft, ShoppingCart, CurrencyNgnIcon } from "phosphor-react-native";

interface Customer {
  id: string;
  approved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  tenantId: string;
  name: string;
  phone: string;
  innerImageUrl: string;
  outerImageUrl: string;
  latitude: number;
  longitude: number;
}

interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

type TabType = 'orders' | 'collections';

export default function VisitCustomer() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  const customerQuery = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await api.get<CustomerResponse>(API_ROUTES.CUSTOMER.GET_CUSTOMER(id as string))
      return res.data;
    }
  });

  const customer = customerQuery.data?.data;

  const refetchCustomer = () => {
    customerQuery.refetch();
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Image Section */}
        <View style={styles.headerWrapper}>
          <CustomerImages
            customerId={id as string}
            innerImageUrl={customer?.innerImageUrl}
            outerImageUrl={customer?.outerImageUrl}
            refetchCustomer={refetchCustomer}
            name={customer?.name}
            createdAt={customer?.createdAt}
          />
          {/* Back Button Overlay */}
          <SafeAreaView style={styles.safeAreaOverlay}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)");
                }
              }}
            >
              <ArrowLeft size={24} color="white" weight="bold" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Floating Details Card */}
        {customer && (
          <CustomerDetailsCard
            name={customer.name}
            phone={customer.phone}
            createdAt={customer.createdAt}
            latitude={customer.latitude}
            longitude={customer.longitude}
          />
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'orders' && styles.activeTabItem]}
            onPress={() => setActiveTab('orders')}
          >
            <ShoppingCart size={20} color={activeTab === 'orders' ? Theme.colors.primary : '#6B7280'} weight={activeTab === 'orders' ? 'fill' : 'regular'} />
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'collections' && styles.activeTabItem]}
            onPress={() => setActiveTab('collections')}
          >
            <CurrencyNgnIcon size={20} color={activeTab === 'collections' ? Theme.colors.primary : '#6B7280'} weight={activeTab === 'collections' ? 'bold' : 'regular'} />
            <Text style={[styles.tabText, activeTab === 'collections' && styles.activeTabText]}>Collections</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {customer && activeTab === 'orders' && (
            <CustomerOrdersSection customerId={customer.id} />
          )}

          {customer && activeTab === 'collections' && (
            <CustomerCollectionsSection customerId={customer.id} />
          )}
        </View>

        {/* Bottom Padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button for Check-in */}
      {customer && (
        <LinearGradient
          colors={['transparent', '#F9FAFB']}
          style={styles.fabContainer}
          pointerEvents="box-none"
        >
          <CustomerCheckinButton customerId={customer.id} />
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  safeAreaOverlay: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    marginLeft: 20,
    marginTop: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 12,
  },
  activeTabItem: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 70,
  },
});