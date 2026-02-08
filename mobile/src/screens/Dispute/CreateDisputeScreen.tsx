import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { Text, TextInput, Button, useTheme, HelperText, RadioButton } from "react-native-paper";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../lib/api";
import { uploadPhotos } from "../../lib/uploadPhotos";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CreateDisputeScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

    const [category, setCategory] = useState<"NOT_AS_DESCRIBED" | "ACCESS_ISSUE" | "FRAUD" | "OTHER">("NOT_AS_DESCRIBED");
    const [description, setDescription] = useState("");
    const [evidence, setEvidence] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const utils = api.useUtils();

    const createDisputeMutation = api.dispute.create.useMutation();
    const addEvidenceMutation = api.dispute.addEvidence.useMutation();
    const uploadEvidenceMutation = api.dispute.uploadEvidence.useMutation();

    const handleSubmit = async () => {
        if (description.length < 20) {
            Alert.alert("Deskripsi Kurang", "Mohon jelaskan masalah dengan detail (min. 20 karakter).");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create Dispute
            const dispute = await createDisputeMutation.mutateAsync({
                transaction_id: transactionId,
                category,
                description,
            });

            // 2. Upload Evidence (if any)
            if (evidence.length > 0) {
                const uploadedUrls = await uploadPhotos(evidence, uploadEvidenceMutation);

                // 3. Link Evidence to Dispute
                await Promise.all(uploadedUrls.map(url =>
                    addEvidenceMutation.mutateAsync({
                        dispute_id: dispute.dispute_id,
                        file_url: url,
                        file_type: "image/jpeg", // Assuming JPEG for simplicity
                        file_name: `evidence-${Date.now()}.jpg`,
                        file_size_bytes: 1024, // Placeholder size
                    })
                ));
            }

            Alert.alert("Dispute Berhasil Dibuat", "Tim kami akan meninjau laporan Anda.", [
                {
                    text: "OK",
                    onPress: () => {
                        utils.transaction.getById.invalidate({ transaction_id: transactionId });
                        utils.transaction.getActive.invalidate();
                        router.dismiss(2); // Go back to chat list or previous screen
                    }
                }
            ]);
        } catch (error: any) {
            console.error("Dispute creation failed:", error);
            Alert.alert("Gagal", error.message || "Terjadi kesalahan saat membuat dispute");
        } finally {
            setIsSubmitting(false);
        }
    };

    const pickImage = async () => {
        // Limit to 5 images for now
        if (evidence.length >= 5) {
            Alert.alert("Batas Maksimal", "Maksimal 5 bukti foto.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].uri) {
            setEvidence([...evidence, result.assets[0].uri]);
            // In a real implementation we would start uploading in background or wait for submit
        }
    };

    const removeImage = (index: number) => {
        setEvidence(evidence.filter((_, i) => i !== index));
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: "Ajukan Dispute" }} />

            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Apa masalahnya?</Text>
                <RadioButton.Group onValueChange={value => setCategory(value as any)} value={category}>
                    <RadioButton.Item label="Item Tidak Sesuai Deskripsi" value="NOT_AS_DESCRIBED" />
                    <RadioButton.Item label="Tidak Bisa Akses Akun/Item" value="ACCESS_ISSUE" />
                    <RadioButton.Item label="Indikasi Penipuan" value="FRAUD" />
                    <RadioButton.Item label="Lainnya" value="OTHER" />
                </RadioButton.Group>
            </View>

            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Deskripsi Masalah</Text>
                <TextInput
                    mode="outlined"
                    multiline
                    numberOfLines={6}
                    placeholder="Jelaskan masalah secara detail..."
                    value={description}
                    onChangeText={setDescription}
                />
                <HelperText type="info" visible={true}>
                    Minimal 20 karakter. ({description.length}/2000)
                </HelperText>
            </View>

            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Bukti Foto (Opsional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceList}>
                    {evidence.map((uri, index) => (
                        <View key={index} style={styles.evidenceItem}>
                            <Image source={{ uri }} style={styles.evidenceImage} />
                            <MaterialCommunityIcons
                                name="close-circle"
                                size={24}
                                color={theme.colors.error}
                                style={styles.removeIcon}
                                onPress={() => removeImage(index)}
                            />
                        </View>
                    ))}
                    {evidence.length < 5 && (
                        <View style={styles.addEvidenceButton}>
                            <Button mode="outlined" onPress={pickImage} icon="camera">
                                Tambah
                            </Button>
                        </View>
                    )}
                </ScrollView>
            </View>

            <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting || description.length < 20}
                style={styles.submitButton}
            >
                Kirim Laporan
            </Button>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    evidenceList: {
        flexDirection: 'row',
    },
    evidenceItem: {
        marginRight: 10,
        position: 'relative',
    },
    evidenceImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeIcon: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    addEvidenceButton: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderRadius: 8,
    },
    submitButton: {
        marginTop: 8,
    }
});
