import React from "react";
import { StyleSheet, View, ImageBackground, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CategoryCardProps {
    title: string;
    imageUrl: string;
    onPress: () => void;
}

export function CategoryCard({ title, imageUrl, onPress }: CategoryCardProps) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
            <ImageBackground source={{ uri: imageUrl }} style={styles.imageBackground} imageStyle={styles.image}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <Text variant="titleMedium" style={styles.title}>{title}</Text>
                        <View style={styles.exploreContainer}>
                            <MaterialCommunityIcons name="arrow-right-circle" size={14} color="white" />
                            <Text variant="labelSmall" style={styles.exploreText}>EXPLORE MORE</Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 160,
        height: 100,
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
    },
    image: {
        borderRadius: 12,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 12,
    },
    content: {
        justifyContent: 'flex-end',
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    exploreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exploreText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 4,
        fontSize: 10,
    },
});
