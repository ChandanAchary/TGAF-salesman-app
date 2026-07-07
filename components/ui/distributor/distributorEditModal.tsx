import { DistributorDetailsResponse } from "@/app/screens/distributor/distributorDetails";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { ErrorResponse } from "@/lib/types/types";
import { UpdateDistirbutorDetailsParams } from "@/shared/zod";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, Image, ActivityIndicator, Alert, Linking } from "react-native";
import { fetch } from 'expo/fetch';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { sanitizeFileName } from "@/lib/image-upload-util/imageUploadUtil";
import { primary } from "@/constants/Colors";
import { getLocation } from "@/lib/location/location";
import DateTimePicker from '@react-native-community/datetimepicker';

interface EditProps {
  distributor?: DistributorDetailsResponse["data"] | null;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  refetch: () => void;
}

export default function DistributorEditModal({
  distributor,
  modalVisible,
  setModalVisible,
  refetch,
}: EditProps) {
  const [form, setForm] = useState<any>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [coiUri, setCoiUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnniversaryPicker, setShowAnniversaryPicker] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (uri: string) => {
      const file = new File(uri);
      if (!file.exists) throw new Error('File does not exist');
      const fileName = uri.split('/').pop() || `img_${Date.now()}.jpg`;
      const fileType = 'image/jpeg';
      const encodedFileName = sanitizeFileName(fileName);

      const res = await fetch(
        `${API_ROUTES.UPLOAD.PRE_SIGNED_URL}?fileName=${encodedFileName}&fileType=${fileType}`
      );
      if (!res.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, fileUrl } = await res.json();

      const fileContent = file.base64Sync();
      const binaryString = atob(fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
          'x-amz-acl': 'public-read',
        },
        body: bytes,
      });
      if (!uploadResult.ok) throw new Error('Upload failed');
      return { fileUrl };
    },
  });

  const pickAndUploadImage = async (type: "avatar" | "coi") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your media library');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: type === "avatar",
      aspect: type === "avatar" ? [1, 1] : [3, 2],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      const context = ImageManipulator.manipulate(uri);
      context.resize({ width: type === "avatar" ? 200 : 500 });
      const renderedImage = await context.renderAsync();
      const compressed = await renderedImage.saveAsync({
        compress: type === "avatar" ? 0.2 : 0.4,
        format: SaveFormat.JPEG,
      });
      if (type === "avatar") setAvatarUri(compressed.uri);
      else setCoiUri(compressed.uri);
    }
  };

  const distributorDetailsMutaion = useMutation({
    mutationFn: async (data: UpdateDistirbutorDetailsParams) => {
      const res = await api.post(API_ROUTES.CITY_HEAD.UPDATE_DISTRIBUTOR_DETAILS, data);
      return res.data;
    },
    onSuccess: () => {
      alert("Distributor details updated successfully");
      refetch();
    },
    onError: (err: ErrorResponse) => {
      alert(`Failed to update distributor details ${err.response.data.message}`);
    }
  });

  // Fill form with distributor data when modal opens
  useEffect(() => {
    if (modalVisible && distributor) {
      setForm({
        id: distributor.id,
        name: distributor.name || "",
        phone: distributor.phone || "",
        address: distributor.address || "",
        avatar: distributor.avatar || "",
        marketName: distributor.marketName || "",
        latitude: distributor.latitude,
        longitude: distributor.longitude,
        bankAccountNumber: distributor.bankAccountNumber || "",
        bankHolderName: distributor.bankHolderName || "",
        currentAccountNumber: distributor.currentAccountNumber || "",
        cseName: distributor.cseName || "",
        distributorCode: distributor.distributorCode || "",
        anniversaryDate: distributor.anniversaryDate ? new Date(distributor.anniversaryDate).toISOString().slice(0, 10) : "",
        dateOfBirth: distributor.dateOfBirth ? new Date(distributor.dateOfBirth).toISOString().slice(0, 10) : "",
        coi: distributor.coi || "",
        Godown: distributor.Godown?.map(g => ({
          id: g.id || "",
          name: g.name || "",
          address: g.address || "",
          city: g.city || "",
          state: g.state || "",
          pinCode: g.pinCode || "",
        })) || [],
        OwnShop: distributor.OwnShop?.map(s => ({
          id: s.id || "",
          name: s.name || "",
          phone: s.phone || "",
          address: s.address || "",
          contactPerson: s.contactPerson || "",
        })) || [],
        CompanyDelt: distributor.CompanyDelt?.map(c => ({
          id: c.id || "",
          name: c.name || "",
          dealingType: c.dealingType || "",
          productCategory: c.productCategory || "",
        })) || [],
      });
      setAvatarUri(null);
      setCoiUri(null);
    }
  }, [modalVisible, distributor]);

  const handleFormChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  // For array fields (Godown, OwnShop, CompanyDelt)
  const handleArrayChange = (section: string, idx: number, key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: prev[section].map((item: any, i: number) =>
        i === idx ? { ...item, [key]: value } : item
      ),
    }));
  };
  const handleAddArrayItem = (section: string, defaultObj: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: [...(prev[section] || []), defaultObj],
    }));
  };
  const handleRemoveArrayItem = (section: string, idx: number) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: prev[section].filter((_: any, i: number) => i !== idx),
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    // const cords = await getLocation();

    // if (!cords?.latitude || !cords.longitude) {
    //   Alert.alert("Error", "Failed to get current location. Please try again.");
    //   setIsSaving(false);
    //   return;
    // }
    console.log("\nform value\n", form)

    try {
      let avatarUrl = form.avatar;
      let coiUrl = form.coi;
      if (avatarUri) {
        const { fileUrl } = await uploadImageMutation.mutateAsync(avatarUri);
        avatarUrl = fileUrl;
      }
      if (coiUri) {
        const { fileUrl } = await uploadImageMutation.mutateAsync(coiUri);
        coiUrl = fileUrl;
      }

      distributorDetailsMutaion.mutate(
        {
          ...form,
          avatar: avatarUrl,
          coi: coiUrl,
          anniversaryDate: form.anniversaryDate || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          // if location is fetched and allowed to be updated use this
          // latitude: cords?.latitude || form.latitude,
          // longitude: cords?.longitude || form.lonitude,
        },
        {
          onSuccess: () => setModalVisible(false),
        }
      );
    } catch (e) {
      console.error("Error updating distributor details:", e);
      Alert.alert("Error", "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewLocation = async () => {
    const latitude = form?.latitude;
    const longitude = form?.longitude;
    if (!latitude || !longitude) {
      Alert.alert("Error", "No location found for this distributor.");
      return;
    }
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Error", "Unable to open Google Maps.");
      return;
    }
    Linking.openURL(url);
  };

  const handleRequestLocationUpdate = async () => {
    const cords = await getLocation();
    if (!cords?.latitude || !cords?.longitude) {
      Alert.alert("Error", "Failed to get current location. Please try again.");
      return;
    }
    const message =
      "You are not allowed to change location any more. click the request admin button beside to change location.";
    Alert.alert("Location Update", message);
  };

  const handleWhatsAppRequest = async () => {
    const cords = await getLocation();
    if (!cords?.latitude || !cords?.longitude) {
      Alert.alert("Error", "Failed to get current location. Please try again.");
      return;
    }
    const text =
      "Update request: " +
      `distributor name ${form?.name || ""}, ` +
      `distributor id ${form?.id || ""}, ` +
      `user latitude ${cords.latitude}, ` +
      `user longiturde ${cords.longitude}`;
    const url = `https://wa.me/+2348187015532?text=${encodeURIComponent(text)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Error", "Unable to open WhatsApp.");
      return;
    }
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <BlurView intensity={20} style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Distributor</Text>

          {/* Form Fields */}
          <ScrollView style={styles.formContainer}>
            {/* Avatar Section */}
            <TouchableOpacity
              onPress={() => pickAndUploadImage("avatar")}
              style={styles.avatarEditContainer}
            >
              {avatarUri || form?.avatar ? (
                <Image
                  source={{ uri: avatarUri || form.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={48} color="#A0A4B8" />
                </View>
              )}
              <View style={styles.changeAvatarButton}>
                <MaterialIcons name="photo-camera" size={18} color="#6C63FF" />
                <Text style={styles.changeAvatarText}>Change</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <MaterialIcons name="person" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#A0A4B8"
                value={form?.name ?? ""}
                onChangeText={v => handleFormChange("name", v)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <MaterialIcons name="phone" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#A0A4B8"
                value={form?.phone ?? ""}
                onChangeText={v => handleFormChange("phone", v)}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address</Text>
              <MaterialIcons name="location-on" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#A0A4B8"
                value={form?.address ?? ""}
                onChangeText={v => handleFormChange("address", v)}
                multiline
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Market Name</Text>
              <MaterialIcons name="store" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Market Name"
                placeholderTextColor="#A0A4B8"
                value={form?.marketName ?? ""}
                onChangeText={v => handleFormChange("marketName", v)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bank Account Number</Text>
              <MaterialIcons name="account-balance" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bank Account Number"
                placeholderTextColor="#A0A4B8"
                value={form?.bankAccountNumber ?? ""}
                onChangeText={v => handleFormChange("bankAccountNumber", v)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bank Holder Name</Text>
              <MaterialIcons name="person" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bank Holder Name"
                placeholderTextColor="#A0A4B8"
                value={form?.bankHolderName ?? ""}
                onChangeText={v => handleFormChange("bankHolderName", v)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Account Number</Text>
              <MaterialIcons name="account-balance-wallet" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Current Account Number"
                placeholderTextColor="#A0A4B8"
                value={form?.currentAccountNumber ?? ""}
                onChangeText={v => handleFormChange("currentAccountNumber", v)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CSE Name</Text>
              <MaterialIcons name="person" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="CSE Name"
                placeholderTextColor="#A0A4B8"
                value={form?.cseName ?? ""}
                onChangeText={v => handleFormChange("cseName", v)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Distributor Code</Text>
              <MaterialIcons name="confirmation-number" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Distributor Code"
                placeholderTextColor="#A0A4B8"
                value={form?.distributorCode ?? ""}
                onChangeText={v => handleFormChange("distributorCode", v)}
              />
            </View>
            <View style={styles.inlineButtonGroup}>
              <TouchableOpacity style={styles.inlineButton} onPress={handleViewLocation}>
                <MaterialIcons name="location-on" size={18} color="#6C63FF" />
                <Text style={styles.inlineButtonText}>View Location in Google</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inlineButtonGroup}>
              <TouchableOpacity style={styles.inlineButton} onPress={handleRequestLocationUpdate}>
                <MaterialIcons name="my-location" size={18} color="#6C63FF" />
                <Text style={styles.inlineButtonText}>Update Lat/Long</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.inlineButton} onPress={handleWhatsAppRequest}>
                <MaterialIcons name="chat" size={18} color="#6C63FF" />
                <Text style={styles.inlineButtonText}>Request Admin</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Anniversary Date</Text>
              <MaterialIcons name="event" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setShowAnniversaryPicker(true)}
              >
                <Text style={{ color: form?.anniversaryDate ? '#3A3A3A' : '#A0A4B8', fontSize: 15 }}>
                  {form?.anniversaryDate || "Select Anniversary Date"}
                </Text>
              </TouchableOpacity>
              {showAnniversaryPicker && (
                <DateTimePicker
                  value={form?.anniversaryDate ? new Date(form.anniversaryDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowAnniversaryPicker(false);
                    if (date) {
                      handleFormChange("anniversaryDate", date.toISOString().slice(0, 10));
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <MaterialIcons name="cake" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setShowDobPicker(true)}
              >
                <Text style={{ color: form?.dateOfBirth ? '#3A3A3A' : '#A0A4B8', fontSize: 15 }}>
                  {form?.dateOfBirth || "Select Date of Birth"}
                </Text>
              </TouchableOpacity>
              {showDobPicker && (
                <DateTimePicker
                  value={form?.dateOfBirth ? new Date(form.dateOfBirth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowDobPicker(false);
                    if (date) {
                      handleFormChange("dateOfBirth", date.toISOString().slice(0, 10));
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>
            {/* COI Section */}
            <TouchableOpacity
              onPress={() => pickAndUploadImage("coi")}
              style={styles.coiContainer}
            >
              <Text style={styles.coiLabel}>Certificate of Incorporation (COI)</Text>
              {coiUri || form?.coi ? (
                <Image
                  source={{ uri: coiUri || form.coi }}
                  style={styles.coiImage}
                />
              ) : (
                <View style={styles.coiPlaceholder}>
                  <MaterialIcons name="cloud-upload" size={32} color="#6C63FF" />
                  <Text style={styles.coiPlaceholderText}>Upload COI</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* Godown Section */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Godowns</Text>
              {(form?.Godown || []).map((g: any, idx: number) => (
                <View key={g.id || idx} style={{ marginBottom: 12, padding: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 16 }}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Godown Name</Text>
                    <MaterialIcons name="shop" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Name"
                      value={g.name}
                      onChangeText={v => handleArrayChange("Godown", idx, "name", v)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Godown Name</Text>
                    <MaterialIcons name="shop" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Address"
                      value={g.address}
                      onChangeText={v => handleArrayChange("Godown", idx, "address", v)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Godown Name</Text>
                    <MaterialIcons name="shop" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="City"
                      value={g.city}
                      onChangeText={v => handleArrayChange("Godown", idx, "city", v)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>State</Text>
                    <MaterialIcons name="location-city" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="State"
                      value={g.state}
                      onChangeText={v => handleArrayChange("Godown", idx, "state", v)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Pin Code</Text>
                    <MaterialIcons name="pin-drop" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Pin Code"
                      value={g.pinCode}
                      onChangeText={v => handleArrayChange("Godown", idx, "pinCode", v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveArrayItem("Godown", idx)}>
                    <Text style={{ color: 'red', marginTop: 4 }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
                onPress={() => handleAddArrayItem("Godown", { id: "", name: "", address: "", city: "", state: "", pinCode: "" })}
              >
                <Text style={{ color: primary, fontWeight: 'bold' }}>+ Add Godown</Text>
              </TouchableOpacity>
            </View>
            {/* Own Shop Section */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Own Shops</Text>
              {(form?.OwnShop || []).map((s: any, idx: number) => (
                <View key={s.id || idx} style={{ marginBottom: 12, padding: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 16 }}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Shop Name</Text>
                    <MaterialIcons name="store" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Shop Name"
                      value={s.name}
                      onChangeText={v => handleArrayChange("OwnShop", idx, "name", v)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone</Text>
                    <MaterialIcons name="phone" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone"
                      value={s.phone}
                      onChangeText={v => handleArrayChange("OwnShop", idx, "phone", v)}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Address</Text>
                    <MaterialIcons name="location-on" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Address"
                      value={s.address}
                      onChangeText={v => handleArrayChange("OwnShop", idx, "address", v)}
                      multiline
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Contact Person</Text>
                    <MaterialIcons name="person" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Contact Person"
                      value={s.contactPerson}
                      onChangeText={v => handleArrayChange("OwnShop", idx, "contactPerson", v)}
                    />
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveArrayItem("OwnShop", idx)}>
                    <Text style={{ color: 'red', marginTop: 4 }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
                onPress={() => handleAddArrayItem("OwnShop", { id: "", name: "", phone: "", address: "", contactPerson: "" })}
              >
                <Text style={{ color: primary, fontWeight: 'bold' }}>+ Add Own Shop</Text>
              </TouchableOpacity>
            </View>
            {/* Company Delt Section */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Company Dealt</Text>
              {(form?.CompanyDelt || []).map((c: any, idx: number) => (
                <View key={c.id || idx} style={{ marginBottom: 12, padding: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 16 }}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Company Name</Text>
                    <MaterialIcons name="business" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Company Name"
                      value={c.name}
                      onChangeText={v => handleArrayChange("CompanyDelt", idx, "name", v)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Dealing Type</Text>
                    <MaterialIcons name="swap-horiz" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#e0e0e0',
                          backgroundColor: '#FAFAFF',
                        }}
                        onPress={() => {
                          // Toggle dropdown logic here if you want a custom dropdown
                          // For simplicity, we use Alert.prompt for now
                          Alert.alert(
                            "Select Dealing Type",
                            "",
                            [
                              {
                                text: "DISTRIBUTOR",
                                onPress: () => handleArrayChange("CompanyDelt", idx, "dealingType", "DISTRIBUTOR"),
                              },
                              {
                                text: "MEGA",
                                onPress: () => handleArrayChange("CompanyDelt", idx, "dealingType", "MEGA"),
                              },
                              { text: "Cancel", style: "cancel" }
                            ]
                          );
                        }}
                      >
                        <Text style={{ flex: 1, color: c.dealingType ? '#3A3A3A' : '#A0A4B8' }}>
                          {c.dealingType || "Select Dealing Type"}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={20} color="#6C63FF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Product Category</Text>
                    <MaterialIcons name="category" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Product Category"
                      value={c.productCategory}
                      onChangeText={v => handleArrayChange("CompanyDelt", idx, "productCategory", v)}
                    />
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveArrayItem("CompanyDelt", idx)}>
                    <Text style={{ color: 'red', marginTop: 4 }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
                onPress={() => handleAddArrayItem("CompanyDelt", { id: "", name: "", dealingType: "", productCategory: "" })}
              >
                <Text style={{ color: primary, fontWeight: 'bold' }}>+ Add Company Dealt</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          {/* Action Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
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
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: "center",
    justifyContent: "center",
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
    paddingTop: 8,
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
  inputLabel: {
    position: "absolute",
    top: -10,
    right: 16, // icon margin + icon size
    fontSize: 11,
    color: "#A0A4B8",
    backgroundColor: "#FAFAFF",
    zIndex: 2,
    paddingHorizontal: 4,
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
  coiContainer: {
    marginVertical: 8,
  },
  coiLabel: {
    fontSize: 14,
    color: '#A0A4B8',
    marginBottom: 8,
  },
  coiImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  coiPlaceholder: {
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
  coiPlaceholderText: {
    marginTop: 8,
    color: primary,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inlineButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  inlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  inlineButtonText: {
    marginLeft: 6,
    color: primary,
    fontWeight: '600',
    fontSize: 13,
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
});