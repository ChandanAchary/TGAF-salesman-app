import React, { useRef, useState, useEffect } from "react";
import { View, ScrollView, Dimensions, StyleSheet } from "react-native";
import { usePathname, router } from "expo-router";
import HomeScreen from "./index";
import DashboardScreen from "./dashboard";
import StoreScreen from "./store";
import ReportsScreen from "./reports";
import MenuScreen from "./menu";
import CustomBottomBar from "@/components/ui/layout/CustomBottomBar";
import { useAppTheme } from "@/constants/Theme";
import { useUserStore } from "@/store";

const { width } = Dimensions.get("window");

export default function TabLayout() {
  const { colors } = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const pathname = usePathname();
  const rawRole = useUserStore((state) => state.salesmanType);
  const isExecutive = rawRole === "CITYHEAD" || rawRole === "FIELDEXECUTIVE";
  const scrollEnabled = useUserStore((state) => state.scrollEnabled ?? true);

  const getIndexFromPathname = (path: string) => {
    if (isExecutive) {
      if (path.includes("/dashboard")) return 1;
      if (path.includes("/store")) return 2;
      if (path.includes("/reports")) return 3;
      if (path.includes("/menu")) return 4;
      return 0;
    } else {
      if (path.includes("/store")) return 1;
      if (path.includes("/reports")) return 2;
      if (path.includes("/menu")) return 3;
      return 0;
    }
  };

  const activeIndex = useUserStore((state) => state.activeTabIndex ?? 0);
  const setActiveIndex = useUserStore((state) => state.setActiveTabIndex);

  const screens = isExecutive ? [
    { component: <HomeScreen /> },
    { component: <DashboardScreen /> },
    { component: <StoreScreen /> },
    { component: <ReportsScreen /> },
    { component: <MenuScreen /> }
  ] : [
    { component: <HomeScreen /> },
    { component: <StoreScreen /> },
    { component: <ReportsScreen /> },
    { component: <MenuScreen /> }
  ];

  const isFirstRender = useRef(true);

  useEffect(() => {
    const targetIndex = getIndexFromPathname(pathname);
    if (targetIndex !== activeIndex) {
      setActiveIndex?.(targetIndex);
    }
  }, [pathname]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Snap instantly on first mount
      scrollViewRef.current?.scrollTo({ x: activeIndex * width, animated: false });
    } else {
      // Smooth slide animation on tab changes
      scrollViewRef.current?.scrollTo({ x: activeIndex * width, animated: true });
    }
  }, [activeIndex]);

  const handlePageChange = (index: number) => {
    setActiveIndex?.(index);
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    if (index !== activeIndex && index >= 0 && index < screens.length) {
      setActiveIndex?.(index);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        bounces={false}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollTo({ x: activeIndex * width, animated: false });
        }}
        onLayout={() => {
          scrollViewRef.current?.scrollTo({ x: activeIndex * width, animated: false });
        }}
      >
        {screens.map((screen, index) => (
          <View key={index} style={styles.screenWrapper}>
            {screen.component}
          </View>
        ))}
      </ScrollView>
      
      <CustomBottomBar 
        activeIndex={activeIndex} 
        onTabPress={handlePageChange} 
        isExecutive={isExecutive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  screenWrapper: {
    width: width,
    height: "100%",
  },
});
