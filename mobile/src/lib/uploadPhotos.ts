import { Alert } from "react-native";
import { api } from "./api";

type UploadMutation = {
    mutateAsync: (variables: { fileName: string; fileType: "image/jpeg" | "image/png" | "image/webp" }) => Promise<{ uploadUrl: string; publicUrl: string }>;
};

/**
 * Upload local photo URIs to Supabase storage
 * Preserves existing remote URLs (http/https)
 * Returns array of public URLs
 */
export async function uploadPhotos(
    localUris: string[],
    uploadPhotoMutation: UploadMutation
): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const uri of localUris) {
        // Skip already uploaded URLs (assume http/https means remote)
        if (uri.startsWith('http')) {
            uploadedUrls.push(uri);
            continue;
        }

        try {
            // 1. Get presigned URL
            const fileName = uri.split('/').pop() || `photo-${Date.now()}.jpg`;
            const { uploadUrl, publicUrl } = await uploadPhotoMutation.mutateAsync({
                fileName,
                fileType: "image/jpeg",
            });

            // 2. Upload file
            const response = await fetch(uri);
            const blob = await response.blob();

            await fetch(uploadUrl, {
                method: "PUT",
                body: blob,
                headers: {
                    "Content-Type": "image/jpeg",
                },
            });

            uploadedUrls.push(publicUrl);
        } catch (error) {
            console.error("Upload failed", error);
            Alert.alert("Error", "Gagal mengupload foto");
            throw error;
        }
    }
    return uploadedUrls;
}
