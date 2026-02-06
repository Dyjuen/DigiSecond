import ProfileScreen from "../src/screens/Settings/ProfileScreen";
import { Stack } from "expo-router";

export default function ProfileRoute() {
    return (
        <>
            <Stack.Screen options={{ title: "Profil & Verifikasi" }} />
            <ProfileScreen />
        </>
    );
}
