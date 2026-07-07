import DistributorEditModal from "@/components/ui/distributor/distributorEditModal";
import TabBar from "@/components/ui/layout/TabBar";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { background, border } from "@/constants/Colors";
import { api } from "@/lib/axios/axios";
import { errorHandler } from "@/lib/axios/errorHandler";
import { ErrorResponse, Response } from "@/lib/types/types";
import { UpdateDistirbutorDetailsParams } from "@/shared/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Image, Modal, TextInput, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export interface DistributorDetailsResponse extends Response {
  data: {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    name: string;
    tenantId: string;
    password: string;
    phone: string;
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
    cseName: string;
    distributorCode: string;
    anniversaryDate: Date | null;
    dateOfBirth: Date | null;
    coi: string | null;
    virtualAccountNumber: string | null;
    fcmbVirtualAccountNumber: string | null;
    globusVirtualAccountNumber: string | null;
    Godown: {
      id: string;
      distributorId: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      name: string | null;
      address: string;
      city: string | null;
      state: string | null;
      pinCode: string | null;
    }[];
    OwnShop: {
      id: string;
      distributorId: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      name: string;
      phone: string;
      address: string;
      contactPerson: string;
    }[];
    CompanyDelt: {
      id: string;
      distributorId: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
      name: string;
      dealingType: string;
      productCategory: string | null;
    }[];
  } | null
}

export default function DistributorDetails() {
  const { distId } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);

  const distributorDetailsQuery = useQuery({
    queryKey: ["distributorDetails", distId],
    queryFn: async () => {
      const res = await api.get<DistributorDetailsResponse>(API_ROUTES.CITY_HEAD.GET_DISTRIBUTOR_DETAILS(distId as string));
      return res.data;
    }
  })

  useEffect(() => {
    if (distributorDetailsQuery.isError) {
      errorHandler(distributorDetailsQuery.error);
    }
  }, [distributorDetailsQuery.isError])

  const distributor = distributorDetailsQuery.data?.data;

  return (
    <SafeAreaView style={styles.container}>
      <TabBar title="DISTRIBUTOR" />

      {distributorDetailsQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : distributorDetailsQuery.isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={32} color="#d32f2f" />
          <Text style={styles.errorText}>Failed to load distributor details</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => distributorDetailsQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : distributor ? (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {distributor.avatar ? (
                <Image source={{ uri: distributor.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {distributor.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{distributor.name}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="create-outline" size={20} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <Text style={styles.code}>{distributor.distributorCode}</Text>
            </View>
            {/* <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                distributor.isActive ? styles.activeIndicator : styles.inactiveIndicator
              ]} />
              <Text style={styles.statusText}>
                {distributor.isActive ? "Active" : "Inactive"}
              </Text>
            </View> */}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="phone-portrait-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{distributor.phone}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Market:</Text>
              <Text style={styles.infoValue}>{distributor.marketName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{distributor.address}</Text>
            </View>
          </View>

          {/* Personal Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-circle-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>CSE Name:</Text>
              <Text style={styles.infoValue}>{distributor.cseName || "-"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Anniversary:</Text>
              <Text style={styles.infoValue}>
                {distributor.anniversaryDate ? new Date(distributor.anniversaryDate).toLocaleDateString() : "-"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="boat-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>
                {distributor.dateOfBirth ? new Date(distributor.dateOfBirth).toLocaleDateString() : "-"}
              </Text>
            </View>
          </View>

          {/* Bank Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Bank Details</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="wallet-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Account No:</Text>
              <Text style={styles.infoValue}>{distributor.bankAccountNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Holder Name:</Text>
              <Text style={styles.infoValue}>{distributor.bankHolderName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Current Account:</Text>
              <Text style={styles.infoValue}>{distributor.currentAccountNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Stanbic VA:</Text>
              <Text style={styles.infoValue}>{distributor.virtualAccountNumber || "NA"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>FCMB VA:</Text>
              <Text style={styles.infoValue}>{distributor.fcmbVirtualAccountNumber || "NA"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Globus VA:</Text>
              <Text style={styles.infoValue}>{distributor.globusVirtualAccountNumber || "NA"}</Text>
            </View>
          </View>

          {/* Godowns Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="home-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Godowns ({distributor.Godown.length})</Text>
            </View>

            {distributor.Godown.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={24} color="#999" />
                <Text style={styles.emptyStateText}>No godowns registered</Text>
              </View>
            ) : (
              distributor.Godown.map(g => (
                <View key={g.id} style={styles.itemContainer}>
                  <Text style={styles.itemTitle}>{g.name || "Unnamed Godown"}</Text>
                  <View style={styles.itemInfoRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.itemInfoText}>{g.address}</Text>
                  </View>
                  <View style={styles.itemInfoRow}>
                    <Ionicons name="map-outline" size={16} color="#666" />
                    <Text style={styles.itemInfoText}>
                      {[g.city, g.state, g.pinCode].filter(Boolean).join(", ")}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Own Shops Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="storefront-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Own Shops ({distributor.OwnShop.length})</Text>
            </View>

            {distributor.OwnShop.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={24} color="#999" />
                <Text style={styles.emptyStateText}>No shops registered</Text>
              </View>
            ) : (
              distributor.OwnShop.map(s => (
                <View key={s.id} style={styles.itemContainer}>
                  <Text style={styles.itemTitle}>{s.name}</Text>
                  <View style={styles.itemInfoRow}>
                    <Ionicons name="call-outline" size={16} color="#666" />
                    <Text style={styles.itemInfoText}>{s.phone}</Text>
                  </View>
                  <View style={styles.itemInfoRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.itemInfoText}>Contact: {s.contactPerson}</Text>
                  </View>
                  <View style={styles.itemInfoRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.itemInfoText}>{s.address}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Company Dealt Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Company Dealt ({distributor.CompanyDelt.length})</Text>
            </View>

            {distributor.CompanyDelt.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={24} color="#999" />
                <Text style={styles.emptyStateText}>No companies registered</Text>
              </View>
            ) : (
              distributor.CompanyDelt.map(c => (
                <View key={c.id} style={styles.itemContainer}>
                  <Text style={styles.itemTitle}>{c.name}</Text>
                  <View style={styles.itemInfoRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#666" />
                    <Text style={styles.itemInfoText}>Type: {c.dealingType}</Text>
                  </View>
                  <View style={styles.itemInfoRow}>
                    <Ionicons name="list-outline" size={16} color="#666" />
                    <Text style={styles.itemInfoText}>Category: {c.productCategory || "-"}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      ) : null}

      <DistributorEditModal
        distributor={distributor}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        refetch={distributorDetailsQuery.refetch}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#888",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  code: {
    fontSize: 15,
    color: "#666",
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  activeIndicator: {
    backgroundColor: "#4CAF50",
  },
  inactiveIndicator: {
    backgroundColor: "#F44336",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
    marginLeft: 8,
    marginRight: 4,
    width: 100,
  },
  infoValue: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    flex: 1,
  },
  itemContainer: {
    backgroundColor: "#f7f8fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  itemInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemInfoText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 8,
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#999",
    marginLeft: 8,
  },
});