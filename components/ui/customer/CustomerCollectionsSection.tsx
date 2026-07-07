import { ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { primary } from '@/constants/Colors';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { api } from '@/lib/axios/axios';
import CollectionBox from './collectionBox';

interface CollectionHistory {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  customerId: string;
  orderId: string;
  paid: number;
  debt: number;
  collectionId: string;
}

interface Collection {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  customerId: string;
  orderId: string;
  totaldebt: number;
  totalpaid: number;
  CustomerCollectionHistory: CollectionHistory[];
}

interface CollectionResponse {
  success: boolean;
  message: string;
  data: Collection[];
}

interface CustomerCollectionsSectionProps {
  customerId: string;
}

export default function CustomerCollectionsSection({ customerId }: CustomerCollectionsSectionProps) {
  const collectionQuery = useQuery({
    queryKey: ["collection History", customerId],
    queryFn: async () => {
      const res = await api.get<CollectionResponse>(
        API_ROUTES.CUSTOMER.GET_CUSTOMER_COLLECTION(customerId)
      );
      return res.data;
    }
  });

  if (!collectionQuery.data) {
    return <ActivityIndicator size="small" color={primary} style={styles.loading} />;
  }

  return <CollectionBox collections={collectionQuery.data.data} />;
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 20,
  },
});
