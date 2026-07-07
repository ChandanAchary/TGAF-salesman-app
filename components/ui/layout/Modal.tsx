import { LinearGradient } from "expo-linear-gradient";
import { Modal, StyleSheet, View } from "react-native";

export default function ModalView({
  isReceiveModalVisible,
  setIsReceiveModalVisible,
  children,
  animationType = "slide",
}: {
  isReceiveModalVisible: boolean;
  setIsReceiveModalVisible: (value: boolean) => void;
  children: React.ReactNode;
  animationType?: "slide" | "fade" | "none";
}) {
  return (
    <Modal
      visible={isReceiveModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsReceiveModalVisible(false)}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {children}
        </View>
      </LinearGradient>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    minHeight: '30%',
  },
});