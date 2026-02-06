import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

interface Step4Props {
    data: {
        starting_bid: string;
        bid_increment: string;
        buy_now_price: string;
        auction_ends_at: Date;
    };
    onChange: (key: string, value: any) => void;
}

export default function Step4Auction({ data, onChange }: Step4Props) {
    const theme = useTheme();
    const [durationDays, setDurationDays] = useState("1");

    const handleDurationChange = (days: string) => {
        setDurationDays(days);
        const daysNum = parseInt(days) || 1;
        const endDate = new Date(Date.now() + daysNum * 24 * 60 * 60 * 1000);
        onChange("auction_ends_at", endDate);
    };

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Atur detail lelang untuk produkmu.
            </Text>

            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Harga Awal (Open BID)</Text>
                <TextInput
                    mode="outlined"
                    placeholder="Contoh: 100000"
                    value={data.starting_bid}
                    onChangeText={(text: string) => onChange("starting_bid", text)}
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    left={<TextInput.Affix text="Rp " />}
                    outlineStyle={styles.inputOutline}
                    {...{ keyboardType: "numeric" }}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Kelipatan Bid (Increment)</Text>
                <TextInput
                    mode="outlined"
                    placeholder="Contoh: 5000"
                    value={data.bid_increment}
                    onChangeText={(text: string) => onChange("bid_increment", text)}
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    left={<TextInput.Affix text="Rp " />}
                    outlineStyle={styles.inputOutline}
                    {...{ keyboardType: "numeric" }}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Harga Beli Sekarang (Buy Now) - Opsional</Text>
                <TextInput
                    mode="outlined"
                    placeholder="Kosongkan jika tidak ada"
                    value={data.buy_now_price}
                    onChangeText={(text: string) => onChange("buy_now_price", text)}
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    left={<TextInput.Affix text="Rp " />}
                    outlineStyle={styles.inputOutline}
                    {...{ keyboardType: "numeric" }}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>Durasi Lelang (Hari)</Text>
                <TextInput
                    mode="outlined"
                    placeholder="Contoh: 3"
                    value={durationDays}
                    onChangeText={handleDurationChange}
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    right={<TextInput.Affix text="Hari" />}
                    outlineStyle={styles.inputOutline}
                    {...{ keyboardType: "numeric" }}
                />
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
                    Berakhir pada: {data.auction_ends_at.toLocaleDateString("id-ID", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
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
    inputOutline: {
        borderRadius: 8,
        borderWidth: 0,
    },
});
