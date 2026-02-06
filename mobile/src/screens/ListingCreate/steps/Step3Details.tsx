import { View, StyleSheet } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";

interface Step3Props {
    data: {
        price: string;
        description: string;
    };
    onChange: (key: string, value: string) => void;
}

export default function Step3Details({ data, onChange }: Step3Props) {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            {/* Price Section */}
            <TextInput
                mode="outlined"
                label="Harga"
                placeholder="Masukkan harga produk"
                value={data.price}
                onChangeText={(text: string) => onChange('price', text.replace(/[^0-9]/g, ''))}
                keyboardType={"numeric" as any}
                style={{ backgroundColor: theme.colors.surface }}
                left={<TextInput.Affix text="Rp " />}
            />

            {/* Warning Box */}
            <View style={[styles.warningBox, { backgroundColor: theme.colors.tertiaryContainer }]}>
                <View style={{ width: 4, height: '100%', backgroundColor: theme.colors.tertiary, marginRight: 12 }} />
                <Text variant="bodySmall" style={{ flex: 1, color: theme.colors.onSurface }}>
                    Harap isi deskripsi akun dengan benar. Apabila ada ketidaksesuaian data login saat akun diserahkan ke pembeli, akan ada resiko penolakan dari pihak pembeli.
                </Text>
            </View>

            {/* Description Input */}
            <TextInput
                mode="outlined"
                label="Deskripsi Produk"
                multiline
                numberOfLines={6}
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
    },
    warningBox: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
});
