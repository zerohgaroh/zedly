import React, { useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';

type HoverState = { hovered: boolean; pressed: boolean };

type HoverablePressableProps = Omit<React.ComponentPropsWithoutRef<typeof Pressable>, 'children'> & {
  key?: React.Key;
  style?: any;
  hoverStyle?: any;
  pressedStyle?: any;
  hoverScale?: number;
  hoverTranslateY?: number;
  children: (state: HoverState) => React.ReactNode;
};

export default function HoverablePressable({
  onPress,
  disabled,
  style,
  hoverStyle,
  pressedStyle,
  hoverScale = 1.02,
  hoverTranslateY = -2,
  children,
  ...rest
}: HoverablePressableProps) {
  const [hovered, setHovered] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const animateTo = (toValue: number) => {
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => {
        if (disabled) return;
        setHovered(true);
        animateTo(1);
      }}
      onHoverOut={() => {
        setHovered(false);
        animateTo(0);
      }}
      {...rest}
    >
      {({ pressed }: { pressed: boolean }) => (
        <Animated.View
          style={[
            style,
            hovered && hoverStyle,
            pressed && pressedStyle,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, hoverTranslateY],
                  }),
                },
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, hoverScale],
                  }),
                },
              ],
            },
          ]}
        >
          {children({ hovered, pressed })}
        </Animated.View>
      )}
    </Pressable>
  );
}
