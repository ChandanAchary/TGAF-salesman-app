import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { primary } from '@/constants/Colors';
import { API_ROUTES } from '@/constants/ApiRoutes';
import { api } from '@/lib/axios/axios';
import OrderBox from './orderBox';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  orderId: string | null;
  product: {
    name: string;
    productImg: string;
  };
}

interface Order {
  customerId: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  totalPrice: number;
  items: OrderItem[];
  approved: boolean;
}

interface OrderResponse {
  success: boolean;
  message: string;
  data: Order[];
}

interface CustomerOrdersSectionProps {
  customerId: string;
}

export default function CustomerOrdersSection({ customerId }: CustomerOrdersSectionProps) {
  const orderQuery = useQuery({
    queryKey: ["orders", customerId],
    queryFn: async () => {
      const res = await api.get<OrderResponse>(
        API_ROUTES.CUSTOMER.GET_ORDERS(customerId)
      );
      return res.data;
    }
  });

  if (!orderQuery.data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={primary} />
      </View>
    );
  }

  return <OrderBox orders={orderQuery.data.data} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
