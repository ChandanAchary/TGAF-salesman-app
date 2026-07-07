import React, { useEffect, useRef, useState } from "react";
import { TextInput, View, StyleSheet, TextInputKeyPressEventData, NativeSyntheticEvent } from "react-native";

interface OtpInputProps {
  setOtp: (otp: string | null) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({ setOtp }) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);
    setOtp(newOtp.join(""));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otpValues.map((value, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          value={value}
          onChangeText={(text) => handleChange(index, text)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          returnKeyType="next"
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  input: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 14,
  },
});
