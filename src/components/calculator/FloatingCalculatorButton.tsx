// src/components/calculator/FloatingCalculatorButton.tsx
import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useCalculator } from '../../app/providers/CalculatorProvider';

const { width, height } = Dimensions.get('window');

interface FloatingCalculatorButtonProps {
  initialPosition?: { x: number; y: number };
}

const widthReduce = 50;

export const FloatingCalculatorButton: React.FC<FloatingCalculatorButtonProps> = ({
  initialPosition = { x: width - widthReduce, y: height * 0.75 },
}) => {
  const { theme } = useTheme();
  const { showCalculator } = useCalculator();

  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animate in on mount
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      pan.flattenOffset();

      // Snap to edges
      const currentX = (pan.x as any)._value;
      const currentY = (pan.y as any)._value;
      const newX = currentX < width / 3 ? 20 : width - widthReduce;
      const newY = Math.max(height * 0.5, Math.min(height - 150, currentY));

      // Animate to final position
      Animated.spring(pan, {
        toValue: { x: newX, y: newY },
        useNativeDriver: false,
        tension: 150,
        friction: 8,
      }).start();
    },
  });

  const handlePress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
    ]).start();

    showCalculator();
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      zIndex: 1000,
    },
    button: {
      width: 45,
      height: 45,
      borderRadius: 30,
      backgroundColor: theme.colors.transfer.main,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    pressedButton: {
      backgroundColor: theme.colors.primary[600],
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            ...pan.getTranslateTransform(),
            { scale },
          ],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Icon name="calculator" size={24} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};