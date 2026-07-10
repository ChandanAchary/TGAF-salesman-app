import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal, FlatList, Pressable, Platform } from "react-native";
import { FilterType } from "../../lib/types/analytics";
import { useAppTheme, Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

interface AnalyticsFilterProps {
  activeFilter: FilterType;
  onChangeFilter: (filter: FilterType, startDate?: string, endDate?: string) => void;
  startDate?: string;
  endDate?: string;
  selectedBranch: string;
  selectedArea: string;
  onChangeArea: (area: string) => void;
  selectedMarket: string;
  onChangeMarket: (market: string) => void;
  showHierarchyFilters?: boolean;
  isCityHead?: boolean;
}

const FILTER_ITEMS: { value: FilterType; label: string }[] = [
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "THIS_WEEK", label: "This Week" },
  { value: "LAST_WEEK", label: "Last Week" },
  { value: "THIS_MONTH", label: "This Month" },
  { value: "LAST_MONTH", label: "Last Month" },
  { value: "LAST_3_MONTHS", label: "Last 3 Months" },
  { value: "THIS_YEAR", label: "This Year" },
  { value: "CUSTOM", label: "Custom Range" },
];

export const HIERARCHY_DATA = {
  areas: {
    "Lagos Branch": ["All Areas", "Ikeja Area", "Lekki Area", "Surulere Area", "Yaba Area", "Victoria Island Area"],
    "Ibadan Branch": ["All Areas", "Bodija Area", "Challenge Area", "Ring Road Area"],
    "Abuja Branch": ["All Areas", "Garki Area", "Wuse Area", "Maitama Area"]
  } as Record<string, string[]>,
  markets: {
    "All Areas": ["All Markets"],
    "Ikeja Area": ["All Markets", "Computer Village", "Ikeja Main Market", "Oregun Market"],
    "Lekki Area": ["All Markets", "Jakande Market", "Lekki Arts Market"],
    "Surulere Area": ["All Markets", "Tejuosho Market", "Masha Market"],
    "Yaba Area": ["All Markets", "Yaba Market", "Tejuosho"],
    "Victoria Island Area": ["All Markets", "Eko Market", "Sandfill Market"],
    "Bodija Area": ["All Markets", "Bodija Market"],
    "Challenge Area": ["All Markets", "Challenge Local Market"],
    "Ring Road Area": ["All Markets", "Ring Road Shopping Plaza"],
    "Garki Area": ["All Markets", "Garki Model Market"],
    "Wuse Area": ["All Markets", "Wuse Main Market"],
    "Maitama Area": ["All Markets", "Maitama Farmers Market"]
  } as Record<string, string[]>
};

export default function AnalyticsFilter({
  activeFilter,
  onChangeFilter,
  startDate,
  endDate,
  selectedBranch,
  selectedArea,
  onChangeArea,
  selectedMarket,
  onChangeMarket,
  showHierarchyFilters = false,
  isCityHead = true,
}: AnalyticsFilterProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  
  const [modalVisible, setModalVisible] = useState<"area" | "market" | "timeframe" | null>(null);
  const [showPicker, setShowPicker] = useState<"start" | "end" | null>(null);
  const [tempStart, setTempStart] = useState<Date>(new Date());
  const [tempEnd, setTempEnd] = useState<Date>(new Date());

  const activeTimeframeLabel = FILTER_ITEMS.find(item => item.value === activeFilter)?.label ?? "Today";

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed" || !selectedDate) {
      setShowPicker(null);
      return;
    }

    const formattedDate = selectedDate.toISOString().split("T")[0];

    if (showPicker === "start") {
      setTempStart(selectedDate);
      setShowPicker(null);
      onChangeFilter("CUSTOM", formattedDate, endDate || formattedDate);
    } else if (showPicker === "end") {
      setTempEnd(selectedDate);
      setShowPicker(null);
      onChangeFilter("CUSTOM", startDate || formattedDate, formattedDate);
    }
  };

  const openTimeframeOption = (value: FilterType) => {
    setModalVisible(null);
    if (value === "CUSTOM") {
      setShowPicker("start");
    } else {
      onChangeFilter(value);
    }
  };

  // Get dynamic areas and markets based on selections
  const areaList = HIERARCHY_DATA.areas[selectedBranch as keyof typeof HIERARCHY_DATA.areas] || HIERARCHY_DATA.areas["Lagos Branch"];
  const marketList = HIERARCHY_DATA.markets[selectedArea as keyof typeof HIERARCHY_DATA.markets] || ["All Markets"];
  const hasMarkets = isCityHead ? (selectedArea !== "All Areas") : true;

  return (
    <View style={styles.container}>
      {/* Row 1: Timeframe Selector & Active Branch (Static read-only status) */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
          onPress={() => setModalVisible("timeframe")}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownInfo}>
            <Text style={[styles.dropdownLabel, { color: colors.text.muted }]}>Timeline</Text>
            <Text style={[styles.dropdownValue, { color: colors.text.primary }]} numberOfLines={1}>
              {activeTimeframeLabel}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
        </TouchableOpacity>

        {showHierarchyFilters && (
          <View
            style={[
              styles.dropdownButton,
              styles.disabledButton,
              { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderColor: colors.border }
            ]}
          >
            <View style={styles.dropdownInfo}>
              <Text style={[styles.dropdownLabel, { color: colors.text.muted }]}>Branch (Assigned)</Text>
              <Text style={[styles.dropdownValue, { color: colors.text.secondary }]} numberOfLines={1}>
                {selectedBranch}
              </Text>
            </View>
            <Ionicons name="lock-closed" size={14} color={colors.text.muted} />
          </View>
        )}
      </View>

      {/* Row 2: Area Selector & Market Selector (if shown) */}
      {showHierarchyFilters && (
        <View style={[styles.row, { marginTop: 10 }]}>
          {isCityHead ? (
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
              onPress={() => setModalVisible("area")}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownInfo}>
                <Text style={[styles.dropdownLabel, { color: colors.text.muted }]}>Area</Text>
                <Text style={[styles.dropdownValue, { color: colors.text.primary }]} numberOfLines={1}>
                  {selectedArea}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.dropdownButton,
                styles.disabledButton,
                { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderColor: colors.border }
              ]}
            >
              <View style={styles.dropdownInfo}>
                <Text style={[styles.dropdownLabel, { color: colors.text.muted }]}>Area (Assigned)</Text>
                <Text style={[styles.dropdownValue, { color: colors.text.secondary }]} numberOfLines={1}>
                  {selectedArea}
                </Text>
              </View>
              <Ionicons name="lock-closed" size={14} color={colors.text.muted} />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.dropdownButton,
              !hasMarkets && styles.disabledButton,
              { 
                backgroundColor: hasMarkets ? colors.surface : (isDark ? "#1E293B" : "#F8FAFC"), 
                borderColor: colors.border 
              }
            ]}
            onPress={() => hasMarkets && setModalVisible("market")}
            disabled={!hasMarkets}
            activeOpacity={0.8}
          >
            <View style={styles.dropdownInfo}>
              <Text style={[styles.dropdownLabel, { color: colors.text.muted }]}>Market</Text>
              <Text 
                style={[
                  styles.dropdownValue, 
                  { color: hasMarkets ? colors.text.primary : colors.text.muted }
                ]} 
                numberOfLines={1}
              >
                {hasMarkets ? selectedMarket : "Select Area First"}
              </Text>
            </View>
            <Ionicons 
              name={hasMarkets ? "chevron-down" : "ban"} 
              size={16} 
              color={hasMarkets ? colors.text.secondary : colors.text.muted} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Range detail card */}
      {activeFilter === "CUSTOM" && startDate && endDate && (
        <View
          style={[
            styles.customRangeContainer,
            { backgroundColor: isDark ? "#1E293B" : "#EFF6FF", borderColor: colors.border },
          ]}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={[styles.customRangeText, { color: colors.text.primary }]}>
            Range: {startDate} to {endDate}
          </Text>
          <View style={styles.editButtons}>
            <TouchableOpacity
              onPress={() => setShowPicker("start")}
              style={[styles.editBtn, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.editBtnText, { color: colors.primary }]}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPicker("end")}
              style={[styles.editBtn, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.editBtnText, { color: colors.primary }]}>End</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal Dropdown Picker */}
      <Modal
        visible={modalVisible !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(null)}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {modalVisible === "area" 
                  ? "Select Area" 
                  : modalVisible === "market" 
                  ? "Select Market" 
                  : "Select Timeframe"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(null)}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {modalVisible === "timeframe" && (
              <FlatList
                data={FILTER_ITEMS}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const isSelected = activeFilter === item.value;
                  return (
                    <TouchableOpacity
                      style={[styles.optionRow, { borderBottomColor: isDark ? "#334155" : "#F1F5F9" }]}
                      onPress={() => openTimeframeOption(item.value)}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.text.primary, fontFamily: isSelected ? Theme.typography.fontFamily.semiBold : Theme.typography.fontFamily.regular }]}>
                        {item.label}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {modalVisible === "area" && (
              <FlatList
                data={areaList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = selectedArea === item;
                  return (
                    <TouchableOpacity
                      style={[styles.optionRow, { borderBottomColor: isDark ? "#334155" : "#F1F5F9" }]}
                      onPress={() => {
                        setModalVisible(null);
                        onChangeArea(item);
                      }}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.text.primary, fontFamily: isSelected ? Theme.typography.fontFamily.semiBold : Theme.typography.fontFamily.regular }]}>
                        {item}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {modalVisible === "market" && (
              <FlatList
                data={marketList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = selectedMarket === item;
                  return (
                    <TouchableOpacity
                      style={[styles.optionRow, { borderBottomColor: isDark ? "#334155" : "#F1F5F9" }]}
                      onPress={() => {
                        setModalVisible(null);
                        onChangeMarket(item);
                      }}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.text.primary, fontFamily: isSelected ? Theme.typography.fontFamily.semiBold : Theme.typography.fontFamily.regular }]}>
                        {item}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Date Picker trigger */}
      {showPicker && (
        <DateTimePicker
          value={showPicker === "start" ? tempStart : tempEnd}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.85,
  },
  dropdownInfo: {
    flex: 1,
    gap: 2,
  },
  dropdownLabel: {
    fontSize: 9,
    fontFamily: Theme.typography.fontFamily.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dropdownValue: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  customRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  customRangeText: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  editButtons: {
    flexDirection: "row",
    gap: 6,
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CBD5E1",
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#CBD5E1",
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 13,
  },
});
