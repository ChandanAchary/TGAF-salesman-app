import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProductMetric } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";

interface ProductListProps {
  products: ProductMetric[];
}

export default function ProductList({ products }: ProductListProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  const [activeTab, setActiveTab] = useState<"top" | "slow">("top");
  const [expanded, setExpanded] = useState(false);

  const DEFAULT_VISIBLE = 3;
  const filteredProducts = products.filter((p) => p.status === activeTab);
  const visibleProducts = expanded ? filteredProducts : filteredProducts.slice(0, DEFAULT_VISIBLE);
  const hasMore = filteredProducts.length > DEFAULT_VISIBLE;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        Product Analytics
      </Text>

      {/* Tabs */}
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            setActiveTab("top");
            setExpanded(false);
          }}
          style={[
            styles.tab,
            activeTab === "top" && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "top" ? "#FFFFFF" : colors.text.secondary,
                fontWeight: activeTab === "top" ? "600" : "500",
              },
            ]}
          >
            Top Sellers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setActiveTab("slow");
            setExpanded(false);
          }}
          style={[
            styles.tab,
            activeTab === "slow" && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "slow" ? "#FFFFFF" : colors.text.secondary,
                fontWeight: activeTab === "slow" ? "600" : "500",
              },
            ]}
          >
            Slow Moving
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products list */}
      <View style={styles.list}>
        {visibleProducts.length > 0 ? (
          visibleProducts.map((p, idx) => (
            <View
              key={p.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              <View style={styles.rankWrapper}>
                <Text style={styles.rankText}>#{idx + 1}</Text>
              </View>
              <View style={styles.details}>
                <Text style={[styles.name, { color: colors.text.primary }]}>{p.name}</Text>
                <Text style={[styles.sku, { color: colors.text.muted }]}>{p.sku}</Text>
              </View>
              <View style={styles.stats}>
                <Text style={[styles.revenue, { color: colors.text.primary }]}>
                  ₦{p.revenue.toLocaleString()}
                </Text>
                <Text style={[styles.qty, { color: colors.text.secondary }]}>
                  {p.quantity} units
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text.muted }]}>
              No product analytics available.
            </Text>
          </View>
        )}
      </View>

      {/* Show More / Show Less Button */}
      {hasMore && (
        <TouchableOpacity
          onPress={() => setExpanded(prev => !prev)}
          style={[
            styles.showMoreBtn,
            {
              backgroundColor: isDark ? "rgba(59,130,246,0.12)" : "#EFF6FF",
              borderColor: isDark ? "rgba(59,130,246,0.3)" : "#BFDBFE",
            },
          ]}
          activeOpacity={0.75}
        >
          <Text style={[styles.showMoreText, { color: colors.primary }]}>
            {expanded
              ? "Show Less"
              : `Show ${filteredProducts.length - DEFAULT_VISIBLE} More`}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={14}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  tabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    gap: 12,
  },
  rankWrapper: {
    backgroundColor: "#F1F5F9",
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.bold,
    color: "#64748B",
  },
  details: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  sku: {
    fontSize: 9,
  },
  stats: {
    alignItems: "flex-end",
    gap: 2,
  },
  revenue: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  qty: {
    fontSize: 9,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  showMoreText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
});
