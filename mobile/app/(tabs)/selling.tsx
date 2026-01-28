import { Stack } from "expo-router";
import MyListingsScreen from "../../src/screens/Listings/MyListingsScreen";

export default function SellingRoute() {
    return (
        <>
            <Stack.Screen options={{ title: "Jualan Saya", headerShown: true }} />
            <MyListingsScreen />
        </>
    );
}
