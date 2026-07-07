import React, { useEffect, useState } from "react";
import TabBar from "@/components/ui/layout/TabBar";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { secondary } from "@/constants/Colors";
import StepWizard, { Step } from "@/components/ui/customer/StepWizard";
import {
  ShelfCaptureStep,
  StockTakeStep,
  OrderStep,
  SummaryStep,
  OrderItem,
} from "@/components/ui/customer/steps";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/axios";
import { API_ROUTES } from "@/constants/ApiRoutes";
import { CheckoutVisitedLocationParams } from "@/shared/zod";
import { getLocation } from "@/lib/location/location";
import { ErrorResponse } from "@/lib/types/types";
import { responseErrorHandler } from "@/lib/axios/responseErrorHandler";

const INITIAL_STEPS: Step[] = [
  {
    id: 1,
    title: "Shelf",
    description: "Capture shelf image to document product placement",
    mandatory: true,
    completed: false,
  },
  {
    id: 2,
    title: "Stock",
    description: "Enter the closing stock count for products",
    mandatory: true,
    completed: false,
  },
  {
    id: 3,
    title: "Order",
    description: "Create an order for the customer (optional)",
    mandatory: false,
    completed: false,
  },
  {
    id: 4,
    title: "Summary",
    description: "Review completed steps and checkout",
    mandatory: false,
    completed: false,
  },
];

export default function CustomerAction() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: isVisitedData, isLoading: isVisitedLoading } = useQuery({
    queryKey: ["isVisited", id],
    queryFn: async () => {
      const res = await api.get<{
        data: {
          visited: boolean;
        }
      }>(API_ROUTES.CUSTOMER.IS_VISITED_LOCATION(id as string));
      return res.data;
    }
  });

  useEffect(() => {
    if (isVisitedData?.data.visited) {
      router.replace(`/screens/route/order?id=${encodeURIComponent(id as string)}`);
    }
  }, [isVisitedData?.data.visited, router, id]);

  const checkoutCustomerMutation = useMutation({
    mutationFn: async (data: CheckoutVisitedLocationParams) => {
      const res = await api.post(API_ROUTES.CUSTOMER.CHECKOUT_VISITED_LOCATION, data);
      return res.data;
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Visit Complete",
        text2: "All tasks have been saved successfully",
      });

      router.replace("/(tabs)");
    },
    onError: (error: ErrorResponse) => {
      responseErrorHandler(error);
    }
  })

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  // Step 1: Shelf capture data
  const [shelfImageUrl, setShelfImageUrl] = useState<string | null>(null);

  // Step 2: Stock take data
  const [stockData, setStockData] = useState<Record<string, number>>({});

  // Step 3: Order data
  const [orderData, setOrderData] = useState<OrderItem[]>([]);

  const updateStepCompletion = (stepId: number, completed: boolean) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed } : step
      )
    );
  };

  // Step 1 handlers
  const handleShelfComplete = (url: string) => {
    setShelfImageUrl(url);
    updateStepCompletion(1, true);
    setCurrentStep(2);
  };

  // Step 2 handlers
  const handleStockComplete = (data: Record<string, number>) => {
    setStockData(data);
    updateStepCompletion(2, true);
    setCurrentStep(3);
  };

  // Step 3 handlers
  const handleOrderComplete = (data: OrderItem[]) => {
    setOrderData(data);
    updateStepCompletion(3, true);
    setCurrentStep(4);
  };

  const handleOrderSkip = () => {
    // Don't clear orderData if orders were placed during this visit
    // Only mark as not completed if no orders were placed
    updateStepCompletion(3, orderData.length > 0);
    setCurrentStep(4);
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Checkout handler
  const handleCheckout = async () => {
    const location = await getLocation();
    if (!location) {
      alert("Unable to get location");
      return;
    }
    const { latitude, longitude } = location;

    checkoutCustomerMutation.mutate({
      customerId: id as string,
      userLatitude: latitude,
      userLongitude: longitude,
    });
  };

  const renderCurrentStep = () => {
    if (typeof id !== "string") {
      return null;
    }

    switch (currentStep) {
      case 1:
        return (
          <ShelfCaptureStep
            customerId={id}
            onComplete={handleShelfComplete}
            shelfImageUrl={shelfImageUrl}
            setShelfImageUrl={setShelfImageUrl}
          />
        );
      case 2:
        return (
          <StockTakeStep
            customerId={id}
            onComplete={handleStockComplete}
            onBack={handleBack}
            stockData={stockData}
            setStockData={setStockData}
          />
        );
      case 3:
        return (
          <OrderStep
            customerId={id}
            onComplete={handleOrderComplete}
            onBack={handleBack}
            onSkip={handleOrderSkip}
            orderData={orderData}
            setOrderData={setOrderData}
          />
        );
      case 4:
        return (
          <SummaryStep
            shelfImageUrl={shelfImageUrl}
            stockData={stockData}
            orderData={orderData}
            onBack={handleBack}
            onCheckout={handleCheckout}
          />
        );
      default:
        return null;
    }
  };

  if (isVisitedLoading) {
    return (
      <SafeAreaView style={styles.pageContainer}>
        <TabBar
          title="VISIT CHECKOUT"
          customLink={{ name: "Routes", path: "/screens/route/myroute" }}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pageContainer}>
      <TabBar
        title="VISIT CHECKOUT"
        customLink={{ name: "Routes", path: "/screens/route/myroute" }}
      />

      <StepWizard steps={steps} currentStep={currentStep} />
      {/* 
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      > */}
      {renderCurrentStep()}
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: secondary,
  },
});