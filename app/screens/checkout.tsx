import OwingCard from "@/components/ui/attendence/OwingCard";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, BackHandler, Image, ActivityIndicator, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "@/constants/Theme";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios/axios";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { CheckOutAttendenceParams } from "@/shared/zod";
import { useUserStore } from "@/store";
import { ErrorResponse } from "@/lib/types/types";
import Leaves from "@/components/ui/attendence/Leaves";
import TabBar from "@/components/ui/layout/TabBar";
import HapticPress from "@/components/ui/layout/HapticPress";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File } from 'expo-file-system/next';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { guessMimeType, sanitizeFileName } from '@/lib/image-upload-util/imageUploadUtil';
import { useEffect, useRef, useState } from "react";
import { fetch } from 'expo/fetch';
import { getLocation } from "@/lib/location/location";
import ConveyanceCard from "@/components/ui/attendence/ConveyanceCard";
import { LinearGradient } from "expo-linear-gradient";

export default function Checkout() {
  const insets = useSafeAreaInsets();
  const tenantId = useUserStore(state => state.tenantId);
  const salesmanId = useUserStore(state => state.id);
  const salesmanType = useUserStore((state) => state.salesmanType);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const checkOutMutation = useMutation({
    mutationFn: async (data: CheckOutAttendenceParams) => {
      const res = await api.post(API_ROUTES.ATTENDENCE.CHECK_OUT, data);
      return res.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Checkout successful");
      BackHandler.exitApp();
    },
    onError: (error: ErrorResponse) => {
      Alert.alert("Error", error.response.data.message);
    }
  });

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [odometerUrlEnd, setOdometerUrlEnd] = useState<string | null>(null);
  const [odometerReadingEnd, setOdometerReadingEnd] = useState<number | null>(null);
  const [odometerReadingModalVisible, setOdometerReadingModalVisible] = useState(false);
  const [odometerReadingInput, setOdometerReadingInput] = useState<string>("");
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  const [step, setStep] = useState<'normal' | 'camera' | 'reading'>('normal');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const handleSnap = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      if (!photo) {
        Alert.alert("Error", "Unable to take photo");
        return;
      }
      const context = ImageManipulator.manipulate(photo.uri);
      context.resize({ width: 400 });
      const renderedImage = await context.renderAsync();
      const manipulated = await renderedImage.saveAsync({
        compress: 0.4,
        format: SaveFormat.JPEG,
      });
      setPhotoUri(manipulated.uri);
    }
  };

  const uploadPicture = async () => {
    if (!photoUri) return;
    setUploadState('uploading');
    try {
      const file = new File(photoUri);
      if (!file.exists) throw new Error('File does not exist');
      const fileName = photoUri.split('/').pop() || `photo_${Date.now()}.jpg`;
      const fileType = guessMimeType(photoUri);
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
      setOdometerUrlEnd(fileUrl);
      setUploadState('uploaded');
      setStep('reading');
      setPhotoUri(null);
    } catch (err) {
      setUploadState('error');
      Alert.alert("Error", "Upload failed");
    }
  };

  const handleCheckOut = async () => {
    const location = await getLocation();
    if (!location) {
      alert("Unable to get location");
      return;
    }
    const { latitude, longitude } = location;
    if (!tenantId || !salesmanId) {
      Alert.alert("Error", "Tenant ID or Salesman ID is not found");
      return;
    }
    if (salesmanType === "VANSALES") {
      setStep('camera');
    } else {
      setLoading(true);
      checkOutMutation.mutate({
        tenantId,
        salesmanId,
        checkOutTime: new Date().toISOString(),
        latitude,
        longitude,
      });
    }
  };

  const handleConfirmReading = async () => {
    const location = await getLocation();
    if (!location) {
      alert("Unable to get location");
      return;
    }
    const { latitude, longitude } = location;
    const reading = parseInt(odometerReadingInput, 10);
    if (isNaN(reading) || reading < 0) {
      Alert.alert("Error", "Please enter a valid number");
      return;
    }
    if (!odometerUrlEnd) {
      Alert.alert("Error", "Please upload the odometer photo first");
      return;
    }
    if (!tenantId || !salesmanId) {
      Alert.alert("Error", "Tenant ID or Salesman ID is not found");
      return;
    }
    setOdometerReadingEnd(reading);
    setOdometerReadingModalVisible(false);
    setLoading(true);
    checkOutMutation.mutate({
      tenantId,
      salesmanId,
      checkOutTime: new Date().toISOString(),
      oddometerUrlEnd: odometerUrlEnd,
      oddometerReadingEnd: reading,
      latitude,
      longitude,
    });
  };

  useEffect(() => {
    if (step === 'reading') {
      setOdometerReadingModalVisible(true);
    }
  }, [step]);

  return (
    <View style={styles.container}>
      <TabBar title="CHECKOUT" />
      
      <ScrollView
        style={styles.scrollStyle}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsGrid}>
          {/* Owing Details */}
          <OwingCard />

          {/* Conveyance details */}
          <ConveyanceCard />

          {/* Leaves History */}
          <Leaves />
        </View>
      </ScrollView>

      {/* Camera Modal for Odometer End Photo */}
      {salesmanType === "VANSALES" && (
        <Modal
          visible={step === 'camera'}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setStep('normal')}
        >
          <SafeAreaView style={styles.cameraContainer}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setStep('normal')} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.cameraHeaderTitle}>Odometer End Photo</Text>
            </View>

            <View style={styles.cameraPreviewWrapper}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              ) : (
                <CameraView
                  ref={cameraRef}
                  facing="back"
                  style={styles.camera}
                />
              )}
            </View>

            <Text style={styles.cameraInstruction}>
              {photoUri ? "Upload photo to enter odometer reading" : "Snap a clear photo of the ending odometer reading"}
            </Text>

            <View style={styles.cameraActions}>
              {!photoUri ? (
                <TouchableOpacity style={styles.cameraCaptureButton} onPress={handleSnap} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[Theme.colors.primary, Theme.colors.accent]}
                    style={styles.captureGradient}
                  >
                    <Ionicons name="camera" size={32} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.cameraActionRow}>
                  <TouchableOpacity style={styles.retakeCircleButton} onPress={() => {
                    setPhotoUri(null);
                    setUploadState('idle');
                  }} activeOpacity={0.8}>
                    <Ionicons name="refresh" size={28} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.uploadCircleButton,
                      uploadState === 'uploaded' && styles.uploadCircleSuccess
                    ]} 
                    onPress={uploadPicture} 
                    disabled={uploadState === 'uploading'}
                    activeOpacity={0.8}
                  >
                    {uploadState === 'uploading' && <ActivityIndicator size="small" color="#059669" />}
                    {uploadState === 'uploaded' && <Ionicons name="checkmark-circle" size={32} color="#059669" />}
                    {uploadState === 'idle' && <Ionicons name="cloud-upload" size={28} color="#059669" />}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {/* Odometer Reading Modal */}
      {salesmanType === "VANSALES" && (
        <Modal
          visible={odometerReadingModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setOdometerReadingModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={["rgba(15, 23, 42, 0.4)", "rgba(15, 23, 42, 0.8)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderBar} />
              <Text style={styles.modalTitle}>Odometer End Reading</Text>
              <Text style={styles.modalSubtitle}>Please enter the final mileage showing on dashboard</Text>
              
              <TextInput
                style={[
                  styles.input,
                  inputFocused && styles.inputFocused
                ]}
                keyboardType="numeric"
                placeholder="Enter final km"
                placeholderTextColor={Theme.colors.text.muted}
                value={odometerReadingInput}
                onChangeText={setOdometerReadingInput}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                autoFocus
              />
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmReading}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? "Submitting..." : "Confirm Checkout"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Fixed Bottom Checkout Button */}
      {step === 'normal' && (
        <View style={[styles.fixedButtonContainer, { bottom: insets.bottom + 10 }]}>
          <HapticPress style={{ borderRadius: Theme.radius.lg }} onPress={handleCheckOut}>
            <LinearGradient
              colors={[Theme.colors.danger, '#C084FC']} // Gradient indicating checkout transition
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkoutButton}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="exit-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Complete Checkout</Text>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={14} color="white" />
                  <Text style={styles.timeText}>{currentTime}</Text>
                </View>
              </View>
            </LinearGradient>
          </HapticPress>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollStyle: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Avoid overlap with bottom button
  },
  cardsGrid: {
    gap: 16,
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    ...Theme.shadows.lg,
  },
  checkoutButton: {
    borderRadius: Theme.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: Theme.typography.sizes.h3,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: Theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 8,
    gap: 4,
  },
  timeText: {
    color: 'white',
    fontSize: Theme.typography.sizes.caption,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  closeButton: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Theme.radius.full,
  },
  cameraHeaderTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h3,
    color: '#FFFFFF',
  },
  cameraPreviewWrapper: {
    flex: 1,
    marginVertical: 20,
    marginHorizontal: 16,
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraInstruction: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm,
    color: '#94A3B8',
    textAlign: 'center',
    marginHorizontal: 24,
  },
  cameraActions: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  cameraCaptureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraActionRow: {
    flexDirection: 'row',
    gap: 24,
  },
  retakeCircleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  uploadCircleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D8F9EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadCircleSuccess: {
    backgroundColor: '#D8F9EA',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  modalHeaderBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.colors.border,
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h2,
    color: Theme.colors.text.primary,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    padding: 16,
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h1,
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    color: Theme.colors.text.primary,
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFFFFF',
    ...Theme.shadows.sm,
  },
  confirmButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    width: '100%',
    ...Theme.shadows.md,
  },
  confirmButtonText: {
    color: 'white',
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h3,
  },
});