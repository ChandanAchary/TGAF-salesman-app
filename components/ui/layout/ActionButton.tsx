import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

function ActionTile({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {icon}
      <Text style={styles.cardTitle}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
});