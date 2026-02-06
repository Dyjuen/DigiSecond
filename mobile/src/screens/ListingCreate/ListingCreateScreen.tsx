import { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, useTheme, Surface, ActivityIndicator } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useListingStore } from "../../stores/listingStore";
import { useEffect } from "react";
import Step1Basic from "./steps/Step1Basic";
import Step2Photos from "./steps/Step2Photos";
import Step3Details from "./steps/Step3Details";
import Step4Auction from "./steps/Step4Auction";
import { api } from "../../lib/api";
import { uploadPhotos } from "../../lib/uploadPhotos";
import { StepItem } from "../../components/StepItem";

export default function ListingCreateScreen() {
    const theme = useTheme();
    const { id } = useLocalSearchParams();
    // Keep usage for getListingById until migration is complete or use query
    const getListingById = useListingStore((state) => state.getListingById);

    // tRPC Mutations
    const createListing = api.listing.create.useMutation();
    const updateListing = api.listing.update.useMutation();
    const uploadPhotoMutation = api.listing.uploadPhoto.useMutation();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        category_id: "", // Added category_id
        listing_type: "FIXED" as "FIXED" | "AUCTION",
        photos: [] as string[],
        price: "",
        description: "",
        // Auction fields
        starting_bid: "",
        bid_increment: "5000",
        buy_now_price: "",
        auction_ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const isAuction = formData.listing_type === "AUCTION";
    const totalSteps = isAuction ? 4 : 3;

    useEffect(() => {
        if (id && typeof id === 'string') {
            const existing = getListingById(id);
            if (existing) {
                setFormData({
                    name: existing.title,
                    category: existing.category || "",
                    category_id: (existing as any).category_id || (existing as any).categoryId || "", // Handle both cases just to be safe
                    listing_type: "FIXED",
                    photos: existing.photos || (existing.imageUrl ? [existing.imageUrl] : []),
                    price: existing.price.toString(),
                    description: existing.description,
                    starting_bid: "",
                    bid_increment: "5000",
                    buy_now_price: "",
                    auction_ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                });
            }
        }
    }, [id]);

    const updateData = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const uploadPhotosHelper = async (localUris: string[]) => {
        return await uploadPhotos(localUris, uploadPhotoMutation);
    };

    const handleNext = async () => {
        // Step-specific validation
        if (step === 1) {
            // Validate Step 1: Basic Info
            if (!formData.name || formData.name.trim().length < 5) {
                Alert.alert("Validasi Gagal", "Nama produk harus minimal 5 karakter");
                return;
            }
            if (!formData.category_id || !formData.category) {
                Alert.alert("Validasi Gagal", "Silakan pilih kategori produk");
                return;
            }
        } else if (step === 2) {
            // Validate Step 2: Photos
            if (formData.photos.length === 0) {
                Alert.alert("Validasi Gagal", "Silakan tambahkan minimal 1 foto produk");
                return;
            }
        } else if (step === 3) {
            // Validate Step 3: Details
            if (!formData.price || parseInt(formData.price) <= 0) {
                Alert.alert("Validasi Gagal", "Silakan masukkan harga yang valid");
                return;
            }
            if (!formData.description || formData.description.trim().length < 10) {
                Alert.alert("Validasi Gagal", "Deskripsi produk harus minimal 10 karakter");
                return;
            }
        } else if (step === 4 && isAuction) {
            // Validate Step 4: Auction (if applicable)
            if (!formData.starting_bid || parseInt(formData.starting_bid) <= 0) {
                Alert.alert("Validasi Gagal", "Silakan masukkan bid awal yang valid");
                return;
            }
        }

        // Move to next step if not final
        if (step < totalSteps) {
            setStep(step + 1);
            return;
        }

        // Final Submit - double-check all validations
        if (!formData.name || formData.name.trim().length < 5) {
            Alert.alert("Validasi Gagal", "Nama produk harus minimal 5 karakter");
            return;
        }
        if (!formData.category_id) {
            Alert.alert("Validasi Gagal", "Kategori produk tidak valid");
            return;
        }
        if (formData.photos.length === 0) {
            Alert.alert("Validasi Gagal", "Minimal 1 foto diperlukan");
            return;
        }

        setLoading(true);
        try {
            // Upload photos first
            const photoUrls = await uploadPhotosHelper(formData.photos);

            const commonData = {
                title: formData.name.trim(),
                description: formData.description.trim(),
                price: parseInt(formData.price) || 0,
                // category_id: formData.category_id,
                photos: photoUrls,
            };

            if (id && typeof id === 'string') {
                await updateListing.mutateAsync({
                    listingId: id,
                    ...commonData,
                    categoryId: formData.category_id,
                });
            } else {
                await createListing.mutateAsync({
                    ...commonData,
                    category_id: formData.category_id,
                    listing_type: formData.listing_type,
                    starting_bid: isAuction ? (parseInt(formData.starting_bid) || 0) : undefined,
                    bid_increment: isAuction ? (parseInt(formData.bid_increment) || 5000) : undefined,
                    buy_now_price: isAuction ? (parseInt(formData.buy_now_price) || undefined) : undefined,
                    auction_ends_at: isAuction ? formData.auction_ends_at : undefined,
                });
            }

            Alert.alert("Sukses", isAuction ? "Lelang berhasil dibuat!" : "Listing berhasil dibuat!");
            router.back();
        } catch (error: any) {
            console.error(error);
            Alert.alert("Gagal", error?.message || "Terjadi kesalahan saat menyimpan listing");
        } finally {
            setLoading(false);
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
            case 4:
                return <Step4Auction data={formData} onChange={updateData} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Wizard Header */}
            <View style={[styles.wizardHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.surfaceVariant }]}>
                <View style={styles.stepIndicator}>
                    <StepItem step={1} currentStep={step} label="Info" />
                    <StepItem step={2} currentStep={step} label="Foto" />
                    <StepItem step={3} currentStep={step} label="Detail" />
                    {isAuction && <StepItem step={4} currentStep={step} label="Lelang" />}
                </View>
                {/* Visual dividers are simplified for cleaner dynamic logic */}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderStep()}
            </ScrollView>

            {/* Bottom Bar */}
            <Surface style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.surfaceVariant }]} elevation={4}>
                <Button mode="outlined" onPress={handleBack} style={styles.button} textColor={theme.colors.primary}>
                    Batal
                </Button>
                <Button mode="contained" onPress={handleNext} style={styles.button} disabled={loading} loading={loading}>
                    {step === totalSteps ? (loading ? "Menyimpan..." : "Simpan") : "Lanjut"}
                </Button>
            </Surface>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    wizardHeader: {
        paddingTop: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    content: {
        padding: 16,
    },
    bottomBar: {
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
    },
    button: {
        flex: 1,
        borderRadius: 8,
    }
});
