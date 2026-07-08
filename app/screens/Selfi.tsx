import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { Theme } from '@/constants/Theme';
import { CameraIcon, CameraRotateIcon, CheckCircleIcon, SealCheckIcon, ShieldCheckIcon, UploadSimpleIcon, CaretLeft } from 'phosphor-react-native';
import WifiButton from '@/components/ui/WifiButton';
import { File } from 'expo-file-system';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { guessMimeType, sanitizeFileName } from '@/lib/image-upload-util/imageUploadUtil';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserStore } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { CheckInAttendenceParams } from '@/shared/zod';
import { api } from '@/lib/axios/axios';
import { ErrorResponse } from '@/lib/types/types';
import Avatar from '@/components/lazy/Avatar';
import { getLocation } from '@/lib/location/location';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { fetch } from 'expo/fetch';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelfieCapture() {
  const { startPoint, activity } = useLocalSearchParams();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [captureStep, setCaptureStep] = useState<'selfie' | 'odometer' | 'done'>('selfie');
  const [odometerImageUrl, setOdometerImageUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  const isOnline = useIsOnline();
  const salesmanType = useUserStore((state) => state.salesmanType);
  const salesmanName = useUserStore((state) => state.name);
  const salesmanAvatar = useUserStore((state) => state.avatar);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [odometerReadingStart, setOdometerReadingStart] = useState<number | null>(null);
  const [odometerReadingModalVisible, setOdometerReadingModalVisible] = useState(false);
  const [odometerReadingInput, setOdometerReadingInput] = useState<string>("");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/screens/checkin");
    }
  };

  const handleSnap = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      if (!photo) {
        alert("Unable to take photo");
        return;
      }

      const context = ImageManipulator.manipulate(photo.uri);
      context.resize({ width: 400 });
      const renderedImage = await context.renderAsync();
      const manipulated = await renderedImage.saveAsync({
        compress: 0.4,
        format: SaveFormat.JPEG,
      });

      if (captureStep === 'selfie') {
        setPhotoUri(manipulated.uri);
      } else if (captureStep === 'odometer') {
        setPhotoUri(manipulated.uri);
      }
    }
  };

  const attendenceMutation = useMutation({
    mutationFn: async (data: CheckInAttendenceParams) => {
      const res = await api.post(API_ROUTES.ATTENDENCE.CHECK_IN, data);
      return res.data;
    },
    onSuccess: (data) => {
      console.log('Attendance check-in successful:', data);
      router.replace("/(tabs)");
      setLoading(false);
    },
    onError: (error: ErrorResponse) => {
      console.error('Error checking in attendance:', error);
      alert(`Error: ${error.response.data.message}`);
      setLoading(false);
    }
  });

  const handleContinue = async () => {
    setLoading(true);
    const id = useUserStore.getState().id;
    const tenantId = useUserStore.getState().tenantId;

    const location = await getLocation();
    if (!location) {
      alert("Unable to get location");
      return;
    }
    const { latitude, longitude } = location;

    if (!tenantId) {
      alert("tenant id not found");
      return;
    }
    if (!id) {
      alert("salesman id not found");
      return;
    }
    if (startPoint !== 'HOME' && startPoint !== 'MARKET') {
      alert("Please select a start point");
      return;
    }
    if (!imageUrl) {
      alert("Image URL not found");
      return;
    }
    if (!isOnline) {
      alert("You need an internet connection to upload the photo");
      return;
    }
    if (activity != 'TASK_FORCE' && activity != 'WORKING') {
      alert("Activity not found");
      return;
    }
    attendenceMutation.mutate({
      startPoint: startPoint,
      selfieUrl: imageUrl,
      oddometerUrl: odometerImageUrl ? odometerImageUrl : undefined,
      salesmanId: id,
      checkInTime: new Date().toISOString(),
      tenantId: tenantId,
      oddometerReadingStart: odometerReadingStart ? odometerReadingStart : undefined,
      latitude,
      longitude,
      activity
    })
  }

  const uploadPicture = async () => {
    if (!photoUri) return;
    if (!isOnline) {
      alert("You need an internet connection to upload the photo");
      return;
    }

    setUploadState('uploading');

    try {
      console.log('Uploading photo:', photoUri);
      const file = new File(photoUri);
      if (!file.exists) {
        throw new Error('File does not exist');
      }

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

      if (captureStep === 'selfie') {
        setImageUrl(fileUrl);
        if (salesmanType === 'VANSALES') {
          setCaptureStep('odometer');
          setPhotoUri(null);
          setUploadState('idle');
          return;
        } else {
          setCaptureStep('done');
        }
      } else if (captureStep === 'odometer') {
        setOdometerReadingModalVisible(true);
        setOdometerImageUrl(fileUrl);
        setCaptureStep('done');
      }

      setUploadState('uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadState('error');
    }
  };

  if (!permission) return <View style={styles.darkBackground} />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center, styles.darkBackground]}>
        <Image 
          source={{ uri: "https://img.freepik.com/free-vector/hand-drawn-please-illustration_23-2150191689.jpg" }} 
          style={styles.permissionImage} 
        />
        <Text style={styles.permissionMessage}>We need your permission to use the camera for verification</Text>
        <TouchableOpacity 
          onPress={requestPermission} 
          style={styles.permissionButton}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
          <ShieldCheckIcon size={24} color='white' />
        </TouchableOpacity>
      </View>
    );
  }

  // Determine current step index for visual indicator
  const getStepIndex = () => {
    if (captureStep === 'selfie') return 1;
    if (captureStep === 'odometer') return 2;
    return 3;
  };

  return (
    <SafeAreaView style={[styles.container, styles.darkBackground]}>
      {/* Header bar */}
      <View style={styles.tabbar}>
        <View style={styles.tabbarleft}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <CaretLeft size={24} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          <Avatar src={salesmanAvatar ?? undefined} alt={salesmanName} size={44} />
          <View style={styles.tabbardetails}>
            <Text style={styles.welcomeText}>Verification</Text>
            <Text style={styles.salesmanText}>{salesmanName?.split(" ")[0]} ({salesmanType})</Text>
          </View>
        </View>
        <View style={styles.wifiButtonWrapper}>
          <WifiButton />
        </View>
      </View>

      {/* Progress Step Indicator */}
      <View style={styles.stepIndicatorWrapper}>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, getStepIndex() >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, getStepIndex() >= 1 && styles.stepDotTextActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, getStepIndex() >= 2 && styles.stepLineActive]} />
          
          {salesmanType === 'VANSALES' && (
            <>
              <View style={[styles.stepDot, getStepIndex() >= 2 && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, getStepIndex() >= 2 && styles.stepDotTextActive]}>2</Text>
              </View>
              <View style={[styles.stepLine, getStepIndex() >= 3 && styles.stepLineActive]} />
            </>
          )}

          <View style={[styles.stepDot, getStepIndex() >= 3 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, getStepIndex() >= 3 && styles.stepDotTextActive]}>✓</Text>
          </View>
        </View>
        <View style={styles.stepLabelRow}>
          <Text style={[styles.stepLabel, getStepIndex() === 1 && styles.stepLabelActive]}>Selfie</Text>
          {salesmanType === 'VANSALES' && (
            <Text style={[styles.stepLabel, getStepIndex() === 2 && styles.stepLabelActive]}>Odometer</Text>
          )}
          <Text style={[styles.stepLabel, getStepIndex() === 3 && styles.stepLabelActive]}>Confirm</Text>
        </View>
      </View>

      {/* Camera Preview */}
      <View style={styles.center}>
        <View style={[
          styles.previewBox, 
          captureStep === 'done' ? styles.previewBoxSuccess : styles.previewBoxBorder
        ]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          ) : (
            <CameraView
              ref={cameraRef}
              facing={captureStep === 'odometer' ? 'back' : 'front'}
              style={styles.camera}
            />
          )}
        </View>

        <Text style={[
          styles.statusMessage, 
          captureStep === 'done' ? styles.statusMessageSuccess : styles.statusMessageNormal
        ]}>
          {
            captureStep === 'selfie' ? 'Smile, we need your picture' :
              captureStep === 'odometer' ? 'Align & capture the odometer reading' :
                'Verification Uploaded!'
          }
        </Text>

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          {!photoUri ? (
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={handleSnap}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Theme.colors.primary, Theme.colors.accent]}
                style={styles.captureButtonGradient}
              >
                <CameraIcon size={32} color='white' weight="bold" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonsRow}>
              {captureStep === 'done' ? (
                <TouchableOpacity 
                  onPress={handleContinue}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={Theme.colors.gradients.success}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButton}
                  >
                    <SealCheckIcon size={24} color="#FFFFFF" weight="fill" />
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.successButtonText}>Finish Check-in</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.circleButton, styles.retakeButton]} 
                    onPress={() => {
                      setPhotoUri(null);
                      setUploadState('idle');
                      setImageUrl(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <CameraRotateIcon size={28} color='#FFFFFF' />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.circleButton, 
                      styles.uploadButton,
                      uploadState === 'uploaded' && styles.uploadButtonSuccess
                    ]} 
                    onPress={uploadPicture}
                    disabled={uploadState === 'uploading'}
                    activeOpacity={0.8}
                  >
                    {uploadState === 'uploading' && <ActivityIndicator size="small" color="#059669" />}
                    {uploadState === 'uploaded' && <CheckCircleIcon size={32} color='#059669' weight="fill" />}
                    {uploadState === 'error' && <UploadSimpleIcon size={28} color='#EF4444' />}
                    {uploadState === 'idle' && <UploadSimpleIcon size={28} color='#059669' />}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Odometer Reading Modal */}
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
            <Text style={styles.modalTitle}>Enter Odometer Reading</Text>
            <Text style={styles.modalSubtitle}>Please enter the starting mileage shown on your dashboard</Text>
            
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0.0 km"
              placeholderTextColor={Theme.colors.text.muted}
              value={odometerReadingInput}
              onChangeText={setOdometerReadingInput}
              autoFocus
            />
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                const reading = parseInt(odometerReadingInput, 10);
                if (isNaN(reading) || reading < 0) {
                  alert("Please enter a valid number");
                  return;
                }
                setOdometerReadingStart(reading);
                setOdometerReadingModalVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  darkBackground: {
    backgroundColor: '#0F172A',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabbar: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  tabbarleft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  tabbardetails: {
    gap: 2,
  },
  welcomeText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h3,
    color: "#FFFFFF",
  },
  salesmanText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm,
    color: "rgba(255, 255, 255, 0.6)",
  },
  wifiButtonWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 4,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  permissionImage: {
    borderRadius: Theme.radius.lg,
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  permissionMessage: {
    fontFamily: Theme.typography.fontFamily.medium,
    textAlign: 'center',
    fontSize: Theme.typography.sizes.body,
    color: '#94A3B8',
    paddingHorizontal: 30,
    lineHeight: 22,
    marginBottom: 30,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Theme.radius.md,
    ...Theme.shadows.md,
  },
  permissionButtonText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
    fontSize: Theme.typography.sizes.body,
  },
  stepIndicatorWrapper: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: Theme.colors.primary,
  },
  stepDotText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.bodySm,
    color: "rgba(255,255,255,0.5)",
  },
  stepDotTextActive: {
    color: "#FFFFFF",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Theme.colors.primary,
  },
  stepLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "84%",
    marginTop: 8,
  },
  stepLabel: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.caption,
    color: "rgba(255,255,255,0.4)",
  },
  stepLabelActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  previewBox: {
    flex: 1,
    width: '90%',
    maxHeight: 340,
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  previewBoxBorder: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  previewBoxSuccess: {
    borderWidth: 3,
    borderColor: Theme.colors.success,
  },
  camera: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusMessage: {
    fontSize: Theme.typography.sizes.body,
    fontFamily: Theme.typography.fontFamily.medium,
    marginTop: 20,
    marginBottom: 10,
  },
  statusMessageNormal: {
    color: '#94A3B8',
  },
  statusMessageSuccess: {
    color: Theme.colors.success,
  },
  actionsContainer: {
    height: 100,
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  captureButton: {
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  uploadButton: {
    backgroundColor: '#D8F9EA',
  },
  uploadButtonSuccess: {
    backgroundColor: '#D8F9EA',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Theme.radius.lg,
    ...Theme.shadows.md,
    minWidth: 200,
  },
  successButton: {
    backgroundColor: '#D8F9EA',
  },
  successButtonText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.h3,
    color: "#FFFFFF",
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
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.h1,
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    color: Theme.colors.text.primary,
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
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.h3,
  },
});
