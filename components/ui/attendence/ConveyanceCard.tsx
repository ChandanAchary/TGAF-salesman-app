import { API_ROUTES } from "@/constants/ApiRoutes";
import { background, primary } from "@/constants/Colors";
import { api } from "@/lib/axios/axios";
import { errorHandler } from "@/lib/axios/errorHandler";
import { Response } from "@/lib/types/types";
import { useQuery } from "@tanstack/react-query";
import { Smiley, SmileySad, Sparkle, Trophy, Warning } from "phosphor-react-native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface ConveyanceResponse extends Response {
  data: {
    month: number;
  }
}

export default function ConveyanceCard() {

  const conveyanceQuery = useQuery({
    queryKey: ["salesmanConveyance"],
    queryFn: async () => {
      const res = await api.get<ConveyanceResponse>(API_ROUTES.SALESMAN.GET_CONVEYANCE);
      return res.data;
    },
  });

  useEffect(() => {
    if (conveyanceQuery.isError) {
      errorHandler(conveyanceQuery.error);
    }
  }, [conveyanceQuery.isError]);

  if (conveyanceQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={primary} />
      </View>
    );
  }

  const monthTotal = conveyanceQuery.data?.data?.month ?? 0;
  const now = new Date();
  const isAfterFive = now.getHours() >= 17;

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#334155", marginBottom: 8 }}>
        Conveyance Score
      </Text>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.trophyBadge}>
              <Trophy size={18} color="#B45309" weight="fill" />
            </View>
            <View>
              <Text style={styles.title}>CONVEYANCE</Text>
              <Text style={styles.subtitle}>Daily checkout boost</Text>
            </View>
          </View>
          {isAfterFive ? (
            <Smiley size={28} color="#16A34A" weight="duotone" />
          ) : (
            <SmileySad size={28} color="#F97316" weight="duotone" />
          )}
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>{monthTotal}</Text>
          <Text style={styles.scoreLabel}>Total accumulated</Text>
        </View>

        <View style={styles.bonusRow}>
          <View
            style={[
              styles.bonusBadge,
              isAfterFive ? styles.bonusBadgeGood : styles.bonusBadgeWarn,
            ]}
          >
            {isAfterFive ? (
              <Sparkle size={16} color="#16A34A" weight="fill" />
            ) : (
              <Warning size={16} color="#EA580C" weight="fill" />
            )}
            <Text
              style={[
                styles.bonusText,
                isAfterFive ? styles.bonusTextGood : styles.bonusTextWarn,
              ]}
            >
              {isAfterFive ? "+1 for today" : "No bonus yet"}
            </Text>
          </View>
          <Text style={styles.bonusHint}>
            {isAfterFive ? "Nice! Checkout done after 5pm." : "Checkout after 5pm to earn today."}
          </Text>
        </View>

        {!isAfterFive && (
          <View style={styles.warningBox}>
            <Warning size={18} color="#D97706" weight="fill" />
            <Text style={styles.warningText}>
              if you checkout before 5pm you will not get your conveyance score
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  loadingContainer: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  trophyBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  scoreRow: {
    backgroundColor: background,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 4,
  },
  bonusRow: {
    gap: 8,
    marginBottom: 12,
  },
  bonusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  bonusBadgeGood: {
    backgroundColor: "#ECFDF3",
  },
  bonusBadgeWarn: {
    backgroundColor: "#FFF7ED",
  },
  bonusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  bonusTextGood: {
    color: "#16A34A",
  },
  bonusTextWarn: {
    color: "#EA580C",
  },
  bonusHint: {
    fontSize: 12,
    color: "#64748B",
  },
  warningBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: {
    flex: 1,
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
  },
});