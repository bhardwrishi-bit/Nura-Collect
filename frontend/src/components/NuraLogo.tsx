import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface NuraLogoProps {
  size?: number;
}

export const NuraLogo: React.FC<NuraLogoProps> = ({ size = 32 }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Navy diagonal stroke */}
        <Polygon
          points="10,10 30,10 70,75 70,90 50,90 50,75 20,22 10,22"
          fill={COLORS.primary}
        />
        {/* Navy circle at top-right */}
        <Circle cx="65" cy="15" r="13" fill={COLORS.primary} />
        {/* Mint diagonal stroke */}
        <Polygon
          points="50,10 70,10 90,45 90,90 70,90 70,55 60,40 50,25"
          fill={COLORS.accent}
        />
        {/* Mint circle at bottom-left */}
        <Circle cx="32" cy="87" r="11" fill={COLORS.accent} />
      </Svg>
      <Text style={[styles.text, { fontSize: size * 0.625 }]}>nura</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: COLORS.text,
    fontWeight: '300',
    letterSpacing: 1,
  },
});
