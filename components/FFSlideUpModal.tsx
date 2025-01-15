import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  useAnimatedStyle,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import FFText from './FFText';

interface SlideUpModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SlideUpModal: React.FC<SlideUpModalProps> = ({ isVisible, onClose, children }) => {
  const { theme } = useTheme();
  const translateY = useSharedValue(300); // Initially below the screen

  useEffect(() => {
    if (isVisible) {
      // Animate modal sliding up
      translateY.value = withTiming(0, {
        duration: 300, // Smooth duration
        easing: Easing.out(Easing.ease),
      });
    } else {
      // Animate modal sliding down when not visible
      translateY.value = withTiming(300, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isVisible]);

  // Use animated gesture handler for drag functionality
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      // Save the initial translation on start
      context.startY = translateY.value;
    },
    onActive: (event, context: any) => {
      // Update the translationY while dragging
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        // Close modal when dragged down enough
        runOnJS(onClose)();
      } else {
        // If not dragged enough, reset the modal position
        translateY.value = withSpring(0, {
          damping: 30,
          stiffness: 200,
        });
      }
    },
  });

  // Animated styles for the modal
  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      zIndex: 999,  // Ensure this modal is on top
    };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1,  }}>
      <Animated.View
        style={[styles.modalContainer, animatedModalStyle, {
          backgroundColor: theme === 'light' ? '#fff' : '#333',
        }]}
      >
        <PanGestureHandler onGestureEvent={gestureHandler} onHandlerStateChange={gestureHandler}>
          <Animated.View style={styles.modalContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FFText style={styles.closeButtonText}>Close</FFText>
            </TouchableOpacity>
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%', // Modal height
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,

  },
  modalContent: {
    flex: 1,
    
    justifyContent: 'flex-start',
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    
    marginTop: 20,
    flex: 1,
  },
});

export default SlideUpModal;
