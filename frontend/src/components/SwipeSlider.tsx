import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

const SLIDER_HEIGHT = 56;
const THUMB_SIZE = 48;

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
  const [sliderWidth, setSliderWidth] = useState(Dimensions.get('window').width - 32);

  // Refs so the PanResponder closure always reads current values,
  // even though it is created only once.
  const onCompleteRef = useRef(onComplete);
  const disabledRef = useRef(disabled);
  const isCompleteRef = useRef(isComplete);
  const maxSlideRef = useRef(sliderWidth - THUMB_SIZE - 8);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { isCompleteRef.current = isComplete; }, [isComplete]);
  useEffect(() => {
    maxSlideRef.current = sliderWidth - THUMB_SIZE - 8;
  }, [sliderWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !isCompleteRef.current && !disabledRef.current,
      onMoveShouldSetPanResponder: () =>
        !isCompleteRef.current && !disabledRef.current,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gesture) => {
        if (isCompleteRef.current || disabledRef.current) return;
        const newX = Math.max(0, Math.min(gesture.dx, maxSlideRef.current));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gesture) => {
        if (isCompleteRef.current || disabledRef.current) return;
        const maxSlide = maxSlideRef.current;
        if (gesture.dx >= maxSlide * 0.8) {
          Animated.spring(translateX, {
            toValue: maxSlide,
            useNativeDriver: true,
          }).start(() => {
            setIsComplete(true);
            isCompleteRef.current = true;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onCompleteRef.current();
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

  const progressWidth = translateX.interpolate({
    inputRange: [0, Math.max(maxSlideRef.current, 1)],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  if (isComplete || completed) {
    return (
      <View style={[styles.container, styles.completedContainer]}>
        <Text style={styles.completedText}>✓ {completedLabel}</Text>
      </View>
    );
  }

  if (disabled) {
    return (
      <View style={[styles.container, styles.disabledContainer]}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.disabledThumb}>
          <Text style={styles.thumbIcon}>›</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.progressBackground,
          { width: progressWidth },
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
        <Text style={styles.thumbIcon}>›</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: SLIDER_HEIGHT,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 28,
    opacity: 0.8,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: THUMB_SIZE,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  thumbIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
  completedContainer: {
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  completedText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledContainer: {
    opacity: 0.4,
  },
  disabledThumb: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
});
