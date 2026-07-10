import ClickOnce from "@/components/ui/layout/ClickOnceButton";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { Theme, useAppTheme } from "@/constants/Theme";
import { api } from "@/lib/axios/axios";
import { getLocation } from "@/lib/location/location";
import { CreateCustomerParams, GetOtpParams, VerifyOtpParams } from "@/shared/zod";
import { useUserStore } from "@/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { ImageSquare, Storefront } from "phosphor-react-native";
import { errorHandler } from "@/lib/axios/errorHandler";
import { ErrorResponse, Response } from "@/lib/types/types";
import { CameraModal } from "@/components/ui/CameraModel";
import ModalView from "@/components/ui/layout/Modal";
import { OtpInput } from "@/components/ui/layout/OtpInput";
import { User } from "@/lib/user/util";
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface CustomerType {
  id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

interface CustomerTypeQueryData {
  success: boolean;
  data: CustomerType[];
}

export default function Store() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const tenantId = "demo-tenant-id";
  const hierarchyItemId = useUserStore((state) => state.hierarchyItemId);

  // Store data states
  const [name, setName] = useState("");
  const [marketName, setMarketName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bvnNumber, setBvnNumber] = useState("");
  const [customerTypeId, setCustomerTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [innerImageUrl, setInnerImageUrl] = useState<string>("");
  const [outerImageUrl, setOuterImageUrl] = useState<string>("");

  const [innerImageModalOpen, setInnerImageModalOpen] = useState(false);
  const [outerImageModalOpen, setOuterImageModalOpen] = useState(false);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const themeStyles = {
    headerTitle: { color: colors.text.primary },
    headerSubtitle: { color: colors.text.secondary },
    sectionTitle: { color: colors.text.primary },
    label: { color: colors.text.secondary },
    inputWrapper: {
      backgroundColor: isDark ? '#1e293b' : '#F8FAFC',
      borderColor: colors.border,
    },
    input: { color: colors.text.primary },
    pickerContainer: {
      backgroundColor: isDark ? '#1e293b' : '#F8FAFC',
      borderColor: colors.border,
    },
    picker: { color: colors.text.primary },
    imageUploadBox: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
      borderColor: colors.border,
    },
    imageBoxTitle: { color: colors.text.primary },
    uploadIconBackground: {
      backgroundColor: isDark ? '#1e293b' : '#E0F2FE',
    },
  };

  const customerTypeQuery = useQuery({
    queryKey: ['customerType'],
    queryFn: async () => {
      const res = await api.get<CustomerTypeQueryData>(API_ROUTES.CUSTOMER.GET_CUSTOMER_TYPE);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // Keep cached data stale-free for 5 minutes to prevent refetches on mount/focus
  });

  useEffect(() => {
    if (customerTypeQuery.data && customerTypeQuery.data.length > 0 && !customerTypeId) {
      setCustomerTypeId(customerTypeQuery.data[0].id);
    }
    if (customerTypeQuery.error) {
      errorHandler(customerTypeQuery.error);
    }
  }, [customerTypeQuery.data, customerTypeQuery.error, customerTypeId]);

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CreateCustomerParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.CREATE, data);
      return res.data;
    },
    onError: (error: ErrorResponse) => {
      alert(`${error.response.data.message} \n ${error.response.data.log}`);
      setLoading(false);
    }
  });

  const getOtpMutation = useMutation({
    mutationFn: async (data: GetOtpParams) => {
      const res = await api.post<Response>(API_ROUTES.AUTH.GET_OTP, data);
      return res.data;
    },
    onSuccess: (data) => { data.success && setOtpModalOpen(true) },
    onError: (error: ErrorResponse) => {
      alert(error.response.data.message);
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpParams) => {
      const res = await api.post<Response>(API_ROUTES.AUTH.VERIFY_OTP, data);
      return res.data;
    },
    onError: (error: ErrorResponse) => {
      alert(error.response.data.message);
    }
  });

  const createCustomer = async (data: {
    hierarchyItemIdFromStorage: string;
    latitude: number;
    longitude: number;
  }) => {
    if (name !== "" && marketName !== "" && address !== "" && phone !== "" && bvnNumber !== "" && customerTypeId !== "") {
      setLoading(true);
      createCustomerMutation.mutate({
        tenantId,
        hierarchyItemId: data.hierarchyItemIdFromStorage,
        name,
        marketName,
        address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone,
        bvnNumber,
        customerTypeId,
        innerImageUrl,
        outerImageUrl
      }, {
        onSuccess: () => {
          setName("");
          setMarketName("");
          setAddress("");
          setBvnNumber("");
          setLoading(false);
          setInnerImageUrl("");
          setOuterImageUrl("");
          getOtpMutation.mutate({
            phone: phone,
            type: "CUSTOMER",
          });
        }
      });
    } else {
      alert('Please fill all the fields');
      setLoading(false);
    }
  };

  const handleAddStore = async () => {
    setLoading(true);
    const location = await getLocation();

    if (!location) {
      alert("Location not found. Please enable location services and try again.");
      setLoading(false);
      return;
    }

    const { latitude, longitude } = location;
    let hierarchyItemIdFromStorage: string | null;

    if (!hierarchyItemId) {
      User.getUserDetails().then((userDetails) => {
        hierarchyItemIdFromStorage = userDetails?.hierarchyItemId || null;
        if (!hierarchyItemIdFromStorage) {
          alert("Hierarchy Item ID is not set. Close the app and restart again.");
          setLoading(false);
          return;
        }
        createCustomer({ hierarchyItemIdFromStorage, latitude, longitude });
      });
    } else {
      hierarchyItemIdFromStorage = hierarchyItemId;
      createCustomer({ hierarchyItemIdFromStorage, latitude, longitude });
    }
  };

  const verifyOtp = (otp: string | null) => {
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }
    verifyOtpMutation.mutate({
      phone: phone,
      otp,
      type: "CUSTOMER",
    }, {
      onSuccess: () => {
        setOtpModalOpen(false);
        setOtp(null);
        alert("Otp verified successfully");
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <CameraModal
        open={innerImageModalOpen}
        setOpen={setInnerImageModalOpen}
        setImageUrl={setInnerImageUrl}
      />
      <CameraModal
        open={outerImageModalOpen}
        setOpen={setOuterImageModalOpen}
        setImageUrl={setOuterImageUrl}
      />

      <ModalView
        isReceiveModalVisible={otpModalOpen}
        setIsReceiveModalVisible={setOtpModalOpen}
      >
        <View style={styles.otpModalContainer}>
          <Text style={styles.otpModalTitle}>Verify Store Owner</Text>
          <Text style={styles.otpModalSubtitle}>Enter the 4-digit code sent to owner's phone</Text>
          <OtpInput setOtp={setOtp} />
          
          <TouchableOpacity
            style={styles.otpSubmitButton}
            onPress={() => verifyOtp(otp)}
            disabled={verifyOtpMutation.isPending}
            activeOpacity={0.85}
          >
            {verifyOtpMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.otpSubmitButtonText}>Submit Code</Text>
            )}
          </TouchableOpacity>
        </View>
      </ModalView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, themeStyles.headerTitle]}>New Customer</Text>
            <Text style={[styles.headerSubtitle, themeStyles.headerSubtitle]}>Create a new retail outlet in NexForce</Text>
          </View>
          <View style={[styles.headerIconWrapper, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : Theme.colors.primaryLight }]}>
            <Storefront size={32} weight="duotone" color={Theme.colors.primary} />
          </View>
        </View>

        {/* Form Container Card */}
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
          
          {/* SECTION 1: IMAGES */}
          <View style={styles.sectionContainer}>
            <View style={[styles.sectionHeader, { borderLeftColor: colors.primary }]}>
              <Feather name="camera" size={16} color={Theme.colors.primary} />
              <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>Store Visuals</Text>
            </View>
            
            <View style={styles.imageGrid}>
              {/* Inner Image */}
              <TouchableOpacity
                onPress={() => setInnerImageModalOpen(true)}
                style={[
                  styles.imageUploadBox,
                  themeStyles.imageUploadBox,
                  innerImageUrl ? styles.imageUploadBoxActive : null
                ]}
                activeOpacity={0.8}
              >
                {innerImageUrl ? (
                  <>
                    <Image source={{ uri: innerImageUrl }} style={styles.previewImage} />
                    <Text style={styles.imageBoxChangeText}>Change Inner Image</Text>
                  </>
                ) : (
                  <>
                    <View style={[styles.uploadIconBackground, themeStyles.uploadIconBackground]}>
                      <ImageSquare size={24} color={Theme.colors.primary} />
                    </View>
                    <Text style={[styles.imageBoxTitle, themeStyles.imageBoxTitle]}>Inner View</Text>
                    <Text style={styles.imageBoxSub}>Inside the outlet</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Outer Image */}
              <TouchableOpacity
                onPress={() => setOuterImageModalOpen(true)}
                style={[
                  styles.imageUploadBox,
                  themeStyles.imageUploadBox,
                  outerImageUrl ? styles.imageUploadBoxActive : null
                ]}
                activeOpacity={0.8}
              >
                {outerImageUrl ? (
                  <>
                    <Image source={{ uri: outerImageUrl }} style={styles.previewImage} />
                    <Text style={styles.imageBoxChangeText}>Change Outer Image</Text>
                  </>
                ) : (
                  <>
                    <View style={[styles.uploadIconBackground, themeStyles.uploadIconBackground]}>
                      <ImageSquare size={24} color={Theme.colors.primary} />
                    </View>
                    <Text style={[styles.imageBoxTitle, themeStyles.imageBoxTitle]}>Outer View</Text>
                    <Text style={styles.imageBoxSub}>Shopfront / Signage</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION 2: OWNER INFO */}
          <View style={styles.sectionContainer}>
            <View style={[styles.sectionHeader, { borderLeftColor: colors.primary }]}>
              <Feather name="user" size={16} color={Theme.colors.primary} />
              <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>Owner Details</Text>
            </View>

            <View style={styles.inputsGrid}>
              <View>
                <Text style={[styles.label, themeStyles.label]}>Owner Name</Text>
                <View style={[
                  styles.inputWrapper,
                  themeStyles.inputWrapper,
                  focusedField === 'name' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    placeholder="Enter store owner full name"
                    placeholderTextColor={colors.text.muted}
                    value={name}
                    onChangeText={setName}
                    style={[styles.input, themeStyles.input]}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View>
                <Text style={[styles.label, themeStyles.label]}>Phone Number</Text>
                <View style={[
                  styles.inputWrapper,
                  themeStyles.inputWrapper,
                  focusedField === 'phone' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    placeholder="e.g. +234 800 000 0000"
                    placeholderTextColor={colors.text.muted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={[styles.input, themeStyles.input]}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* SECTION 3: STORE DETAILS */}
          <View style={styles.sectionContainer}>
            <View style={[styles.sectionHeader, { borderLeftColor: colors.primary }]}>
              <Feather name="shopping-bag" size={16} color={Theme.colors.primary} />
              <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>Outlet Details</Text>
            </View>

            <View style={styles.inputsGrid}>
              <View>
                <Text style={[styles.label, themeStyles.label]}>Market Name</Text>
                <View style={[
                  styles.inputWrapper,
                  themeStyles.inputWrapper,
                  focusedField === 'market' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    placeholder="e.g. Balogun Main Market"
                    placeholderTextColor={colors.text.muted}
                    value={marketName}
                    onChangeText={setMarketName}
                    style={[styles.input, themeStyles.input]}
                    onFocus={() => setFocusedField('market')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View>
                <Text style={[styles.label, themeStyles.label]}>Customer Type</Text>
                <View style={[styles.pickerContainer, themeStyles.pickerContainer]}>
                  {customerTypeQuery.isLoading ? (
                    <ActivityIndicator size="small" color={Theme.colors.primary} style={{ padding: 14 }} />
                  ) : customerTypeQuery.data ? (
                    <Picker
                      selectedValue={customerTypeId}
                      onValueChange={setCustomerTypeId}
                      style={[styles.picker, themeStyles.picker]}
                      dropdownIconColor={colors.text.primary}
                    >
                      <Picker.Item
                        label="Select customer type..."
                        value=""
                        color={colors.text.muted}
                      />
                      {customerTypeQuery.data.map((customerType) => (
                        <Picker.Item
                          key={customerType.id}
                          label={customerType.name}
                          value={customerType.id}
                          color={colors.text.primary}
                        />
                      ))}
                    </Picker>
                  ) : (
                    <Text style={styles.pickerErrorText}>Failed to load customer types</Text>
                  )}
                </View>
              </View>

              <View>
                <Text style={[styles.label, themeStyles.label]}>Store Address</Text>
                <View style={[
                  styles.inputWrapper,
                  styles.textAreaWrapper,
                  themeStyles.inputWrapper,
                  focusedField === 'address' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    placeholder="Enter full physical address, street and landmarks"
                    placeholderTextColor={colors.text.muted}
                    value={address}
                    onChangeText={setAddress}
                    multiline={true}
                    numberOfLines={3}
                    style={[styles.textArea, themeStyles.input]}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* SECTION 4: SECURITY & VERIFICATION */}
          <View style={styles.sectionContainer}>
            <View style={[styles.sectionHeader, { borderLeftColor: colors.primary }]}>
              <Feather name="shield" size={16} color={Theme.colors.primary} />
              <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>Verification Details</Text>
            </View>

            <View style={styles.inputsGrid}>
              <View>
                <Text style={[styles.label, themeStyles.label]}>BVN Number (Bank Verification Number)</Text>
                <View style={[
                  styles.inputWrapper,
                  themeStyles.inputWrapper,
                  focusedField === 'bvn' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    placeholder="11-digit BVN"
                    placeholderTextColor={colors.text.muted}
                    value={bvnNumber}
                    onChangeText={setBvnNumber}
                    keyboardType="numeric"
                    secureTextEntry={true}
                    style={[styles.input, themeStyles.input]}
                    maxLength={11}
                    onFocus={() => setFocusedField('bvn')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Action Trigger Submit Button */}
          <Pressable
            android_disableSound
            delayLongPress={0}
            onPressIn={() => {
              Haptics.selectionAsync();
            }}
            disabled={loading}
            onPress={handleAddStore}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                width: '100%',
                marginTop: 10,
              },
            ]}
          >
            <LinearGradient
              colors={Theme.colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Register Outlet</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 110, // Margin to keep clear of bottom tabs
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h1,
    color: Theme.colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    marginTop: 2,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    padding: 20,
    ...Theme.shadows.md,
    gap: 28,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
    paddingLeft: 8,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h3,
    color: Theme.colors.text.primary,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  imageUploadBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  imageUploadBoxActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  uploadIconBackground: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imageBoxTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },
  imageBoxSub: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.caption,
    color: Theme.colors.text.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  previewImage: {
    width: '100%',
    height: '75%',
    borderRadius: Theme.radius.sm,
    marginBottom: 8,
  },
  imageBoxChangeText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 10,
    color: Theme.colors.primary,
    textAlign: 'center',
  },
  inputsGrid: {
    gap: 16,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: Theme.colors.primary,
  },
  input: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.primary,
    height: '100%',
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: Theme.colors.text.primary,
  },
  pickerErrorText: {
    color: Theme.colors.danger,
    padding: 14,
    fontSize: Theme.typography.sizes.bodySm,
  },
  textAreaWrapper: {
    height: 100,
    paddingVertical: 10,
  },
  textArea: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.primary,
    textAlignVertical: 'top',
    height: '100%',
  },
  submitButton: {
    padding: 16,
    width: '100%',
    borderRadius: Theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  submitButtonText: {
    color: 'white',
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.body,
    letterSpacing: 0.5,
  },
  otpModalContainer: {
    gap: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  otpModalTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h2,
    color: Theme.colors.text.primary,
  },
  otpModalSubtitle: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  otpSubmitButton: {
    backgroundColor: Theme.colors.primary,
    width: '100%',
    padding: 14,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    ...Theme.shadows.md,
  },
  otpSubmitButtonText: {
    color: 'white',
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.body,
  },
});