---
name: Frontend Mobile Developer
description: Guidelines for React Native + Expo development on DigiSecond marketplace - screens, navigation, Paper components
---

# Frontend Mobile Developer Skill

## Your Scope

You own the **React Native mobile application**:

```
mobile/
├── src/
│   ├── screens/        # Screen components
│   ├── components/     # Reusable components
│   ├── navigation/     # Stack/Tab navigators
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities, API client
│   └── stores/         # Zustand stores
├── app.json            # Expo config
└── package.json
```

> **IMPORTANT**: Use shared design tokens for colors and typography. See: `.agent/skills/shared-design-tokens/SKILL.md`

---

## Workflow: Adding a New Screen

### 1. Check spec.md for requirements

```bash
cat ../docs/spec.md | grep -A 10 "User Story"
```

### 2. Create the screen

```typescript
// mobile/src/screens/ListingDetailsScreen.tsx
import { View, ScrollView } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { api } from "../lib/api";

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: listing, isLoading, error } = api.listing.getById.useQuery({ id });
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  if (error) {
    return <ErrorScreen message={error.message} />;
  }
  
  return (
    <ScrollView style={{ flex: 1 }}>
      <PhotoCarousel photos={listing.photos} />
      
      <View style={{ padding: 16 }}>
        <Text variant="headlineMedium">{listing.title}</Text>
        <Text variant="titleLarge" style={{ color: "#22c55e", marginTop: 8 }}>
          Rp {listing.price.toLocaleString("id-ID")}
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>
          {listing.description}
        </Text>
        
        <Button
          mode="contained"
          onPress={() => handleBuy(listing.id)}
          style={{ marginTop: 24 }}
        >
          Buy Now
        </Button>
      </View>
    </ScrollView>
  );
}
```

### 3. Add to navigation

```typescript
// mobile/src/navigation/MainStack.tsx
import { Stack } from "expo-router";

export default function MainStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "DigiSecond" }} />
      <Stack.Screen name="listings/[id]" options={{ title: "Listing" }} />
      <Stack.Screen name="transactions/[id]" options={{ title: "Transaction" }} />
    </Stack>
  );
}
```

---

## Workflow: Using tRPC Client (Shared with Web)

### API Client Setup

```typescript
// mobile/src/lib/api.ts
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../src/server/api/root"; // Import from web

export const api = createTRPCReact<AppRouter>();

export function getApiClient(token: string | null) {
  return api.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
        headers: () => ({
          Authorization: token ? `Bearer ${token}` : "",
        }),
      }),
    ],
  });
}
```

### Query Example

```typescript
// In any screen or component
const { data, isLoading, refetch } = api.listing.search.useQuery({
  query: searchQuery,
  limit: 20,
});
```

### Mutation Example

```typescript
const createListing = api.listing.create.useMutation({
  onSuccess: (data) => {
    router.push(`/listings/${data.id}`);
  },
  onError: (error) => {
    Alert.alert("Error", error.message);
  },
});

const handleSubmit = () => {
  createListing.mutate({
    title,
    description,
    price,
    categoryId,
  });
};
```

---

## React Native Paper Components

### Theme Setup

Use the shared design tokens from `.agent/skills/shared-design-tokens/SKILL.md`:

```typescript
// mobile/src/lib/theme.ts
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

const sharedColors = {
  primary: "#22c55e",
  primaryContainer: "#16a34a",
  secondary: "#3b82f6",
  secondaryContainer: "#2563eb",
  error: "#ef4444",
  errorContainer: "#fecaca",
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...sharedColors,
    background: "#ffffff",
    surface: "#fafafa",
    onSurface: "#171717",
    onSurfaceVariant: "#737373",
    outline: "#e5e5e5",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...sharedColors,
    background: "#171717",
    surface: "#262626",
    onSurface: "#fafafa",
    onSurfaceVariant: "#a3a3a3",
    outline: "#404040",
  },
};
```

### Common Components

```typescript
// Buttons
<Button mode="contained" onPress={handleBuy}>Buy Now</Button>
<Button mode="outlined" onPress={handleCancel}>Cancel</Button>
<Button mode="text" onPress={handleMore}>See More</Button>

// Cards
<Card onPress={() => router.push(`/listings/${listing.id}`)}>
  <Card.Cover source={{ uri: listing.photos[0] }} />
  <Card.Title title={listing.title} subtitle={`Rp ${listing.price}`} />
</Card>

// Inputs
<TextInput
  label="Title"
  value={title}
  onChangeText={setTitle}
  mode="outlined"
/>

// Lists
<List.Section title="Categories">
  <List.Item
    title="Mobile Legends"
    left={props => <List.Icon {...props} icon="gamepad" />}
    onPress={() => filterByCategory("ml")}
  />
</List.Section>
```

---

## Navigation Patterns

### Tab Navigation

```typescript
// mobile/src/navigation/TabNavigator.tsx
import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";

export default function TabNavigator() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Icon source="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <Icon source="magnify" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: ({ color }) => <Icon source="plus-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => <Icon source="receipt" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Icon source="account" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Stack Navigation with Params

```typescript
// Navigate with params
router.push({
  pathname: "/listings/[id]",
  params: { id: listing.id },
});

// Read params in screen
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## State Management (Zustand)

### Auth Store

```typescript
// mobile/src/stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Usage

```typescript
// In any component
const { token, user, clearAuth } = useAuthStore();

// Check auth
if (!token) {
  router.replace("/login");
}
```

---

## Image/Photo Handling

### Camera Integration

```typescript
// mobile/src/components/PhotoPicker.tsx
import * as ImagePicker from "expo-image-picker";
import { Button } from "react-native-paper";

export function PhotoPicker({ onPhotosSelected }: { onPhotosSelected: (uris: string[]) => void }) {
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });
    
    if (!result.canceled) {
      onPhotosSelected(result.assets.map((a) => a.uri));
    }
  };
  
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    
    if (!result.canceled) {
      onPhotosSelected([result.assets[0].uri]);
    }
  };
  
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Button mode="outlined" onPress={pickFromGallery} icon="image">
        Gallery
      </Button>
      <Button mode="outlined" onPress={takePhoto} icon="camera">
        Camera
      </Button>
    </View>
  );
}
```

### Upload to Supabase

```typescript
// mobile/src/lib/upload.ts
import { createClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export async function uploadPhoto(uri: string, path: string) {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  const { data, error } = await supabase.storage
    .from("listing-photos")
    .upload(path, decode(base64), {
      contentType: "image/jpeg",
    });
  
  if (error) throw error;
  
  return supabase.storage.from("listing-photos").getPublicUrl(data.path).data.publicUrl;
}
```

---

## Real-time Chat (Supabase Realtime)

```typescript
// mobile/src/hooks/useChat.ts
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function useChat(transactionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `transaction_id=eq.${transactionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);
  
  return messages;
}
```

---

## Biometric Auth

```typescript
// mobile/src/lib/biometrics.ts
import * as LocalAuthentication from "expo-local-authentication";

export async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return false;
  
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate to continue",
    fallbackLabel: "Use PIN",
  });
  
  return result.success;
}
```

---

## Testing

### Component Tests

```typescript
// mobile/src/screens/__tests__/ListingDetailsScreen.test.tsx
import { render, screen } from "@testing-library/react-native";
import ListingDetailsScreen from "../ListingDetailsScreen";

jest.mock("../lib/api", () => ({
  api: {
    listing: {
      getById: {
        useQuery: () => ({
          data: { title: "Test Listing", price: 100000 },
          isLoading: false,
        }),
      },
    },
  },
}));

describe("ListingDetailsScreen", () => {
  it("renders listing details", () => {
    render(<ListingDetailsScreen />);
    
    expect(screen.getByText("Test Listing")).toBeTruthy();
    expect(screen.getByText("Rp 100.000")).toBeTruthy();
  });
});
```

### Run Tests

```bash
cd mobile
pnpm test
```

---

## Build & Deploy

### Development

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### EAS Build

```bash
# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

---

## Coordination

- **API ready**: Check backend procedures before implementing screens
- **Shared schemas**: Import Zod schemas from `src/lib/schemas.ts` (web)
- **Design parity**: Match colors, spacing with web (use same design tokens)
- **Deep linking**: Coordinate URL structure with web for shared links
