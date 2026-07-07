import React, { useRef, useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CameraRotateIcon, CameraIcon, UploadSimpleIcon } from 'phosphor-react-native';
import { File } from 'expo-file-system';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { guessMimeType, sanitizeFileName } from '@/lib/image-upload-util/imageUploadUtil';
import { useIsOnline } from '@/hooks/useIsOnline';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { fetch } from 'expo/fetch';

interface CameraModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setImageUrl: (url: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ open, setOpen, setImageUrl }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');
  const isOnline = useIsOnline();
  const cameraRef = useRef<CameraView>(null);

  const handleTakePicture = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      if (photo?.uri) {
        // Compress the image using new chainable API
        const context = ImageManipulator.manipulate(photo.uri);
        context.resize({ width: 400 });
        const renderedImage = await context.renderAsync();
        const manipulated = await renderedImage.saveAsync({
          compress: 0.4,
          format: SaveFormat.JPEG,
        });
        setPhotoUri(manipulated.uri);
      }
    }
  };

  const handleUpload = async () => {
    if (!photoUri) return;
    if (!isOnline) {
      alert('Internet connection is required to upload the photo.');
      return;
    }

    try {
      setUploadState('uploading');
      const file = new File(photoUri);
      if (!file.exists) throw new Error('File not found.');

      const fileName = photoUri.split('/').pop() || `photo_${Date.now()}.jpg`;
      const fileType = guessMimeType(photoUri);
      const encodedFileName = sanitizeFileName(fileName);

      const presignedRes = await fetch(`${API_ROUTES.UPLOAD.PRE_SIGNED_URL}?fileName=${encodedFileName}&fileType=${fileType}`);
      if (!presignedRes.ok) throw new Error('Failed to fetch upload URL.');

      const { uploadUrl, fileUrl } = await presignedRes.json();

      const fileContent = file.base64Sync();
      const binaryString = atob(fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
          'x-amz-acl': 'public-read',
        },
        body: bytes,
      });

      if (!uploadRes.ok) throw new Error('Upload failed.');

      setImageUrl(fileUrl);
      setUploadState('uploaded');
      setOpen(false); // Auto close
      resetState(); // Clean up
    } catch (err) {
      console.error(err);
      alert('Failed to upload. Please try again.');
      setUploadState('error');
    }
  };

  const resetState = () => {
    setPhotoUri(null);
    setUploadState('idle');
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  return (
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={styles.container}>
        {!photoUri ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            enableTorch={false}
          />
        ) : (
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
        )}

        <View style={styles.actions}>
          {!photoUri ? (
            <TouchableOpacity style={styles.button} onPress={handleTakePicture}>
              <CameraIcon size={32} color="white" />
              <Text style={styles.buttonText}>Capture</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={handleRetake}>
                <CameraRotateIcon size={32} color="white" />
                <Text style={styles.buttonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleUpload}>
                {uploadState === 'uploading' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <UploadSimpleIcon size={32} color="white" />
                    <Text style={styles.buttonText}>Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  preview: { flex: 1, width: '100%' },
  actions: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: { color: 'white', fontSize: 16 },
});
