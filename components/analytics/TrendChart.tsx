import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { ChartPoint } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { LineChart, BarChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";

interface TrendChartProps {
  title: string;
  data: ChartPoint[];
  type: "line" | "bar";
  valuePrefix?: string;
  barColor?: string;
  lineColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export default function TrendChart({
  title,
  data,
  type,
  valuePrefix = "",
  barColor,
  lineColor,
  iconName = "stats-chart-outline",
}: TrendChartProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  const { width: screenWidth } = useWindowDimensions();
  
  // Responsive chart width mapping
  const chartWidth = screenWidth - 76;

  // Formatting chart points
  const chartData = data.map((point) => ({
    value: point.value,
    label: point.label,
    frontColor: barColor || colors.primary,
    dataPointColor: lineColor || colors.primary,
  }));

  const maxVal = Math.max(...data.map((d) => d.value), 10);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: isDark ? 1 : 0,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name={iconName} size={16} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>

      <View style={styles.chartWrapper}>
        {type === "line" ? (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={140}
            maxValue={maxVal}
            noOfSections={4}
            spacing={chartWidth / (data.length || 1) - 6}
            initialSpacing={10}
            color={lineColor || colors.primary}
            thickness={3}
            startFillColor={`${lineColor || colors.primary}15`}
            endFillColor={`${lineColor || colors.primary}05`}
            isAnimated
            hideRules={false}
            rulesColor={colors.border}
            rulesType="solid"
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.text.secondary, fontSize: 9 }}
            xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 9, fontWeight: "500" }}
            dataPointsHeight={6}
            dataPointsWidth={6}
            dataPointsColor={lineColor || colors.primary}
            textFontSize={9}
          />
        ) : (
          <BarChart
            data={chartData}
            width={chartWidth}
            height={140}
            maxValue={maxVal}
            noOfSections={4}
            spacing={20}
            barWidth={chartWidth / (data.length || 1) - 24}
            barBorderRadius={6}
            initialSpacing={12}
            isAnimated
            hideRules={false}
            rulesColor={colors.border}
            rulesType="solid"
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.text.secondary, fontSize: 9 }}
            xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 9, fontWeight: "500" }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 8,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  chartWrapper: {
    alignItems: "center",
    marginLeft: -10, // Adjust label spacing padding
  },
});
