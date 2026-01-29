import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

interface Step2Props {
    data: {
        photos: string[];
    };
    onChange: (key: string, value: string[]) => void;
}

export default function Step2Photos({ data, onChange }: Step2Props) {
    const theme = useTheme();

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        const result = await ImagePicker.launchImageLibraryAsync({
            // @ts-expect-error - MediaType is valid but types are outdated
            mediaTypes: ImagePicker.MediaType.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - data.photos.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newPhotos = result.assets.map(asset => asset.uri);
            onChange("photos", [...data.photos, ...newPhotos]);
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...data.photos];
        newPhotos.splice(index, 1);
        onChange("photos", newPhotos);
    };

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Pilih foto produk yang ingin kamu jual. Kamu bisa memilih maksimal 5 foto.
            </Text>

            <View style={styles.photoGrid}>
                {data.photos.map((uri, index) => (
                    <View key={index} style={styles.photoItem}>
                        <Image source={{ uri }} style={styles.photo} />
                        <TouchableOpacity
                            style={[styles.removeButton, { backgroundColor: theme.colors.surface }]}
                            onPress={() => removePhoto(index)}
                        >
                            <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                ))}

                {data.photos.length < 5 && (
                    <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                        <View style={[styles.addPlaceholder, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}>
                            <MaterialCommunityIcons name="camera-plus" size={32} color={theme.colors.primary} />
                            <Text variant="labelSmall" style={{ marginTop: 4, color: theme.colors.primary }}>Tambah Foto</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    photoItem: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    addButton: {
        width: 100,
        height: 100,
    },
    addPlaceholder: {
        flex: 1,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9fa',
    },
    removeButton: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#fff',
        borderRadius: 12,
    }
});
