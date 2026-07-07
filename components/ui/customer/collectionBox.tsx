import { Text, View, StyleSheet } from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

interface CollectionHistory {
  id: string;
  paid: number;
  debt: number;
  createdAt: Date;
}

interface Collection {
  id: string;
  createdAt: Date;
  totaldebt: number;
  totalpaid: number;
  CustomerCollectionHistory: CollectionHistory[];
}

interface CollectionBoxProps {
  collections: Collection[];
}

export default function CollectionBox({ collections }: CollectionBoxProps) {

  // Calculate insights
  const totalPaid = collections.reduce((sum, collection) => sum + collection.totalpaid, 0);
  const totalDebt = collections.reduce((sum, collection) => sum + collection.totaldebt, 0);
  const remainingDebt = totalDebt - totalPaid;
  const paymentCompletion = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 100;

  // Get payment history details
  const paymentHistory = collections.flatMap(c => c.CustomerCollectionHistory);
  const totalPayments = paymentHistory.length;

  const lastPaymentDate = paymentHistory.length > 0
    ? new Date(Math.max(...paymentHistory.map(p => new Date(p.createdAt).getTime())))
    : null;

  const lastPaymentText = lastPaymentDate
    ? format(lastPaymentDate, 'MMM d, yyyy')
    : 'No payments yet';

  // Calculate average payment amount
  const avgPayment = totalPayments > 0 ? totalPaid / totalPayments : 0;

  // Calculate payment reliability score (0-100)
  // Based on: payment completion %, number of payments, and consistency
  let reliabilityScore = 0;
  if (totalPayments > 0) {
    const completionWeight = paymentCompletion * 0.6; // 60% weight
    const frequencyWeight = Math.min(totalPayments * 5, 30); // Up to 30% for frequency
    const consistencyWeight = avgPayment > 0 ? 10 : 0; // 10% for having payments
    reliabilityScore = Math.min(completionWeight + frequencyWeight + consistencyWeight, 100);
  }

  // Determine payment health status
  const onTimePayments = paymentHistory.filter(p => p.paid > 0).length;
  const missedPayments = totalPayments - onTimePayments;

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
        {/* Total Collections */}
        <InsightItem
          icon={<Feather name="dollar-sign" size={18} color="#4CAF50" />}
          bg="#E8F5E9"
          color="#4CAF50"
          title="Total Collected"
          subtitle="Amount received from customer"
          value={`₦${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />

        {/* Outstanding Balance */}
        <InsightItem
          icon={<MaterialIcons name="money-off" size={18} color="#F44336" />}
          bg="#FFEBEE"
          color="#F44336"
          title="Outstanding Balance"
          subtitle="Remaining debt to collect"
          value={`₦${remainingDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />

        {/* Last Payment */}
        <InsightItem
          icon={<Feather name="calendar" size={18} color="#FB8C00" />}
          bg="#FFF3E0"
          color="#FB8C00"
          title="Last Payment"
          subtitle={`₦${paymentHistory.length > 0 ? paymentHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].paid.toFixed(2) : '0.00'}`}
          value={lastPaymentText}
        />

        {/* Payment Health */}
        <InsightItem
          icon={<Ionicons name="shield-checkmark-outline" size={18} color="#2196F3" />}
          bg="#E3F2FD"
          color="#2196F3"
          title="Payment Health"
          subtitle={`${onTimePayments} Completed • ${missedPayments} Pending`}
          value={`${paymentCompletion.toFixed(0)}% Paid`}
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