import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated,
  Easing
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { primary } from "@/constants/Colors";
import { useEffect, useRef } from "react";
import Avatar from "@/components/lazy/Avatar";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 220;
const TOP_CARD_HEIGHT = 180;

interface LeaderBoard {
  salesmanId: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  points: number;
  salesman: {
    name: string;
    phone: string;
    id: string;
    avatar: string | null;
    salesmanType: string;
  };
}

interface LeaderBoardData {
  success: boolean;
  message: string;
  data: {
    leaderboard: LeaderBoard[];
    myRank: {
      id: string;
      name: string;
      phone: string;
      avatar: string | null;
      salesmanType: string;
      rank: number | null;
      points: number;
    } | null;
  };
}

export default function LeaderBoardSection({ refreshing }: { refreshing: boolean }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const leaderBoardQuery = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await api.get<LeaderBoardData>(
        API_ROUTES.ATTENDENCE.GET_MY_LEADERBOARD
      );
      return res.data;
    },
  });

  useEffect(() => {
    if (refreshing) {
      // Add animation when refreshing
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
      ]).start();

      leaderBoardQuery.refetch();
    }
  }, [refreshing]);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });

  if (leaderBoardQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (leaderBoardQuery.isError || !leaderBoardQuery.data) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>Failed to load leaderboard</Text>
      </View>
    );
  }

  const { leaderboard, myRank } = leaderBoardQuery.data.data;

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FontAwesome6 name="crown" size={24} color="#FFD700" />;
      case 2:
        return <FontAwesome6 name="medal" size={24} color="#C0C0C0" />;
      case 3:
        return <FontAwesome6 name="medal" size={24} color="#CD7F32" />;
      default:
        return <Text style={styles.rankText}>{rank}</Text>;
    }
  };

  const renderTopThree = () => {
    const topThree = leaderboard.slice(0, 3);

    return (
      <Animated.View style={[styles.topThreeContainer, { transform: [{ scale: scaleValue }] }]}>
        {/* Second place */}
        {topThree[1] && (
          <LinearGradient
            colors={['#f5f7fa', '#e4e8ed']}
            style={[styles.topThreeItem, styles.secondPlace]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.rankBadge}>
              {getMedalIcon(2)}
            </View>
            <View style={styles.avatarContainer}>
              <Avatar
                src={topThree[1].salesman.avatar}
                alt={topThree[1].salesman.name}
                size={64}
                textStyle={{ fontSize: 24, fontWeight: 'bold' }}
              />
            </View>
            <Text style={styles.topThreeName} numberOfLines={1}>
              {topThree[1].salesman.name}
            </Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{topThree[1].points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          </LinearGradient>
        )}

        {/* First place */}
        {topThree[0] && (
          <LinearGradient
            colors={['#f9e4b7', '#f5d78e']}
            style={[styles.topThreeItem, styles.firstPlace]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.crownContainer}>
              <FontAwesome6 name="crown" size={28} color="#FFD700" />
            </View>
            <View style={[styles.rankBadge, { backgroundColor: "rgba(255,255,255,0.7)" }]}>
              {getMedalIcon(1)}
            </View>
            <View style={[styles.avatarContainer, styles.firstPlaceAvatarContainer]}>
              <Avatar
                src={topThree[0].salesman.avatar}
                alt={topThree[0].salesman.name}
                size={74}
                textStyle={{ fontSize: 28, fontWeight: 'bold' }}
              />
            </View>
            <Text style={[styles.topThreeName, styles.firstPlaceName]} numberOfLines={1}>
              {topThree[0].salesman.name}
            </Text>
            <View style={[styles.pointsBadge, styles.firstPlacePoints]}>
              <Text style={styles.pointsText}>{topThree[0].points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          </LinearGradient>
        )}

        {/* Third place */}
        {topThree[2] && (
          <LinearGradient
            colors={['#f5f0e6', '#e8d9c5']}
            style={[styles.topThreeItem, styles.thirdPlace]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.rankBadge}>
              {getMedalIcon(3)}
            </View>
            <View style={styles.avatarContainer}>
              <Avatar
                src={topThree[2].salesman.avatar}
                alt={topThree[2].salesman.name}
                size={64}
                textStyle={{ fontSize: 24, fontWeight: 'bold' }}
              />
            </View>
            <Text style={styles.topThreeName} numberOfLines={1}>
              {topThree[2].salesman.name}
            </Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{topThree[2].points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          </LinearGradient>
        )}
      </Animated.View>
    );
  };

  const renderOtherRankings = () => {
    const others = leaderboard.slice(3);
    return (
      <View style={styles.otherRankingsContainer}>
        <View style={styles.rankingList}>
          {others.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.rankingItem,
                index % 2 === 0 ? styles.rankingItemEven : styles.rankingItemOdd,
                {
                  opacity: scrollY.interpolate({
                    inputRange: [0, 100, 200],
                    outputRange: [1, 1, 0.9],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      scale: scrollY.interpolate({
                        inputRange: [-50, 0, 50, 100],
                        outputRange: [1.05, 1, 0.98, 0.95],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.rankContainer}>
                <Text style={styles.rankingPosition}>{index + 4}</Text>
              </View>
              <View style={styles.rankingAvatar}>
                <Avatar
                  src={item.salesman.avatar}
                  size={44}
                  alt={item.salesman.name}
                />
              </View>
              <View style={styles.rankingInfo}>
                <Text style={styles.rankingName}>{item.salesman.name}</Text>
                <Text style={styles.rankingType}>{item.salesman.salesmanType}</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{item.points}</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  const renderMyRank = () => {
    if (!myRank) return null;
    return (
      <Animated.View
        style={[
          styles.myRankContainer,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >

        <View style={[styles.rankingItem, styles.myRankItem]}>
          <View style={styles.rankContainer}>
            <Text style={[styles.rankingPosition, styles.myRankPosition]}>
              {myRank.rank ?? "--"}
            </Text>
          </View>
          <View style={[styles.rankingAvatar, styles.myRankAvatar]}>
            <Avatar
              src={myRank.avatar}
              size={44}
              alt={myRank.name}
            />
          </View>
          <View style={styles.rankingInfo}>
            <Text style={[styles.rankingName, styles.myRankName]}>{myRank.name}</Text>
            <Text style={styles.rankingType}>{myRank.salesmanType}</Text>
          </View>
          <View style={[styles.pointsBadge, styles.myRankPoints]}>
            <Text style={[styles.pointsText, styles.myRankPointsText]}>{myRank.points}</Text>
            <Text style={[styles.pointsLabel, styles.myRankPointsLabel]}>pts</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top performers this month</Text>
        </View>
        {renderTopThree()}
        {renderMyRank()}
        {renderOtherRankings()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scrollContainer: {
    paddingTop: HEADER_HEIGHT,
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    marginTop: 10,
    color: '#FF6B6B',
    fontFamily: 'Inter-Medium',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerBackground: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'black',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.9)',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 20,
  },
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'flex-end',
    marginBottom: 32,
    marginTop: 20,
  },
  topThreeItem: {
    alignItems: "center",
    width: (width - 64) / 3,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 4,
    height: TOP_CARD_HEIGHT,
    justifyContent: 'space-between',
  },
  firstPlace: {
    height: TOP_CARD_HEIGHT + 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
  },
  secondPlace: {
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  thirdPlace: {
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'Inter-Bold',
  },
  crownContainer: {
    position: 'absolute',
    top: -20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  firstPlaceAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#FFD700',
  },
  topThreeName: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  firstPlaceName: {
    fontWeight: '700',
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },
  pointsBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  firstPlacePoints: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderColor: 'rgba(255,215,0,0.3)',
  },
  pointsText: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 2,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  pointsLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    fontFamily: 'Inter-Medium',
  },
  otherRankingsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 12,
    color: '#2c3e50',
    fontFamily: 'Inter-Bold',
  },
  rankingList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#deffea',
  },
  rankingItemEven: {
    backgroundColor: '#fff',
  },
  rankingItemOdd: {
    backgroundColor: '#f8f9fa',
  },
  myRankContainer: {
    marginBottom: 24,
  },
  myRankTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  myRankItem: {
    borderRadius: 12,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  rankingPosition: {
    fontSize: 16,
    fontWeight: "600",
    color: '#7f8c8d',
    fontFamily: 'Inter-SemiBold',
  },
  myRankPosition: {
    color: '#1976d2',
    fontWeight: '700',
  },
  rankingAvatar: {
    borderRadius: 999,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  myRankAvatar: {
    borderColor: '#90caf9',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontWeight: "600",
    color: '#2c3e50',
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  myRankName: {
    color: 'green',
  },
  rankingType: {
    color: "#7f8c8d",
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  myRankPoints: {
    backgroundColor: 'lightgreen',
  },
  myRankPointsText: {
    color: 'green',
  },
  myRankPointsLabel: {
    color: 'green',
  },
});