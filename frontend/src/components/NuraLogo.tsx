import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface NuraLogoProps {
  size?: number;
}

export const NuraLogo: React.FC<NuraLogoProps> = ({ size = 40 }) => {
  // Nura logo "N" - matching reference image precisely
  // Two interlocking arrow-like shapes forming an abstract N
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* NAVY: Arrow shape - horizontal bar at top transitioning to diagonal down-right */}
        <Path
          d="M5 8 L42 8 L42 20 L22 20 L54 72 L54 85 L42 85 L42 77 L12 20 L5 20 Z"
          fill={COLORS.primary}
        />
        {/* NAVY dot top-right */}
        <Circle cx="72" cy="14" r="11" fill={COLORS.primary} />
        
        {/* MINT dot bottom-left */}
        <Circle cx="28" cy="86" r="11" fill={COLORS.accent} />
        {/* MINT: Arrow shape - diagonal up transitioning to vertical bar down on right */}
        <Path
          d="M46 92 L58 92 L58 77 L78 42 L78 20 L58 20 L58 32 L46 32 Z"
          fill={COLORS.accent}
        />
        {/* MINT: Vertical bar on right */}
        <Path
          d="M78 20 L95 20 L95 92 L83 92 L83 32 L78 32 Z"
          fill={COLORS.accent}
        />
      </Svg>
      <Text style={[styles.text, { fontSize: size * 0.55 }]}>nura</Text>
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
    fontWeight: '300',
    marginLeft: 2,
    letterSpacing: 0.5,
  },
});
