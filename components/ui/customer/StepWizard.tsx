import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Check } from 'phosphor-react-native';
import { Theme } from '@/constants/Theme';

const { width } = Dimensions.get('window');

export interface Step {
  id: number;
  title: string;
  description: string;
  mandatory: boolean;
  completed: boolean;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
}

export default function StepWizard({ steps, currentStep }: StepWizardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.completed;
          const isPast = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    (isCompleted || isPast) && styles.stepCircleCompleted,
                  ]}
                >
                  {isCompleted || isPast ? (
                    <Check size={14} color="#FFF" weight="bold" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isActive && styles.stepNumberActive,
                      ]}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    (isCompleted || isPast) && styles.stepLabelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {step.title}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    (isCompleted || isPast) && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    maxWidth: (width - 80) / 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCircleCompleted: {
    backgroundColor: Theme.colors.success,
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily.medium,
  },
  stepLabelActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  stepLabelCompleted: {
    color: Theme.colors.success,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
    marginBottom: 18,
  },
  connectorCompleted: {
    backgroundColor: Theme.colors.success,
  },
  currentStepInfo: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  currentStepTitle: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: '#111827',
    marginBottom: 4,
  },
  currentStepDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily.regular,
  },
  mandatoryBadge: {
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mandatoryText: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: '#D97706',
  },
});
