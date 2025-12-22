import * as DocumentPicker from 'expo-document-picker';
import { uploadFileToCloudinary } from '../services/cloudinaryService';
import { Alert } from 'react-native';

/**
 * Picks a document and uploads it to Cloudinary
 * @param {string} folder - Cloudinary folder path
 * @param {Object} options - DocumentPicker options
 * @returns {Promise<{url: string, publicId: string, fileType: string, fileName: string}>}
 */
export const pickAndUpload = async (folder, options = { type: '*/*' }) => {
    try {
        const result = await DocumentPicker.getDocumentAsync(options);

        if (result.canceled) {
            return null;
        }

        const file = result.assets[0];

        // Show uploading message if needed, or handle in component
        const uploadResult = await uploadFileToCloudinary(
            file.uri,
            folder,
            file.name,
            file.mimeType
        );

        return {
            ...uploadResult,
            fileName: file.name
        };
    } catch (error) {
        console.error("Pick and Upload Error:", error);
        Alert.alert("Upload Failed", error.message || "An error occurred during upload.");
        throw error;
    }
};
