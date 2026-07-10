import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Image, StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Theme, useAppTheme } from "@/constants/Theme";
import Pfp from "@/components/lazy/Pfp";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

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

export default function Reports() {
  const [showAll, setShowAll] = useState(false);
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  const leaderBoardQuery = useQuery({
    queryKey: ["leaderboard-report"],
    queryFn: async () => {
      const res = await api.get<LeaderBoardData>(
        API_ROUTES.ATTENDENCE.GET_MY_LEADERBOARD
      );
      return res.data;
    },
  });

  if (leaderBoardQuery.isLoading || leaderBoardQuery.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (leaderBoardQuery.isError || !leaderBoardQuery.data) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color={Theme.colors.danger} />
        <Text style={styles.errorText}>Failed to load leaderboard</Text>
      </View>
    );
  }

  const { leaderboard = [], myRank = null } = leaderBoardQuery.data?.data || {};

  if (leaderboard.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="leaderboard" size={48} color={Theme.colors.primary} />
        <Text style={styles.errorText}>No leaderboard data available</Text>
      </View>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);
  const displayedList = showAll ? restOfList : restOfList.slice(0, 7);
  const hasMore = restOfList.length > 7;
  const betterThan = myRank
    ? leaderboard.filter(item => item && myRank && item.points < myRank.points).length
    : 0;

  const topImages = [
    require("@/assets/images/crown.png"),
    require("@/assets/images/diamond.png"),
    require("@/assets/images/bronze.png"),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors.background : "#0045F4" }}>
      {/* Premium deep gradient bg */}
      <LinearGradient
        colors={isDark ? [colors.background, "#1E1B4B"] : [Theme.colors.primaryDark, "#5B21B6"]}
        style={StyleSheet.absoluteFillObject}
      />
      <FlatList
        data={displayedList}
        keyExtractor={item => item?.salesman?.id || String(Math.random())}
        renderItem={({ item, index }) => (
          <View style={{ backgroundColor: colors.background, paddingHorizontal: 20, paddingVertical: 0 }}>
            <View style={[styles.rankCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 10 }]}>
              <View style={styles.rankCardLeft}>
                <Pfp
                  size={48}
                  src={item?.salesman?.avatar}
                  alt={item?.salesman?.name}
                />
                <View style={styles.rankCardInfo}>
                  <Text style={[styles.cardName, { color: colors.text.primary }]}>{item?.salesman?.name || "Unknown"}</Text>
                  <Text style={[styles.cardPoints, { color: colors.text.secondary }]}>{item?.points || 0} points</Text>
                </View>
              </View>
              <View style={[styles.rankCircle, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.rankCircleText, { color: colors.primary }]}>#{index + 4}</Text>
              </View>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <>
            <Image
              source={require("@/assets/images/confetti.webp")}
              style={styles.confettiOverlay}
            />
            
            {/* Your Rank Banner */}
            {myRank?.rank !== undefined ? (
              <View style={[styles.rankContainer, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.15)", borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)" }]}>
                <View style={[styles.rankBox, { backgroundColor: isDark ? colors.surface : "#FFFFFF" }]}>
                  <Text style={[styles.rankText, { color: isDark ? colors.text.primary : Theme.colors.primaryDark }]}>#{myRank?.rank}</Text>
                </View>
                <View style={styles.rankTextContainer}>
                  <Text style={styles.rankText2}>
                    {betterThan === 0 
                      ? "Keep pushing! Make your first sales to climb the ranks." 
                      : `You are outperforming ${betterThan} other salesmen!`}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 60 }}></View>
            )}

            {/* Podium Area */}
            <View style={styles.podiumContainer}>
              {/* 2nd place */}
              {topThree[1] && (
                <View style={[styles.podiumSpot, { marginTop: 50 }]}>
                  <View style={styles.avatarBorder}>
                    <Pfp
                      size={56}
                      alt={topThree[1].salesman?.name}
                      src={topThree[1].salesman?.avatar}
                    />
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {(topThree[1].salesman?.name || "Unknown").split(" ")[0]}
                  </Text>
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{topThree[1].points} pts</Text>
                  </View>
                </View>
              )}

              {/* 1st place */}
              {topThree[0] && (
                <View style={styles.podiumSpot}>
                  <View style={[styles.avatarBorder, styles.goldBorder]}>
                    <Pfp
                      size={70}
                      alt={topThree[0].salesman?.name}
                      src={topThree[0].salesman?.avatar}
                    />
                  </View>
                  <Text style={[styles.podiumName, styles.goldText]} numberOfLines={1}>
                    {(topThree[0].salesman?.name || "Unknown").split(" ")[0]}
                  </Text>
                  <View style={[styles.tagContainer, styles.goldTag]}>
                    <Text style={styles.goldTagText}>{topThree[0].points} pts</Text>
                  </View>
                </View>
              )}

              {/* 3rd place */}
              {topThree[2] && (
                <View style={[styles.podiumSpot, { marginTop: 50 }]}>
                  <View style={styles.avatarBorder}>
                    <Pfp
                      size={56}
                      alt={topThree[2].salesman?.name}
                      src={topThree[2].salesman?.avatar}
                    />
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {(topThree[2].salesman?.name || "Unknown").split(" ")[0]}
                  </Text>
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{topThree[2].points} pts</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Board graphics buffer */}
            <View style={styles.boardGraphicContainer}>
              <Image
                source={require("@/assets/images/board.png")}
                style={styles.boardGraphic}
              />
            </View>

            {/* Start of ListContainer */}
            <View style={[styles.listContainer, { backgroundColor: colors.background, minHeight: 0 }]}>
              <View style={[styles.listPadding, { paddingBottom: 0 }]}>
                {/* Top 3 mapped items rendered as cards inside header */}
                {topThree.map((item, idx) => (
                  <View key={item?.salesman?.id || idx} style={[styles.rankCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.rankCardLeft}>
                      <Pfp
                        size={48}
                        src={item?.salesman?.avatar}
                        alt={item?.salesman?.name}
                      />
                      <View style={styles.rankCardInfo}>
                        <Text style={[styles.cardName, { color: colors.text.primary }]}>{item?.salesman?.name || "Unknown"}</Text>
                        <Text style={[styles.cardPoints, { color: colors.text.secondary }]}>{item?.points || 0} points</Text>
                      </View>
                    </View>
                    <Image
                      source={topImages[idx]}
                      style={styles.crownImage}
                    />
                  </View>
                ))}
              </View>
            </View>
          </>
        }
        ListFooterComponent={
          <View style={[styles.listContainer, { backgroundColor: colors.background, borderTopRightRadius: 0, borderTopLeftRadius: 0, minHeight: 0 }]}>
            <View style={[styles.listPadding, { paddingTop: 0 }]}>
              {/* Show More Button */}
              {hasMore && !showAll && (
                <TouchableOpacity 
                  style={[styles.showMoreButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowAll(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.showMoreText, { color: colors.primary }]}>
                    Show More ({restOfList.length - 7} more)
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}

              {/* Show Less Button */}
              {showAll && hasMore && (
                <TouchableOpacity 
                  style={[styles.showMoreButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowAll(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.showMoreText, { color: colors.primary }]}>Show Less</Text>
                  <MaterialIcons name="keyboard-arrow-up" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}

              {/* My Rank Card (if not in top 10) */}
              {myRank && !topThree.some(t => t?.salesman?.id === myRank.id) && !restOfList.some(t => t?.salesman?.id === myRank.id) && (
                <View style={[styles.rankCard, styles.mySelfHighlightCard]}>
                  <View style={styles.rankCardLeft}>
                    <Pfp
                      size={48}
                      src={myRank.avatar}
                      alt={myRank.name}
                    />
                    <View style={styles.rankCardInfo}>
                      <Text style={[styles.cardName, { color: '#FFFFFF' }]}>{myRank.name} (You)</Text>
                      <Text style={[styles.cardPoints, { color: 'rgba(255,255,255,0.7)' }]}>{myRank.points || 0} points</Text>
                    </View>
                  </View>
                  <View style={[styles.rankCircle, { backgroundColor: '#FFFFFF' }]}>
                    <Text style={[styles.rankCircleText, { color: colors.primary }]}>#{myRank.rank}</Text>
                  </View>
                </View>
              )}
              
              <View style={{ paddingBottom: 110 }}></View>
            </View>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  errorText: {
    fontFamily: Theme.typography.fontFamily.medium,
    marginTop: 10,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.secondary,
  },
  confettiOverlay: {
    width: "100%",
    height: 180,
    position: "absolute",
    top: 0,
    opacity: 0.6,
  },
  rankContainer: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Theme.radius.xl,
    marginTop: 20,
    marginHorizontal: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  rankBox: {
    borderRadius: Theme.radius.md,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    ...Theme.shadows.sm,
  },
  rankText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h2,
    color: Theme.colors.primaryDark,
  },
  rankText2: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm,
    color: "#FFFFFF",
    lineHeight: 18,
  },
  rankTextContainer: {
    flex: 1,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    zIndex: 2,
  },
  podiumSpot: {
    width: 100,
    alignItems: "center",
    gap: 8,
  },
  avatarBorder: {
    borderRadius: Theme.radius.full,
    padding: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  goldBorder: {
    backgroundColor: "#FBBF24", // Gold halo
    padding: 4,
  },
  podiumName: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.bodySm,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  goldText: {
    fontSize: Theme.typography.sizes.body,
    color: "#FEF3C7",
  },
  tagContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Theme.radius.full,
  },
  tagText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: "#FFFFFF",
    fontSize: 10,
  },
  goldTag: {
    backgroundColor: "#FEF3C7",
  },
  goldTagText: {
    fontFamily: Theme.typography.fontFamily.bold,
    color: "#D97706",
    fontSize: 11,
  },
  boardGraphicContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 110,
    position: "relative",
    zIndex: 1,
  },
  boardGraphic: {
    width: 300,
    height: 250,
    resizeMode: "contain",
    position: "absolute",
    top: -120,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Clean light background matching the app theme
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    minHeight: 500,
    ...Theme.shadows.lg,
  },
  listPadding: {
    padding: 20,
  },
  rankCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: Theme.radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  mySelfHighlightCard: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  rankCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rankCardInfo: {
    gap: 2,
    flex: 1,
  },
  cardName: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.primary,
  },
  cardPoints: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
  },
  crownImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  rankCircle: {
    backgroundColor: Theme.colors.primaryLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  rankCircleText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.primary,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.lg,
    marginBottom: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  showMoreText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.primary,
  },
});