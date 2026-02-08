import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from "react-native";
import { Text, TextInput, Button, useTheme, ActivityIndicator, Avatar } from "react-native-paper";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

export default function ProfileScreen() {
    const theme = useTheme();
    const { user, setAuth } = useAuthStore();
    const utils = api.useUtils();

    // Data State
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(""); // User type might not have phone yet in interface?
    const [idCardUrl, setIdCardUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Mutations
    const updateProfile = api.user.update.useMutation({
        onSuccess: (updatedUser) => {
            // Update local store if needed, mostly re-fetch or just update specific fields
            utils.user.getMe.invalidate();
            Alert.alert("Sukses", "Profil berhasil diperbarui");
        },
        onError: (err) => {
            Alert.alert("Gagal", err.message);
        }
    });

    const uploadPhotoMutation = api.listing.uploadPhoto.useMutation();

    // Fetch current user's full profile (phone, id_card_url, etc.)
    const { data: userProfile, isLoading: isFetching } = api.user.getMe.useQuery();

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name);
            setPhone(userProfile.phone || "");
            setIdCardUrl(userProfile.id_card_url || null);
        }
    }, [userProfile]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile.mutateAsync({
                name,
                phone,
                id_card_url: idCardUrl || undefined,
            });
        } catch (error) {
            // handled in onError
        } finally {
            setLoading(false);
        }
    };

    const pickIdCard = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setLoading(true);
            try {
                // Determine file type
                const fileType = uri.endsWith(".png") ? "image/png" : "image/jpeg";

                // Get upload URL
                const { uploadUrl, publicUrl, token } = await uploadPhotoMutation.mutateAsync({
                    fileName: "id_card.jpg",
                    fileType: "image/jpeg", // Simplified
                });

                // Upload to Supabase
                const response = await fetch(uploadUrl, {
                    method: "PUT",
                    body: await (await fetch(uri)).blob(),
                    headers: {
                        "Content-Type": "image/jpeg",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Upload failed");

                setIdCardUrl(publicUrl);
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Gagal mengupload KTP");
            } finally {
                setLoading(false);
            }
        }
    };

    if (isFetching) return <View style={styles.center}><ActivityIndicator /></View>;

    return (
        <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: theme.colors.background }}>
            <View style={styles.header}>
                <Avatar.Image size={80} source={{ uri: userProfile?.avatar_url || user?.avatar || "https://ui-avatars.com/api/?name=" + name }} />
                <Text variant="titleLarge" style={{ marginTop: 8, color: theme.colors.onBackground }}>{name}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{userProfile?.email || user?.email}</Text>

                {userProfile?.is_verified ? (
                    <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                        <Text style={{ color: theme.colors.primary }}>Verifikasi Berhasil</Text>
                    </View>
                ) : (
                    <View style={[styles.badge, { backgroundColor: theme.colors.errorContainer }]}>
                        <Text style={{ color: theme.colors.error }}>Belum Terverifikasi</Text>
                    </View>
                )}
            </View>

            <View style={styles.form}>
                <TextInput
                    mode="outlined"
                    label="Nama Lengkap"
                    value={name}
                    onChangeText={setName}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    textColor={theme.colors.onSurface}
                />

                <TextInput
                    mode="outlined"
                    label="Nomor Telepon"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType={"phone-pad" as any}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    placeholder="Contoh: 081234567890"
                    textColor={theme.colors.onSurface}
                />

                <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8, color: theme.colors.onBackground }}>Verifikasi Identitas (KYC)</Text>
                <Text variant="bodySmall" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
                    Upload foto KTP/Kartu Pelajar untuk verifikasi akun dan menjadi Seller.
                </Text>

                <TouchableOpacity onPress={pickIdCard} style={[styles.uploadBox, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}>
                    {idCardUrl ? (
                        <Image source={{ uri: idCardUrl }} style={styles.uploadedImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={{ color: theme.colors.onSurfaceVariant }}>Upload KTP</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    disabled={loading}
                    style={{ marginTop: 24 }}
                >
                    Simpan Perubahan
                </Button>

                <Button
                    mode="outlined"
                    onPress={async () => {
                        await useAuthStore.getState().clearAuth();
                        router.replace("/login");
                    }}
                    style={{ marginTop: 12, borderColor: theme.colors.error }}
                    textColor={theme.colors.error}
                >
                    Logout
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginTop: 8,
    },
    form: {
        gap: 12,
    },
    input: {
        marginBottom: 8,
    },
    uploadBox: {
        height: 200,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        alignItems: 'center',
    }
});
