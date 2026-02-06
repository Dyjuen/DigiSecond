import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface StepItemProps {
    step: number;
    currentStep: number;
    label: string;
}

export function StepItem({ step, currentStep, label }: StepItemProps) {
    const theme = useTheme();
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;

    return (
        <View style={styles.stepItem}>
            <Text
                variant="labelSmall"
                style={{
                    fontWeight: 'bold',
                    color: isActive || isCompleted ? theme.colors.onSurface : theme.colors.onSurfaceVariant
                }}
            >
                STEP {step}
            </Text>
            <Text
                variant="bodySmall"
                style={{
                    color: isActive || isCompleted ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    marginTop: 4,
                }}
            >
                {label}
            </Text>
            {isActive && <View style={[styles.activeBar, { backgroundColor: theme.colors.primary }]} />}
        </View>
    );
}

const styles = StyleSheet.create({
    stepItem: {
        alignItems: 'center',
        flex: 1,
    },
    activeBar: {
        position: 'absolute',
        bottom: -13,
        height: 3,
        width: '100%',
    },
});
