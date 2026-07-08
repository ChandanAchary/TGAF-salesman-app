import { API_ROUTES } from '@/constants/ApiRoutes';
import { api } from '@/lib/axios/axios';
import { UpdateCustomerImageParams } from '@/shared/models/customer';
import { useMutation } from '@tanstack/react-query';
import { Camera, CaretLeft, CaretRight, Image as ImageIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraModal } from '../CameraModel';
import { ErrorResponse } from '@/lib/types/types';
import { Theme } from '@/constants/Theme';

interface CustomerImagesProps {
  customerId: string;
  innerImageUrl?: string;
  outerImageUrl?: string;
  refetchCustomer: () => void;
  name?: string;
  createdAt?: Date;
}

type ImageViewType = 'inner' | 'outer';

const { width } = Dimensions.get('window');

export default function CustomerImages({ customerId, innerImageUrl, outerImageUrl, refetchCustomer, name, createdAt }: CustomerImagesProps) {
  const [currentView, setCurrentView] = useState<ImageViewType>('outer');
  const [updatedInnerImageUrl, setUpdatedInnerImageUrl] = useState<string | null>(null);
  const [updatedOuterImageUrl, setUpdatedOuterImageUrl] = useState<string | null>(null);
  const [openCameraModalForInnerImage, setOpenCameraModalForInnerImage] = useState(false);
  const [openCameraModalForOuterImage, setOpenCameraModalForOuterImage] = useState(false);

  const updateCustomerImageMutation = useMutation({
    mutationFn: async (data: UpdateCustomerImageParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.UPDATE_CUSTOMER_IMAGE, data);
      return res.data;
    },
    onSuccess: () => {
      refetchCustomer();
    },
    onError: (error: ErrorResponse) => {
      console.log("Error updating customer image", error);
      alert(error.response.data.message);
    }
  });

  useEffect(() => {
    if (updatedInnerImageUrl) {
      updateCustomerImageMutation.mutate({
        customerId,
        innerImageUrl: updatedInnerImageUrl
      });
      setUpdatedInnerImageUrl(null);
    }
  }, [updatedInnerImageUrl]);

  useEffect(() => {
    if (updatedOuterImageUrl) {
      updateCustomerImageMutation.mutate({
        customerId,
        outerImageUrl: updatedOuterImageUrl
      });
      setUpdatedOuterImageUrl(null);
    }
  }, [updatedOuterImageUrl]);


  const handlePrev = () => setCurrentView('outer');
  const handleNext = () => setCurrentView('inner');

  const currentImage = currentView === 'inner' ? (updatedInnerImageUrl || innerImageUrl) : (updatedOuterImageUrl || outerImageUrl);
  const title = currentView === 'inner' ? 'Store Interior' : 'Store Exterior';

  const handleCameraOpen = () => {
    if (currentView === 'inner') {
      setOpenCameraModalForInnerImage(true);
    } else {
      setOpenCameraModalForOuterImage(true);
    }
  };

  return (
    <View style={styles.container}>
      <CameraModal
        open={openCameraModalForInnerImage}
        setOpen={setOpenCameraModalForInnerImage}
        setImageUrl={(url) => setUpdatedInnerImageUrl(url)}
      />
      <CameraModal
        open={openCameraModalForOuterImage}
        setOpen={setOpenCameraModalForOuterImage}
        setImageUrl={(url) => setUpdatedOuterImageUrl(url)}
      />

      <View style={styles.imageContainer}>
        {currentImage ? (
          <>
            <Image source={{ uri: currentImage }} style={styles.image} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradientOverlay}
            />
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateGradient} />
          </View>
        )}

        <View style={styles.controlsContainer}>
          <View style={styles.navigationWrapper}>
            <View style={styles.dotsContainer}>
              <TouchableOpacity onPress={() => setCurrentView('outer')} style={[styles.dot, currentView === 'outer' && styles.activeDot]} />
              <TouchableOpacity onPress={() => setCurrentView('inner')} style={[styles.dot, currentView === 'inner' && styles.activeDot]} />
            </View>
            <View style={styles.imageTitleContainer}>
              <Text style={styles.imageTitle}>{name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.imageDateText}>{title}</Text>
                <View style={{ width: 1, height: 12, backgroundColor: '#fff' }} />
                <Text style={styles.imageDateText}>Since {createdAt ? new Date(createdAt).getFullYear() : 'N/A'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.cameraButton} onPress={handleCameraOpen}>
            <Camera size={22} color="white" weight="fill" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: width,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  imageTitleContainer: {
    gap: 2,
  },
  imageDateText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: Theme.typography.fontFamily.medium,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyStateContainer: {
    flex: 1,
  },
  emptyStateGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'black',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  navigationWrapper: {
    gap: 8,
  },
  imageTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 24,
    height: 6,
    borderRadius: 3,
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
  },
});
