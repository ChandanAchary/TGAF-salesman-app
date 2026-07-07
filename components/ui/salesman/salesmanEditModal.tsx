import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Modal, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { primary } from "@/constants/Colors";
import { EditSalesmanParams } from "@/shared/zod";
import Avatar from "@/components/lazy/Avatar";
import { sanitizeFileName } from "@/lib/image-upload-util/imageUploadUtil";
import { ErrorResponse } from "@/lib/types/types";
import { myDataQuery } from "@/lib/user/util";
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { BlurView } from 'expo-blur';
import { fetch } from 'expo/fetch';

interface EditProps {
  form: Partial<myDataQuery>;
  setForm: React.Dispatch<React.SetStateAction<Partial<myDataQuery>>>;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  refetch: () => void;
  avatarUri: string | null;
  setAvatarUri: React.Dispatch<React.SetStateAction<string | null>>;
  addressProofUri?: string | null;
  setAddressProofUri: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function SalesmanEditModal({
  form,
  setForm,
  modalVisible,
  setModalVisible,
  refetch,
  avatarUri,
  setAvatarUri,
  addressProofUri,
  setAddressProofUri,
}: EditProps) {
  const [isSaving, setIsSaving] = useState(false);

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

  const pickAndUploadImage = async (type: "avatar" | "addressProof") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your media library');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: type == "avatar" ? true : false,
      aspect: type == "avatar" ? [1, 1] : [3, 2],
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
      else setAddressProofUri(compressed.uri);
    }
  };

  const editSalesmanMutaion = useMutation({
    mutationFn: async (payload: EditSalesmanParams) => {
      const res = await api.post(API_ROUTES.AUTH.EDIT, payload);
      return res.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Profile updated successfully");
      setModalVisible(false);
      refetch();
    },
    onError: (error: ErrorResponse) => {
      alert(error.response.data.message);
    }
  })

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = form.avatar;
      let addressProofUrl = form.addressProof;
      if (avatarUri) {
        const { fileUrl } = await uploadImageMutation.mutateAsync(avatarUri);
        avatarUrl = fileUrl;
      }
      if (addressProofUri) {
        const { fileUrl } = await uploadImageMutation.mutateAsync(addressProofUri);
        addressProofUrl = fileUrl;
      }
      editSalesmanMutaion.mutate({
        name: form.name,
        phone: form.phone,
        bank: form.bank,
        address: form.address,
        avatar: avatarUrl,
        addressProof: addressProofUrl,
      });
    } catch (e) {
      Alert.alert("Error", "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
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
          <Text style={styles.modalTitle}>Edit Profile</Text>

          {/* Avatar Section */}
          <TouchableOpacity
            onPress={() => pickAndUploadImage("avatar")}
            style={styles.avatarEditContainer}
          >
            <Avatar
              src={avatarUri || (form.avatar as string)}
              size={100}
              alt={form.name || "Avatar"}
              textStyle={{ fontSize: 40 }}
            />
            <View style={styles.changeAvatarButton}>
              <MaterialIcons name="photo-camera" size={18} color="#6C63FF" />
              <Text style={styles.changeAvatarText}>Change</Text>
            </View>
          </TouchableOpacity>

          {/* Form Fields */}
          <ScrollView style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#A0A4B8"
                value={form.name ?? ""}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#A0A4B8"
                value={form.phone ?? ""}
                onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="account-balance" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bank Account"
                placeholderTextColor="#A0A4B8"
                value={form.bank ?? ""}
                onChangeText={v => setForm(f => ({ ...f, bank: v }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="location-on" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#A0A4B8"
                value={form.address ?? ""}
                onChangeText={v => setForm(f => ({ ...f, address: v }))}
                multiline
              />
            </View>

            {/* Address Proof */}
            <TouchableOpacity
              onPress={() => pickAndUploadImage("addressProof")}
              style={styles.addressProofContainer}
            >
              <Text style={styles.addressProofLabel}>Address Proof</Text>
              {addressProofUri || form.addressProof ? (
                <Image
                  source={{ uri: addressProofUri || (form.addressProof as string) }}
                  style={styles.addressProofImage}
                />
              ) : (
                <View style={styles.addressProofPlaceholder}>
                  <MaterialIcons name="cloud-upload" size={32} color="#6C63FF" />
                  <Text style={styles.addressProofPlaceholderText}>Upload Document</Text>
                </View>
              )}
            </TouchableOpacity>
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
              onPress={handleSave}
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
});