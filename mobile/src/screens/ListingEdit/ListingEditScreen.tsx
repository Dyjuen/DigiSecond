import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, useTheme, Surface, ActivityIndicator } from "react-native-paper";
import { router } from "expo-router";
import Step1Basic from "../ListingCreate/steps/Step1Basic";
import Step2Photos from "../ListingCreate/steps/Step2Photos";
import Step3Details from "../ListingCreate/steps/Step3Details";
import { api } from "../../lib/api";
import { uploadPhotos } from "../../lib/uploadPhotos";
import { StepItem } from "../../components/StepItem";
import { Skeleton } from "../../components/Skeleton";

interface ListingEditScreenProps {
    listingId: string;
}

export default function ListingEditScreen({ listingId }: ListingEditScreenProps) {
    const theme = useTheme();

    // Fetch existing listing
    const { data: listing, isLoading: isFetching, error: fetchError } = api.listing.getById.useQuery(
        { id: listingId },
        { enabled: !!listingId }
    );

    // Mutation for updating
    const utils = api.useUtils();
    const updateListing = api.listing.update.useMutation({
        onSuccess: () => {
            utils.listing.getById.invalidate({ id: listingId });
            utils.listing.getByUser.invalidate();
            Alert.alert("Sukses", "Listing berhasil diperbarui!", [
                {
                    text: "OK",
                    onPress: () => router.back()
                }
            ]);
        },
        onError: (err) => {
            Alert.alert("Gagal", err.message);
        }
    });

    const uploadPhotoMutation = api.listing.uploadPhoto.useMutation();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        category_id: "",
        listing_type: "FIXED" as "FIXED" | "AUCTION",
        photos: [] as string[],
        price: "",
        description: "",
    });

    // Pre-populate form when listing data is fetched
    useEffect(() => {
        if (listing) {
            setFormData({
                name: listing.title,
                category: listing.category?.name || listing.game || "",
                category_id: listing.category_id,
                listing_type: listing.listing_type,
                photos: listing.photo_urls || [],
                price: listing.price.toString(),
                description: listing.description,
            });
        }
    }, [listing]);

    const updateData = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const uploadPhotosHelper = async (localUris: string[]) => {
        return await uploadPhotos(localUris, uploadPhotoMutation);
    };

    const handleNext = async () => {
        // Step-specific validation
        if (step === 1) {
            if (!formData.name || formData.name.trim().length < 5) {
                Alert.alert("Validasi Gagal", "Nama produk harus minimal 5 karakter");
                return;
            }
            if (!formData.category_id || !formData.category) {
                Alert.alert("Validasi Gagal", "Silakan pilih kategori produk");
                return;
            }
        } else if (step === 2) {
            if (formData.photos.length === 0) {
                Alert.alert("Validasi Gagal", "Silakan tambahkan minimal 1 foto produk");
                return;
            }
        } else if (step === 3) {
            if (!formData.price || parseInt(formData.price) <= 0) {
                Alert.alert("Validasi Gagal", "Silakan masukkan harga yang valid");
                return;
            }
            if (!formData.description || formData.description.trim().length < 10) {
                Alert.alert("Validasi Gagal", "Deskripsi produk harus minimal 10 karakter");
                return;
            }
        }

        // Move to next step if not final
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        // Final Submit
        setLoading(true);
        try {
            // Upload photos (preserves existing remote URLs)
            const photoUrls = await uploadPhotosHelper(formData.photos);

            await updateListing.mutateAsync({
                listingId: listingId,
                title: formData.name.trim(),
                description: formData.description.trim(),
                price: parseInt(formData.price),
                categoryId: formData.category_id,
                photos: photoUrls,
            });
        } catch (error: any) {
            console.error(error);
            Alert.alert("Gagal", error?.message || "Terjadi kesalahan saat memperbarui listing");
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
            default:
                return null;
        }
    };

    // Loading state while fetching listing
    if (isFetching) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.wizardHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.stepIndicator}>
                        <Skeleton width={80} height={40} style={{ marginHorizontal: 8 }} />
                        <Skeleton width={80} height={40} style={{ marginHorizontal: 8 }} />
                        <Skeleton width={80} height={40} style={{ marginHorizontal: 8 }} />
                    </View>
                </View>
                <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                    <ActivityIndicator size="large" />
                    <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                        Memuat data listing...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (fetchError || !listing) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.error }}>
                        {fetchError ? "Error memuat listing" : "Listing tidak ditemukan"}
                    </Text>
                    {fetchError && (
                        <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                            {fetchError.message}
                        </Text>
                    )}
                    <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 24 }}>
                        Kembali
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Wizard Header */}
            <View style={[styles.wizardHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.surfaceVariant }]}>
                <View style={styles.stepIndicator}>
                    <StepItem step={1} currentStep={step} label="Info" />
                    <StepItem step={2} currentStep={step} label="Foto" />
                    <StepItem step={3} currentStep={step} label="Detail" />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderStep()}
            </ScrollView>

            {/* Bottom Bar */}
            <Surface style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.surfaceVariant }]} elevation={4}>
                <Button mode="outlined" onPress={handleBack} style={styles.button} textColor={theme.colors.primary}>
                    {step === 1 ? "Batal" : "Kembali"}
                </Button>
                <Button mode="contained" onPress={handleNext} style={styles.button} disabled={loading} loading={loading}>
                    {step === 3 ? (loading ? "Menyimpan..." : "Simpan") : "Lanjut"}
                </Button>
            </Surface>
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
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
