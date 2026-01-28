import { render, fireEvent, screen } from "@testing-library/react-native";
import ListingCreateScreen from "../ListingCreateScreen";
import { Provider as PaperProvider } from "react-native-paper";

// Mock dependencies
jest.mock("expo-image-picker", () => ({
    launchImageLibraryAsync: jest.fn(),
}));

jest.mock("expo-router", () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
}));

// Mock vector icons to avoid issues
jest.mock("@expo/vector-icons", () => ({
    MaterialCommunityIcons: "Icon",
}));

describe("ListingCreateScreen", () => {
    it("renders step 1 initially", () => {
        render(
            <PaperProvider>
                <ListingCreateScreen />
            </PaperProvider>
        );
        expect(screen.getByText("Nama Produk")).toBeTruthy();
        expect(screen.getByText("STEP 1")).toBeTruthy();
    });

    it("navigates to step 2 on next", () => {
        render(
            <PaperProvider>
                <ListingCreateScreen />
            </PaperProvider>
        );

        // Fill required fields if validation existed (currently no validation)
        const nextButton = screen.getByText("Lanjut");
        fireEvent.press(nextButton);

        expect(screen.getByText("Pilih foto produk yang ingin kamu jual. Kamu bisa memilih maksimal 5 foto.")).toBeTruthy();
        expect(screen.getByText("STEP 2")).toBeTruthy();
    });

    it("navigates to step 3 on next twice", () => {
        render(
            <PaperProvider>
                <ListingCreateScreen />
            </PaperProvider>
        );
        const nextButton = screen.getByText("Lanjut");

        // Step 1 -> 2
        fireEvent.press(nextButton);
        // Step 2 -> 3
        fireEvent.press(nextButton);

        expect(screen.getByText("Harga")).toBeTruthy();
        expect(screen.getByText("STEP 3")).toBeTruthy();
    });
});
