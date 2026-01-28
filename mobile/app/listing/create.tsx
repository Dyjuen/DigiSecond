import { Stack } from "expo-router";
import ListingCreateScreen from "../../src/screens/ListingCreate/ListingCreateScreen";

export default function ListingCreateRoute() {
    return (
        <>
            <Stack.Screen options={{ title: "Tambah Produk Jual" }} />
            <ListingCreateScreen />
        </>
    );
}
