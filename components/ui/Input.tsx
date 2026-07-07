import { TextInput } from "react-native";

interface InputProps {
  placeholder: string;
  type?: "TEXT" | "PASSWORD";
  value: string;
  onChange: (value: string) => void;
}

export default function Input(props: InputProps) {
  return (
    <TextInput
      placeholder={props.placeholder}
      value={props.value}
      onChangeText={props.onChange}
      style={{
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#ddd",
        fontSize: 14,
        paddingHorizontal: 20,
        paddingVertical: 15
      }}
    />
  )
}