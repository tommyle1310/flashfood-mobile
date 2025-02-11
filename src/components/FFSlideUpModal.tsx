import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  useAnimatedStyle,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import { useTheme } from "@/src/hooks/useTheme";
import FFText from "./FFText";
import IconIonicon from "react-native-vector-icons/Ionicons";

interface SlideUpModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SlideUpModal: React.FC<SlideUpModalProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  const { theme } = useTheme();
  const screenHeight = Dimensions.get("window").height;
  const translateY = useSharedValue(screenHeight);
  const modalHeight = useSharedValue(screenHeight * 0.8);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        const keyboardHeight = e.endCoordinates.height;
        modalHeight.value = withTiming(
          screenHeight * 0.9 - keyboardHeight + 50,
          {
            duration: Platform.OS === "ios" ? e.duration : 250,
            easing: Easing.out(Easing.ease),
          }
        );
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        modalHeight.value = withTiming(screenHeight * 0.8, {
          duration: Platform.OS === "ios" ? e.duration : 250,
          easing: Easing.out(Easing.ease),
        });
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      translateY.value = withTiming(screenHeight, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isVisible]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_) => {},
    onActive: (event) => {
      translateY.value = Math.max(0, event.translationY);
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, {
          damping: 30,
          stiffness: 200,
        });
      }
    },
  });

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: modalHeight.value,
  }));

  if (!isVisible) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[styles.overlay]}>
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <View style={{ flex: 1 }}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={styles.dragHandle}>
                <View style={styles.handleBar} />
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <IconIonicon
                    name="close"
                    style={{ color: "white" }}
                    size={16}
                  />
                </TouchableOpacity>
              </Animated.View>
            </PanGestureHandler>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              bounces={true}
              showsVerticalScrollIndicator={true}
            >
              <View
                style={{
                  paddingBottom: Platform.OS === "ios" ? 34 : 24,
                  flex: 1,
                }}
              >
                {children}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: -600,
    left: 0,
    right: 0,
    height: 1000,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backgroundColor: "rgba(1,1,1, 0.2)",
  },
  modalContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    zIndex: 9999,
    paddingHorizontal: 20,
    shadowColor: "rgba(0, 255, 0, 0.25)",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
    backgroundColor: "#fff",
  },
  dragHandle: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    backgroundColor: "red",
    padding: 4,
    borderRadius: 9999,
  },
});

export default SlideUpModal;
