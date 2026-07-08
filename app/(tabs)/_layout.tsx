import React, { useRef, useState, useEffect } from "react";
import { View, ScrollView, Dimensions, StyleSheet } from "react-native";
import { usePathname, router } from "expo-router";
import HomeScreen from "./index";
import StoreScreen from "./store";
import ReportsScreen from "./reports";
import MenuScreen from "./menu";
import CustomBottomBar from "@/components/ui/layout/CustomBottomBar";

const { width } = Dimensions.get("window");

export default function TabLayout() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pathname = usePathname();

  const screens = [
    { component: <HomeScreen /> },
    { component: <StoreScreen /> },
    { component: <ReportsScreen /> },
    { component: <MenuScreen /> }
  ];

  const getIndexFromPathname = (path: string) => {
    if (path.includes("/store")) return 1;
    if (path.includes("/reports")) return 2;
    if (path.includes("/menu")) return 3;
    return 0;
  };

  useEffect(() => {
    const targetIndex = getIndexFromPathname(pathname);
    if (targetIndex !== activeIndex) {
      setActiveIndex(targetIndex);
      scrollViewRef.current?.scrollTo({ x: targetIndex * width, animated: true });
    }
  }, [pathname]);

  const handlePageChange = (index: number) => {
    setActiveIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    if (index !== activeIndex && index >= 0 && index < screens.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        bounces={false}
      >
        {screens.map((screen, index) => (
          <View key={index} style={styles.screenWrapper}>
            {screen.component}
          </View>
        ))}
      </ScrollView>
      
      <CustomBottomBar activeIndex={activeIndex} onTabPress={handlePageChange} />
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
