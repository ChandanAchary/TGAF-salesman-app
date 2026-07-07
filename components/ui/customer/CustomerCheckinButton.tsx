import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { primary } from '@/constants/Colors';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { api } from '@/lib/axios/axios';
import { getLocation } from '@/lib/location/location';
import { AddToVisitedLocationParams } from '@/shared/zod';
import { ErrorResponse } from '@/lib/types/types';
import ClickOnce from '@/components/ui/layout/ClickOnceButton';
import { MapPinAreaIcon } from 'phosphor-react-native';
import { responseErrorHandler } from '@/lib/axios/responseErrorHandler';

interface CustomerCheckinButtonProps {
  customerId: string;
}

export default function CustomerCheckinButton({ customerId }: CustomerCheckinButtonProps) {
  const router = useRouter();
  const [checkinLoading, setCheckinLoading] = useState(false);

  const visitCustomerMutation = useMutation({
    mutationFn: async (data: AddToVisitedLocationParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.ADD_VISITED_LOCATION, data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        router.push(`/screens/route/customerAction?id=${encodeURIComponent(customerId)}`);
        setCheckinLoading(false);
      }
    },
    onError: (error: ErrorResponse) => {
      responseErrorHandler(error);
      setCheckinLoading(false);
    }
  });

  const handleVisitClick = async () => {
    try {
      setCheckinLoading(true);
      const location = await getLocation();

      if (!location) {
        Alert.alert("Location Error", "Could not get user location.");
        setCheckinLoading(false);
        return;
      }

      const { latitude: userLatitude, longitude: userLongitude } = location;

      const data: AddToVisitedLocationParams = {
        customerId,
        userLatitude,
        userLongitude,
      };
      visitCustomerMutation.mutate(data);
    } catch (e) {
      console.error("Error during check-in:", e);
      Alert.alert("Error", "Something went wrong while trying to check in.");
      setCheckinLoading(false);
    }
  };

  return (
    <ClickOnce isLoading={checkinLoading}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleVisitClick}
        activeOpacity={0.8}
      >
        <MapPinAreaIcon size={18} color="white" weight="fill" />
        <Text style={styles.buttonText}>Check In at Location</Text>
      </TouchableOpacity>
    </ClickOnce>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: primary,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
  },
});
