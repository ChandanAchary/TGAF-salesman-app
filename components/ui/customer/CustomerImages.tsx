import { API_ROUTES } from '@/constants/ApiRoutes';
import { api } from '@/lib/axios/axios';
import { UpdateCustomerImageParams, VerifyCustomerOtpParams } from '@/shared/models/customer';
import { useMutation } from '@tanstack/react-query';
import { Camera, CheckFatIcon, WarningIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraModal } from '../CameraModel';
import { ErrorResponse } from '@/lib/types/types';
import { Theme } from '@/constants/Theme';
import ModalView from '../layout/Modal';
import { OtpInput } from '../layout/OtpInput';

interface CustomerImagesProps {
  customerId: string;
  innerImageUrl?: string;
  outerImageUrl?: string;
  refetchCustomer: () => void;
  name?: string;
  createdAt?: Date;
  isVerified: boolean;
}

type ImageViewType = 'inner' | 'outer';

const { width } = Dimensions.get('window');

export default function CustomerImages({ customerId, innerImageUrl, outerImageUrl, refetchCustomer, name, createdAt, isVerified }: CustomerImagesProps) {
  const [currentView, setCurrentView] = useState<ImageViewType>('outer');
  const [updatedInnerImageUrl, setUpdatedInnerImageUrl] = useState<string | null>(null);
  const [updatedOuterImageUrl, setUpdatedOuterImageUrl] = useState<string | null>(null);
  const [openCameraModalForInnerImage, setOpenCameraModalForInnerImage] = useState(false);
  const [openCameraModalForOuterImage, setOpenCameraModalForOuterImage] = useState(false);
  const [isOtpVerificationSent, setIsOtpVerificationSent] = useState<boolean>(false);
  const [isVerifiedCustomer, setIsVerifiedCustomer] = useState<boolean>(isVerified);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);

  const verifyCustomerMessage = useMutation({
    mutationFn: async () => {
      const res = await api.post(API_ROUTES.CUSTOMER.SEND_CUSTOMER_VERIFICATION_OTP(customerId));
      return res.data;
    },
    onSuccess: () => {
      setIsOtpVerificationSent(true);
      setOtpModalOpen(true);
    },
    onError: (error: ErrorResponse) => {
      alert(error.response.data.message);
    }
  })

  const verifyCustomerOtp = useMutation({
    mutationFn: async (data: VerifyCustomerOtpParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.VERIFY_CUSTOMER_OTP, data);
      return res.data;
    },
    onSuccess: () => {
      setIsVerifiedCustomer(true);
      setOtpModalOpen(false);
    },
    onError: (error: ErrorResponse) => {
      alert(error.response.data.message);
    }
  })

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

  const handleVerification = () => {
    verifyCustomerMessage.mutate();
  }

  const handleVerifyOtp = () => {
    if (otp) {
      verifyCustomerOtp.mutate({ customerId, otp });
    }
  }

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

      <ModalView
        isReceiveModalVisible={otpModalOpen}
        setIsReceiveModalVisible={setOtpModalOpen}
      >
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 16, fontFamily: Theme.typography.fontFamily.bold }}>Enter Otp</Text>
          <OtpInput setOtp={setOtp} />
          <TouchableOpacity
            style={{ backgroundColor: Theme.colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' }}
            onPress={handleVerifyOtp}
            disabled={verifyCustomerOtp.isPending}
          >
            {verifyCustomerOtp.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '600', fontFamily: Theme.typography.fontFamily.medium }}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </ModalView>

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

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {
              isVerifiedCustomer ?
                (
                  <View style={{ ...styles.cameraButton, backgroundColor: 'rgba(120, 255, 154, 0.5)' }}>
                    <CheckFatIcon size={22} color="white" weight="fill" />
                  </View>
                )
                :
                (
                  <TouchableOpacity style={{ ...styles.cameraButton, backgroundColor: 'red', borderColor: "red" }} onPress={handleVerification} disabled={verifyCustomerMessage.isPending}>
                    {verifyCustomerMessage.isPending ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <WarningIcon size={22} color="pink" weight='bold' />
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>verify</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )
            }
            <TouchableOpacity style={styles.cameraButton} onPress={handleCameraOpen}>
              <Camera size={22} color="white" weight="fill" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View >
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
