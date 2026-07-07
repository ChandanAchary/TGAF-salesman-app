import { DistributorSalesman } from "@/app/screens/distributor/myDistibutors";
import Avatar from "@/components/lazy/Avatar";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { MaterialIcons } from '@expo/vector-icons';
import { primary, secondary, text } from "@/constants/Colors";

export function AnimatedDistributorCard({ distributor }: { distributor: DistributorSalesman }) {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 350,
      easing: Easing.out(Easing.exp),
    });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.distributorCard,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => {
          router.push(
            `/screens/distributor/distributorActions?id=${encodeURIComponent(
              distributor.distributor.id
            )}`
          );
        }}
      >
        <View style={styles.avatarPlaceholder}>
          <Avatar
            src={distributor.distributor.avatar}
            alt={distributor.distributor.name}
            size={48}
          />
        </View>

        <View style={styles.distributorInfo}>
          <Text style={styles.distributorName}>
            {distributor.distributor.name}
          </Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={16} color={primary} />
            <Text style={styles.distributorPhone}>
              {distributor.distributor.phone}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={16} color="hotpink" />
            <Text style={styles.distributorAddress} numberOfLines={1}>
              {distributor.distributor.marketName},{" "}
              {distributor.distributor.address}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  distributorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#aaa',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  distributorInfo: {
    flex: 1,
  },
  distributorName: {
    fontSize: 14,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  distributorPhone: {
    fontSize: 12,
    color: text.secondary,
    marginLeft: 6,
  },
  distributorAddress: {
    fontSize: 12,
    color: text.secondary,
    marginLeft: 6,
    flex: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: text.secondary,
    marginTop: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: text.primary,
    paddingVertical: 16,
  },
});