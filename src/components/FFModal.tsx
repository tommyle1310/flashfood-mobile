import React from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme'; // Import the custom useTheme hook
import FFText from './FFText';

interface FFModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

const FFModal: React.FC<FFModalProps> = ({ visible, title, content, onClose }) => {
  const { theme } = useTheme(); // Get the theme for dynamic styling

  return (
    <Modal
      visible={visible}
      transparent={true} // Make the background semi-transparent
      animationType="fade" // Use a fade-in/fade-out animation
      onRequestClose={onClose} // Handle the request to close the modal
    >
      <View
        style={[
          styles.overlay,
          { backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' },
        ]}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme === 'light' ? '#fff' : '#333' },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { color: theme === 'light' ? '#333' : '#fff' },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.modalContent,
              { color: theme === 'light' ? '#333' : '#ccc' },
            ]}
          >
            {content}
          </Text>

          {/* Button to close the modal */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FFText style={{ color: 'white' }}>Close</FFText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center', // Vertically center the modal
    alignItems: 'center', // Horizontally center the modal
    position: 'absolute', // Make sure it's positioned relative to the screen
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    zIndex: 1,  // Ensure it's below the SlideUpModal
  },
  modalContainer: {
    width: 300, // Fixed width for the modal content
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10, // Add shadow for iOS and Android elevation
    margin: 20, // Optional margin to add space around modal
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
});

export default FFModal;
