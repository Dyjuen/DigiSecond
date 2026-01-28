import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, ProgressBar, useTheme, Surface } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useListingStore, CURRENT_USER_ID } from "../../stores/listingStore";
import { useEffect } from "react";
import Step1Basic from "./steps/Step1Basic";
import Step2Photos from "./steps/Step2Photos";
import Step3Details from "./steps/Step3Details";

export default function ListingCreateScreen() {
    const theme = useTheme();
    const { id } = useLocalSearchParams();
    const addListing = useListingStore((state) => state.addListing);
    const updateListing = useListingStore((state) => state.updateListing);
    const getListingById = useListingStore((state) => state.getListingById);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        photos: [] as string[],
        price: "",
        description: "",
    });

    useEffect(() => {
        if (id && typeof id === 'string') {
            const existing = getListingById(id);
            if (existing) {
                setFormData({
                    name: existing.title,
                    category: existing.category || "",
                    photos: existing.photos || (existing.imageUrl ? [existing.imageUrl] : []),
                    price: existing.price.toString(),
                    description: existing.description,
                });
            }
        }
    }, [id]);

    const updateData = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            const listingData = {
                title: formData.name,
                price: parseInt(formData.price) || 0,
                description: formData.description,
                category: formData.category,
                photos: formData.photos,
                imageUrl: formData.photos[0] || "https://picsum.photos/400/300", // Default or first photo
            };

            if (id && typeof id === 'string') {
                updateListing(id, listingData);
            } else {
                addListing({
                    id: Math.random().toString(36).substr(2, 9),
                    sellerId: CURRENT_USER_ID,
                    ...listingData,
                });
            }
            router.back();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.back();
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1Basic data={formData} onChange={updateData} />;
            case 2:
                return <Step2Photos data={formData} onChange={updateData} />;
            case 3:
                return <Step3Details data={formData} onChange={updateData} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Wizard Header */}
            <View style={[styles.wizardHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.surfaceVariant }]}>
                <View style={styles.stepIndicator}>
                    <StepItem step={1} currentStep={step} label="Nama & Kategori" />
                    <StepItem step={2} currentStep={step} label="Foto Produk" />
                    <StepItem step={3} currentStep={step} label="Detail Produk" />
                </View>
                <View style={styles.dividers}>
                    <View style={[styles.divider, { backgroundColor: theme.colors.outline }, step >= 2 && { backgroundColor: theme.colors.primary }]} />
                    <View style={[styles.divider, { backgroundColor: theme.colors.outline }, step >= 3 && { backgroundColor: theme.colors.primary }]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderStep()}
            </ScrollView>

            {/* Bottom Bar */}
            <Surface style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.surfaceVariant }]} elevation={4}>
                <Button mode="outlined" onPress={handleBack} style={styles.button} textColor={theme.colors.primary}>
                    Batal
                </Button>
                <Button mode="contained" onPress={handleNext} style={styles.button}>
                    Lanjut
                </Button>
            </Surface>
        </SafeAreaView>
    );
}

const StepItem = ({ step, currentStep, label }: { step: number; currentStep: number; label: string }) => {
    const theme = useTheme();
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;

    return (
        <View style={[
            styles.stepItem,
            step === 1 && { alignItems: 'flex-start', paddingLeft: 4 } // Adjust alignment for Step 1
        ]}>
            <Text variant="labelSmall" style={{
                fontWeight: 'bold',
                color: isActive || isCompleted ? theme.colors.onSurface : theme.colors.onSurfaceVariant
            }}>
                STEP {step}
            </Text>
            <Text variant="bodySmall" style={{
                color: isActive || isCompleted ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                marginTop: 4, // Added spacing for separation
            }}>
                {label}
            </Text>
            {isActive && <View style={[styles.activeBar, { backgroundColor: theme.colors.primary }]} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    wizardHeader: {
        paddingTop: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f4f4f5',
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    stepItem: {
        alignItems: 'center',
        width: '30%',
    },
    activeBar: {
        position: 'absolute',
        bottom: -13, // align with bottom of header
        height: 3,
        width: '100%',
        backgroundColor: '#000',
    },
    dividers: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: -1,
        display: 'none' // The design in image uses bottom borders on labels, not disconnected lines
    },
    divider: {
        flex: 1,
        height: 2,
        backgroundColor: '#e4e4e7',
    },
    dividerActive: {
        backgroundColor: '#000',
    },
    content: {
        padding: 16,
    },
    bottomBar: {
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f4f4f5',
    },
    button: {
        flex: 1,
        borderRadius: 8,
    }
});
