import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

const SLIDER_WIDTH = Dimensions.get('window').width - 64;
const THUMB_SIZE = 56;
const SLIDER_HEIGHT = 60;

interface SwipeSliderProps {
  label: string;
  onComplete: () => void;
  completed?: boolean;
  completedLabel?: string;
  disabled?: boolean;
}

export const SwipeSlider: React.FC<SwipeSliderProps> = ({
  label,
  onComplete,
  completed = false,
  completedLabel = 'Completed',
  disabled = false,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isComplete, setIsComplete] = useState(completed);

  const maxSlide = SLIDER_WIDTH - THUMB_SIZE - 8;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isComplete && !disabled,
      onMoveShouldSetPanResponder: () => !isComplete && !disabled,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gesture) => {
        if (isComplete || disabled) return;
        const newX = Math.max(0, Math.min(gesture.dx, maxSlide));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gesture) => {
        if (isComplete || disabled) return;
        if (gesture.dx >= maxSlide * 0.8) {
          Animated.spring(translateX, {
            toValue: maxSlide,
            useNativeDriver: true,
          }).start(() => {
            setIsComplete(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const backgroundOpacity = translateX.interpolate({
    inputRange: [0, maxSlide],
    outputRange: [0, 1],
  });

  if (isComplete || completed) {
    return (
      <View style={[styles.container, styles.completedContainer]}>
        <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />
        <Text style={styles.completedText}>{completedLabel}</Text>
      </View>
    );
  }

  if (disabled) {
    return (
      <View style={[styles.container, styles.disabledContainer]}>
        <Text style={styles.disabledText}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.progressBackground,
          { opacity: backgroundOpacity },
        ]}
      />
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.thumb,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: SLIDER_HEIGHT,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: THUMB_SIZE,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE - 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  completedContainer: {
    backgroundColor: 'rgba(128, 229, 203, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledContainer: {
    backgroundColor: COLORS.disabled,
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
