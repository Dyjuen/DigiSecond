import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, useTheme, Checkbox, Surface, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Step3Props {
    data: {
        price: string;
        description: string;
    };
    onChange: (key: string, value: any) => void;
}

export default function Step3Details({ data, onChange }: Step3Props) {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            {/* Price Section */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <View style={styles.rowBetween}>
                    <View>
                        <Text variant="labelMedium" style={{ color: '#71717a' }}>Harga</Text>
                        <Text variant="titleLarge" style={{ marginTop: 4 }}>
                            Rp {data.price ? parseInt(data.price).toLocaleString('id-ID') : '-'}
                        </Text>
                    </View>
                    <Button mode="outlined" onPress={() => {/* Open price modal */ }} style={{ borderColor: theme.colors.secondary }} textColor={theme.colors.secondary}>
                        Atur Harga
                    </Button>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Checkbox status="unchecked" />
                    <Text variant="bodyMedium">Minta Rekomendasi Harga</Text>
                    <MaterialCommunityIcons name="information-outline" size={16} color="#a1a1aa" style={{ marginLeft: 4 }} />
                </View>
            </Surface>

            {/* Fee Info */}
            <View style={[styles.infoBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                <View style={{ width: 4, height: '100%', backgroundColor: theme.colors.secondary, marginRight: 12 }} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    Cek harga fee, <Text style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>klik disini.</Text>
                </Text>
            </View>

            {/* Voucher Banner (Mock) */}
            <View style={styles.banner}>
                <MaterialCommunityIcons name="ticket-percent" size={32} color="#fff" />
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Pakai voucher diskon yuk!</Text>
                    <Text style={{ color: '#fff', opacity: 0.9, fontSize: 12 }}>Atau masukan kode promo</Text>
                </View>
                <View style={styles.bannerCircle} />
            </View>

            {/* Warning Box */}
            <View style={[styles.warningBox, { backgroundColor: theme.colors.tertiaryContainer }]}>
                <View style={{ width: 4, height: '100%', backgroundColor: theme.colors.tertiary, marginRight: 12 }} />
                <Text variant="bodySmall" style={{ flex: 1, color: theme.colors.onSurface }}>
                    Harap isi deskripsi akun dengan benar. Apabila ada ketidaksesuaian data login saat akun diserahkan ke pembeli, akan ada resiko penolakan dari pihak pembeli.
                </Text>
            </View>

            {/* Description Input (Hidden in image but needed for logical completeness) */}
            <TextInput
                mode="outlined"
                label="Deskripsi Produk"
                multiline
                numberOfLines={4}
                value={data.description}
                onChangeText={(text: string) => onChange('description', text)}
                style={{ backgroundColor: theme.colors.surface }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    card: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#f4f4f5',
        marginVertical: 12,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff',
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    banner: {
        backgroundColor: '#000',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        overflow: 'hidden',
    },
    bannerCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        position: 'absolute',
        right: -10,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#fff7ed',
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
});
