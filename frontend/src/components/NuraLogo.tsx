import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface NuraLogoProps {
  size?: number;
}

export const NuraLogo: React.FC<NuraLogoProps> = ({ size = 40 }) => {
  const scale = size / 40;
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        {/* Navy diagonal */}
        <Path
          d="M8 8 L16 8 L28 28 L20 28 Z"
          fill={COLORS.primary}
        />
        {/* Mint diagonal */}
        <Path
          d="M12 32 L20 32 L32 12 L24 12 Z"
          fill={COLORS.accent}
        />
        {/* Navy dot */}
        <Circle cx="8" cy="8" r="4" fill={COLORS.primary} />
        {/* Mint dot */}
        <Circle cx="12" cy="32" r="4" fill={COLORS.accent} />
      </Svg>
      <Text style={[styles.text, { fontSize: size * 0.6 }]}>nura</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: COLORS.text,
    fontWeight: '400',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
});
