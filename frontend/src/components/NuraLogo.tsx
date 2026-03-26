import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface NuraLogoProps {
  size?: number;
}

export const NuraLogo: React.FC<NuraLogoProps> = ({ size = 40 }) => {
  // The Nura logo has two interleaving diagonal strokes forming an abstract "N":
  // - Navy (back): diagonal going from top-left to bottom-right, with a small dot at its top-right
  // - Mint (front): diagonal going from bottom-left to top-right, with a small dot at its bottom-left
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 50 50">
        {/* Navy diagonal - background layer, goes from upper-left toward lower-right */}
        <G>
          {/* Main diagonal bar */}
          <Path
            d="M8 5 L16 5 L16 8 L35 38 L35 45 L27 45 L27 42 L10 14 L10 5 Z"
            fill={COLORS.primary}
          />
          {/* Navy dot at top-right */}
          <Circle cx="38" cy="8" r="5" fill={COLORS.primary} />
        </G>
        
        {/* Mint diagonal - foreground layer, goes from lower-left toward upper-right */}
        <G>
          {/* Main diagonal bar */}
          <Path
            d="M15 45 L23 45 L23 42 L40 14 L40 5 L42 5 L42 45 L35 45 L35 38 L20 12 L20 5 L15 5 Z"
            fill={COLORS.accent}
          />
          {/* Mint dot at bottom-left */}
          <Circle cx="12" cy="42" r="5" fill={COLORS.accent} />
        </G>
      </Svg>
      <Text style={[styles.text, { fontSize: size * 0.52 }]}>nura</Text>
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
    marginLeft: 1,
    letterSpacing: 0.5,
  },
});
