import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Pressable, TouchableOpacity, Animated, Easing, Modal } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { primary } from "@/constants/Colors";
import { salesmanType } from "@/shared/zod";
import Avatar from "@/components/lazy/Avatar";
import { User } from "@/lib/user/util";
import { useUserStore, useThemeStore } from "@/store";
import { Theme, useAppTheme } from "@/constants/Theme";
import TabBar from "@/components/ui/layout/TabBar";
import { LinearGradient } from 'expo-linear-gradient';
import SalesmanEditModal from "@/components/ui/salesman/salesmanEditModal";
import { SafeAreaView } from "react-native-safe-area-context";

export interface myDataQuery {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  bank: string;
  address: string;
  addressProof: string;
  avatar: string | null;
  hierarchyItemId: string;
  salesmanType: salesmanType;
}

const SalesmanTypeBadge = ({ type }: { type: myDataQuery['salesmanType'] }) => {
  const typeColors : Record<salesmanType, { bg: string, text: string }> = {
    FIELDEXECUTIVE: { bg: '#E1F5FE', text: '#0288D1' },
    VANSALES: { bg: '#E8F5E9', text: '#388E3C' },
    SUPERVISOR: { bg: '#F3E5F5', text: '#8E24AA' },
    CITYHEAD: { bg: '#FFF8E1', text: '#FFA000' },
    MERCHANDISER: { bg: '#E0F7FA', text: '#00ACC1' },
    ASM: { bg: '#FCE4EC', text: '#D81B60' },
    OFFICE: { bg: '#EDE7F6', text: '#5C6BC0' },
    TERRITORY_SALES_MANAGER: { bg: '#FFF3E0', text: '#FB8C00' },
    DRIVER: { bg: '#E0F2F1', text: '#00796B' },
    FACTORY: { bg: '#F9FBE7', text: '#AFB42B' },
  };

  const typeText: Record<salesmanType, string> = {
    FIELDEXECUTIVE: 'Field Executive',
    VANSALES: 'Van Sales',
    SUPERVISOR: 'Supervisor',
    CITYHEAD: 'City Head',
    MERCHANDISER: 'Merchandiser',
    ASM: 'Area Sales Manager',
    OFFICE: 'Office Staff',
    TERRITORY_SALES_MANAGER: 'Territory Sales Manager',
    DRIVER: 'Driver',
    FACTORY: 'Factory Staff',
  };

  return (
    <Animated.View style={[styles.badge, { backgroundColor: typeColors[type].bg }]}>
      <Text style={[styles.badgeText, { color: typeColors[type].text }]}>
        {typeText[type]}
      </Text>
    </Animated.View>
  );
};

export default function SalesmanProfile() {
  const setUser = useUserStore((state) => state.setUser);
  const themeMode = useThemeStore((state) => state.themeMode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { colors } = useAppTheme();
  const isDark = themeMode === 'dark';
  const { data, isLoading, error, refetch, isSuccess } = useQuery<{ success: boolean, message: string, data: myDataQuery }>({
    queryKey: ["myDetails"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.AUTH.ME);
      return res.data;
    }
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (isSuccess) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSuccess]);

  useEffect(() => {
    async function updateUser(userData: myDataQuery) {
      await User.setUserDetails({ ...userData, password: "fuckyouhacker" });
      setUser(userData);
    }

    isSuccess && data && updateUser(data.data);
  }, [data]);

  // Modal and form state
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [form, setForm] = useState<Partial<myDataQuery>>({});
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [addressProofUri, setAddressProofUri] = useState<string | null>(null);

  const openEditModal = () => {
    setForm({
      name: salesman?.name,
      phone: salesman?.phone,
      bank: salesman?.bank,
      address: salesman?.address,
      addressProof: salesman?.addressProof,
      avatar: salesman?.avatar,
    });
    setAvatarUri(null);
    setAddressProofUri(null);
    setModalVisible(true);
  };


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={32} color="#FF6B6B" />
        <Text style={styles.errorText}>Failed to load profile data</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const salesman = data?.data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabBar title="Profile" showHomeButton={true} />
      <LinearGradient
        colors={isDark ? ['#1E293B', '#0F172A'] : ['#F8F9FF', '#EFF1FF']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Animated.View
            style={[
              styles.profileCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
                backgroundColor: colors.surface,
              }
            ]}
          >
            {/* Profile Header */}
            <LinearGradient
              colors={isDark ? ['#334155', '#1E293B'] : [primary, '#2563EB']}
              style={styles.profileHeader}
            >
              {/* Theme toggle icon button on the top right */}
              <TouchableOpacity
                onPress={() => setTheme(isDark ? 'light' : 'dark')}
                style={styles.themeToggleIconButton}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={isDark ? "light-mode" : "dark-mode"}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <View style={styles.avatarContainer}>
                <Pressable onPress={() => setPreviewVisible(true)}>
                  <Avatar
                    src={salesman?.avatar}
                    alt={salesman?.name}
                    size={120}
                    textStyle={{ fontSize: 48 }}
                  />
                </Pressable>
                <Pressable
                  onPress={openEditModal}
                  style={[styles.editButton, { backgroundColor: colors.surface }]}
                >
                  <MaterialIcons name="edit" size={18} color={colors.primary} />
                </Pressable>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.name}>{salesman?.name}</Text>
                <View style={styles.phoneContainer}>
                  <MaterialIcons name="phone" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.phone}>{salesman?.phone}</Text>
                </View>
                {salesman && <SalesmanTypeBadge type={salesman.salesmanType} />}
              </View>
            </LinearGradient>

            {/* Details Section */}
            <View style={[styles.detailsContainer, { backgroundColor: colors.surface }]}>
              {/* Personal Info Card */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>Personal Information</Text>

                <View style={[styles.detailCard, { backgroundColor: isDark ? colors.background : '#FAFAFF' }]}>
                  <View style={styles.detailRow}>
                    <View style={[styles.iconContainer, { backgroundColor: isDark ? '#6C63FF30' : 'rgba(108, 99, 255, 0.1)' }]}>
                      <MaterialIcons name="account-balance" size={20} color="#6C63FF" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, { color: colors.text.muted }]}>Bank Account</Text>
                      <Text style={[styles.detailValue, { color: colors.text.primary }]}>{salesman?.bank || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: isDark ? colors.border : 'rgba(108, 99, 255, 0.1)' }]} />

                  <View style={styles.detailRow}>
                    <View style={[styles.iconContainer, { backgroundColor: isDark ? '#FF658430' : 'rgba(255, 101, 132, 0.1)' }]}>
                      <MaterialIcons name="location-on" size={20} color="#FF6584" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, { color: colors.text.muted }]}>Address</Text>
                      <Text style={[styles.detailValue, { color: colors.text.primary }]}>{salesman?.address || 'No address provided'}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: isDark ? colors.border : 'rgba(108, 99, 255, 0.1)' }]} />

                  <View style={styles.detailRow}>
                    <View style={[styles.iconContainer, { backgroundColor: isDark ? '#6C63FF30' : 'rgba(108, 99, 255, 0.1)' }]}>
                      <MaterialIcons name="assignment" size={20} color="#6C63FF" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, { color: colors.text.muted }]}>Address Proof</Text>
                      <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                        {salesman?.addressProof ? 'Uploaded ✓' : 'Not provided'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ID Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>Identification</Text>

                <View style={[styles.detailCard, { backgroundColor: isDark ? colors.background : '#FAFAFF' }]}>
                  <View style={styles.idRow}>
                    <Text style={[styles.idLabel, { color: colors.text.muted }]}>Salesman ID</Text>
                    <Text style={[styles.idValue, { color: colors.primary }]}>{salesman?.id}</Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: isDark ? colors.border : 'rgba(108, 99, 255, 0.1)' }]} />

                  <View style={styles.idRow}>
                    <Text style={[styles.idLabel, { color: colors.text.muted }]}>Hierarchy ID</Text>
                    <Text style={[styles.idValue, { color: colors.primary }]}>{salesman?.hierarchyItemId}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Profile Photo Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewVisible(false)}>
          <View style={styles.previewContent}>
            <TouchableOpacity style={styles.previewCloseButton} onPress={() => setPreviewVisible(false)}>
              <MaterialIcons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Avatar
              src={salesman?.avatar}
              alt={salesman?.name}
              size={280}
              textStyle={{ fontSize: 80 }}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Edit Profile Modal */}
      <SalesmanEditModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        form={form}
        setForm={setForm}
        avatarUri={avatarUri}
        setAvatarUri={setAvatarUri}
        addressProofUri={addressProofUri}
        setAddressProofUri={setAddressProofUri}
        refetch={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#3A3A3A',
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileHeader: {
    padding: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoSection: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phone: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 6,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 24,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  detailCard: {
    backgroundColor: '#FAFAFF',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#A0A4B8',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#3A3A3A',
    fontWeight: '500',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    marginVertical: 12,
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  idLabel: {
    fontSize: 14,
    color: '#A0A4B8',
    fontWeight: '500',
  },
  idValue: {
    fontSize: 14,
    color: primary,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3A3A3A',
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarEditContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    alignItems: 'center',
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 16,
  },
  changeAvatarText: {
    color: primary,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#3A3A3A',
    paddingVertical: 0,
  },
  addressProofContainer: {
    marginTop: 8,
  },
  addressProofLabel: {
    fontSize: 14,
    color: '#A0A4B8',
    marginBottom: 8,
  },
  addressProofImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  addressProofPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
  },
  addressProofPlaceholderText: {
    marginTop: 8,
    color: primary,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    marginRight: 8,
  },
  cancelButtonText: {
    color: primary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: primary,
    marginLeft: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  themeToggleIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  appearanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  appearanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  appearanceTextContainer: {
    justifyContent: 'center',
  },
  appearanceLabel: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.body,
  },
  appearanceSublabel: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.caption,
    marginTop: 2,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    borderRadius: Theme.radius.md,
    padding: 3,
    gap: 2,
  },
  themeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.sm,
  },
  themeTabActive: {
    backgroundColor: '#FFFFFF',
    ...Theme.shadows.sm,
  },
  themeTabActiveDark: {
    backgroundColor: '#1E293B',
    ...Theme.shadows.sm,
  },
  themeTabText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm,
  },
});