import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    style?: ViewStyle;
    borderRadius?: number;
}

export function Skeleton({ width, height, style, borderRadius = 4 }: SkeletonProps) {
    const { colors } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    width: width as any,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    height: height as any,
                    backgroundColor: colors.surfaceVariant,
                    opacity: opacity,
                    borderRadius: borderRadius,
                },
                style,
            ]}
        />
    );
}
