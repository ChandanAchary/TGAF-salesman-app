import { primary } from "@/constants/Colors";
import { Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
}

export default function Button(props: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        backgroundColor: primary,
        padding: 20,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: 'bold' }}>{props.title}</Text>
    </TouchableOpacity>
  )
}