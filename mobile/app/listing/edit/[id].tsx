import { Stack, useLocalSearchParams } from "expo-router";
import ListingEditScreen from "../../../src/screens/ListingEdit/ListingEditScreen";

export default function ListingEditRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <>
            <Stack.Screen options={{ title: "Edit Produk", headerBackTitle: "Back" }} />
            <ListingEditScreen listingId={id} />
        </>
    );
}
