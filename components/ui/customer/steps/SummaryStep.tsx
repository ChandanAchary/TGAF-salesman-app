import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  CheckCircle,
  Camera,
  Package,
  ShoppingCart,
  House,
  ArrowLeft,
  X,
  Warning,
} from 'phosphor-react-native';
import { primary } from '@/constants/Colors';
import { formatPrice } from '@/lib/formatters/formatter';
import { OrderItem } from './OrderStep';

interface SummaryStepProps {
  shelfImageUrl: string | null;
  stockData: Record<string, number>;
  orderData: OrderItem[];
  onBack: () => void;
  onCheckout: () => void;
}

export default function SummaryStep({
  shelfImageUrl,
  stockData,
  orderData,
  onBack,
  onCheckout,
}: SummaryStepProps) {
  const hasShelfImage = !!shelfImageUrl;
  const hasStockData = Object.values(stockData).some((v) => v > 0);
  const hasOrderData = orderData.length > 0;

  const stockItemCount = Object.values(stockData).filter((v) => v > 0).length;
  const orderTotal = orderData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const orderItemCount = orderData.reduce((sum, item) => sum + item.quantity, 0);

  const steps = [
    {
      id: 1,
      title: 'Shelf Capture',
      icon: Camera,
      completed: hasShelfImage,
      mandatory: true,
      description: hasShelfImage
        ? 'Shelf image captured successfully'
        : 'No shelf image captured',
    },
    {
      id: 2,
      title: 'Stock Take',
      icon: Package,
      completed: hasStockData,
      mandatory: true,
      description: hasStockData
        ? `${stockItemCount} product${stockItemCount > 1 ? 's' : ''} updated`
        : 'No stock data entered',
    },
    {
      id: 3,
      title: 'Order',
      icon: ShoppingCart,
      completed: hasOrderData,
      mandatory: false,
      description: hasOrderData
        ? `${orderItemCount} item${orderItemCount > 1 ? 's' : ''} • ${formatPrice(orderTotal)}`
        : 'No order placed (optional)',
    },
  ];

  const allMandatoryCompleted = hasShelfImage && hasStockData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <CheckCircle size={40} color="#10B981" weight="fill" />
        </View>
        <Text style={styles.title}>Visit Summary</Text>
        <Text style={styles.subtitle}>
          Review the steps you've completed during this visit
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shelf Image Preview */}
        {hasShelfImage && (
          <View style={styles.previewSection}>
            <Image
              source={{ uri: shelfImageUrl }}
              style={styles.shelfImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Steps Summary */}
        <View style={styles.stepsContainer}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <View
                key={step.id}
                style={[
                  styles.stepCard,
                  step.completed && styles.stepCardCompleted,
                  !step.completed && step.mandatory && styles.stepCardIncomplete,
                ]}
              >
                <View
                  style={[
                    styles.stepIconContainer,
                    step.completed && styles.stepIconCompleted,
                    !step.completed && step.mandatory && styles.stepIconIncomplete,
                  ]}
                >
                  <Icon
                    size={22}
                    color={
                      step.completed
                        ? '#10B981'
                        : step.mandatory
                          ? '#EF4444'
                          : '#9CA3AF'
                    }
                    weight="duotone"
                  />
                </View>

                <View style={styles.stepInfo}>
                  <View style={styles.stepTitleRow}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    {!step.mandatory && (
                      <View style={styles.optionalBadge}>
                        <Text style={styles.optionalText}>Optional</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>

                <View style={styles.stepStatus}>
                  {step.completed ? (
                    <CheckCircle size={24} color="#10B981" weight="fill" />
                  ) : step.mandatory ? (
                    <X size={24} color="#EF4444" weight="bold" />
                  ) : (
                    <View style={styles.skippedBadge}>
                      <Text style={styles.skippedText}>Skipped</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Details */}
        {hasOrderData && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Order Details</Text>
            <View style={styles.orderList}>
              {orderData.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.orderItemName} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <View style={styles.orderItemRight}>
                    <Text style={styles.orderItemQty}>×{item.quantity}</Text>
                    <Text style={styles.orderItemPrice}>
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              ))}
              <View style={styles.orderTotal}>
                <Text style={styles.orderTotalLabel}>Total</Text>
                <Text style={styles.orderTotalAmount}>
                  {formatPrice(orderTotal)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {!allMandatoryCompleted && (
        <View style={styles.warningBox}>
          <Warning size={20} color="#D97706" />
          <Text style={styles.warningText}>
            Please complete all required steps before checkout
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={18} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            !allMandatoryCompleted && styles.checkoutButtonDisabled,
          ]}
          onPress={onCheckout}
          disabled={!allMandatoryCompleted}
        >
          <House size={20} color="#FFF" weight="fill" />
          <Text style={styles.checkoutButtonText}>Checkout & Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  stepCardCompleted: {
    borderColor: '#D1FAE5',
    backgroundColor: '#FAFFFE',
  },
  stepCardIncomplete: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconCompleted: {
    backgroundColor: '#D1FAE5',
  },
  stepIconIncomplete: {
    backgroundColor: '#FEE2E2',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  optionalBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionalText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  stepStatus: {
    marginLeft: 8,
  },
  skippedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skippedText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  previewSection: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  shelfImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  orderList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderItemName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    marginRight: 8,
  },
  orderItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderItemQty: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  orderItemPrice: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  orderTotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: primary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
