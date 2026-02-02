import React from 'react';
import SearchScreen from '../src/screens/Search/SearchScreen';
import { Stack } from 'expo-router';

export default function SearchRoute() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false, animation: 'none' }} />
            <SearchScreen />
        </>
    );
}
