import { Text, View, StyleSheet } from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { primary } from "@/constants/Colors";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  id: string;
  product: {
    name: string;
    productImg: string;
  };
}

interface Order {
  id: string;
  createdAt: Date;
  totalPrice: number;
  items: OrderItem[];
  approved: boolean;
}

interface OrderBoxProps {
  orders: Order[];
}

export default function OrderBox({ orders }: OrderBoxProps) {

  // Calculate insights
  const totalOrders = orders.length;
  const approvedOrders = orders.filter(order => order.approved).length;
  const pendingOrders = totalOrders - approvedOrders;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  // Get most recent order date
  const mostRecentOrderDate = orders.length > 0
    ? new Date(Math.max(...orders.map(o => new Date(o.createdAt).getTime())))
    : null;

  const mostRecentOrderText = mostRecentOrderDate
    ? format(mostRecentOrderDate, 'MMM d, yyyy')
    : 'No orders yet';

  // Calculate frequency (simple version - orders per month)
  // Avoid division by zero or negative time ranges
  let frequencyText = 'New customer';
  if (orders.length > 1) {
    const firstOrder = new Date(orders[0].createdAt);
    const lastOrder = new Date(orders[orders.length - 1].createdAt);
    const monthsDiff = (lastOrder.getFullYear() - firstOrder.getFullYear()) * 12 + (lastOrder.getMonth() - firstOrder.getMonth());

    // If less than a month, just show total orders
    if (monthsDiff < 1) {
      frequencyText = `${orders.length} orders total`;
    } else {
      const freq = (orders.length / monthsDiff).toFixed(1);
      frequencyText = `${freq} orders/month`;
    }
  }

  const InsightItem = ({ icon, color, bg, title, value, subtitle }: any) => (
    <View style={styles.insightRow}>
      <View style={[styles.iconContainer, { backgroundColor: bg }]}>
        {icon}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.insightValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {/* Spending Power */}
        <InsightItem
          icon={<Feather name="dollar-sign" size={18} color="#9C27B0" />}
          bg="#F3E5F5"
          color="#9C27B0"
          title="Lifetime Value"
          subtitle="Total spent across all orders"
          value={`₦${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />

        {/* Activity */}
        <InsightItem
          icon={<Feather name="calendar" size={18} color="#FB8C00" />}
          bg="#FFF3E0"
          color="#FB8C00"
          title="Last Activity"
          subtitle="Date of most recent order"
          value={mostRecentOrderText}
        />

        {/* Frequency */}
        <InsightItem
          icon={<Ionicons name="time-outline" size={18} color="#00ACC1" />}
          bg="#E0F7FA"
          color="#00ACC1"
          title="Ordering Frequency"
          subtitle="Average purchase rate"
          value={frequencyText}
        />

        {/* Order Health */}
        <InsightItem
          icon={<Feather name="package" size={18} color="#2196F3" />}
          bg="#E3F2FD"
          color="#2196F3"
          title="Order Health"
          subtitle={`${approvedOrders} Delivered • ${pendingOrders} Pending`}
          value={`${totalOrders} Total`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  listContainer: {
    gap: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 2,
  },
  insightSubtitle: {
    fontSize: 10,
    color: '#718096',
  },
  valueContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  insightValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A202C',
  },
});