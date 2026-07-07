import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Camera, CheckCircle, ArrowRight, Warning } from 'phosphor-react-native';
import { useMutation } from '@tanstack/react-query';
import { CameraModal } from '../../CameraModel';
import { api } from '@/lib/axios/axios';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { CreateCustomerShelfHistoryParams } from '@/shared/zod';
import { primary } from '@/constants/Colors';
import { ErrorResponse } from '@/lib/types/types';
import Toast from 'react-native-toast-message';

interface ShelfCaptureStepProps {
  customerId: string;
  onComplete: (shelfUrl: string) => void;
  shelfImageUrl: string | null;
  setShelfImageUrl: (url: string | null) => void;
}

export default function ShelfCaptureStep({
  customerId,
  onComplete,
  shelfImageUrl,
  setShelfImageUrl,
}: ShelfCaptureStepProps) {
  const [cameraOpen, setCameraOpen] = useState(false);

  const uploadShelfHistoryMutation = useMutation({
    mutationFn: async (data: CreateCustomerShelfHistoryParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.CREATE_SHELF_HISTORY, data);
      return res.data;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Shelf captured',
        text2: 'The shelf image has been saved successfully',
      });
      if (shelfImageUrl) {
        onComplete(shelfImageUrl);
      }
    },
    onError: (error: ErrorResponse) => {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: error.response?.data?.message || "Couldn't save the shelf image",
      });
    },
  });

  const handleContinue = () => {
    if (!shelfImageUrl) return;
    uploadShelfHistoryMutation.mutate({
      customerId,
      shelfUrl: shelfImageUrl,
    });
  };

  return (
    <>
      <CameraModal
        open={cameraOpen}
        setOpen={setCameraOpen}
        setImageUrl={setShelfImageUrl}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Camera size={24} color={primary} weight="duotone" />
          </View>
          <Text style={styles.title}>Capture Shelf Image</Text>
          <Text style={styles.subtitle}>
            Take a photo of the product shelf in the store
          </Text>
        </View>

        {shelfImageUrl ? (
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: shelfImageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <CheckCircle size={20} color="#FFF" weight="fill" />
                <Text style={styles.imageOverlayText}>Image Captured</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setCameraOpen(true)}
            >
              <Camera size={18} color={primary} />
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.captureArea}
            onPress={() => setCameraOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.captureIconContainer}>
              <Camera size={48} color="#CBD5E1" weight="light" />
            </View>
            <Text style={styles.captureText}>Tap to open camera</Text>
            <Text style={styles.captureHint}>Position the shelf in frame and capture</Text>
          </TouchableOpacity>
        )}

        {!shelfImageUrl && (
          <View style={styles.warningBox}>
            <Warning size={20} color="#D97706" />
            <Text style={styles.warningText}>
              You must capture a shelf image to continue
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.continueButton,
            !shelfImageUrl && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!shelfImageUrl || uploadShelfHistoryMutation.isPending}
        >
          {uploadShelfHistoryMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                Save & Continue
              </Text>
              <ArrowRight size={20} color="#FFF" weight="bold" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 32,
    backgroundColor: `${primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  imageSection: {
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 6,
  },
  imageOverlayText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: primary,
    backgroundColor: `${primary}08`,
  },
  retakeButtonText: {
    color: primary,
    fontSize: 14,
    fontWeight: '600',
  },
  captureArea: {
    height: 220,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  captureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  captureHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
