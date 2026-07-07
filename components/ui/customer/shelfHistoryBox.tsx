import { Text, View, StyleSheet, ActivityIndicator, Image } from "react-native";
import { CameraModal } from "../CameraModel";
import { useState } from "react";
import HapticPress from "../layout/HapticPress";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios/axios";
import { CreateCustomerShelfHistoryParams } from "@/shared/zod";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { Camera, CheckCircle, Warning } from "phosphor-react-native";
import { primary } from "@/constants/Colors";
import { ErrorResponse } from "@/lib/types/types";
import Toast from "react-native-toast-message";
const error = '#EF4444'; // Error color for warning icon
const success = '#10B981'; // Success color for toast messages

export default function ShelfHistoryBox({ customerId }: { customerId: string }) {
  const [shelfImageModalOpen, setShelfImageModalOpen] = useState(false);
  const [shelfImageUrl, setShelfImageUrl] = useState<string | null>(null);


  const uploadShelfHistoryMutation = useMutation({
    mutationFn: async (data: CreateCustomerShelfHistoryParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.CREATE_SHELF_HISTORY, data);
      return res.data;
    },
    onSuccess: () => {
      setShelfImageUrl(null);
      Toast.show({
        type: 'success',
        text1: 'Shelf captured',
        text2: 'The shelf image has been saved successfully',
      });
    },
    onError: (error: ErrorResponse) => {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: error.response?.data?.message || "Couldn't save the shelf image",
      });
    }
  });

  return (
    <>
      <CameraModal
        open={shelfImageModalOpen}
        setOpen={setShelfImageModalOpen}
        setImageUrl={setShelfImageUrl}
      />

      <View style={styles.container}>
        <Text style={styles.title}>Shelf Capture</Text>
        <Text style={styles.subtitle}>Document product placement and shelf organization</Text>

        <HapticPress
          style={styles.captureButton}
          onPress={() => setShelfImageModalOpen(true)}
        >
          <Camera size={24} color={primary} weight="bold" />
          <Text style={styles.captureButtonText}>
            {shelfImageUrl ? 'Retake Photo' : 'Capture Shelf'}
          </Text>
        </HapticPress>

        {shelfImageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: shelfImageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Captured Image</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Camera size={48} color="#CBD5E1" weight="light" />
            <Text style={styles.placeholderText}>No image captured yet</Text>
          </View>
        )}

        <HapticPress
          style={[
            styles.submitButton,
            !shelfImageUrl && styles.submitButtonDisabled
          ]}
          onPress={() => {
            if (!shelfImageUrl) return;
            uploadShelfHistoryMutation.mutate({
              customerId,
              shelfUrl: shelfImageUrl
            });
          }}
          loading={!shelfImageUrl || uploadShelfHistoryMutation.isPending}
        >
          {uploadShelfHistoryMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <CheckCircle size={20} color="#FFF" weight="bold" />
              <Text style={styles.submitButtonText}>Save Shelf Image</Text>
            </>
          )}
        </HapticPress>

        {!shelfImageUrl && (
          <View style={styles.hintBox}>
            <Warning size={20} color={error} />
            <Text style={styles.hintText}>
              Please capture a shelf image before submitting
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  captureButtonText: {
    color: primary,
    fontWeight: '600',
    fontSize: 15,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    height: 180,
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  imageOverlayText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  placeholder: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  hintText: {
    color: error,
    fontSize: 13,
    flex: 1,
  },
});