import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Step1Props {
    data: {
        name: string;
        category: string;
    };
    onChange: (key: string, value: string) => void;
}

export default function Step1Basic({ data, onChange }: Step1Props) {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Nama Produk</Text>
                <TextInput
                    mode="outlined"
                    placeholder="Nama Produk"
                    value={data.name}
                    onChangeText={(text: string) => onChange("name", text)}
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    outlineStyle={styles.inputOutline}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Kategori Produk</Text>
                <TouchableOpacity onPress={() => {/* TODO: Open picker */ }}>
                    <View style={[styles.selector, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={{ color: data.category ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                            {data.category || "Pilih Kategori Produk"}
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#71717a',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f4f4f5',
    },
    inputOutline: {
        borderRadius: 8,
        borderWidth: 0,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f4f4f5',
    }
});
