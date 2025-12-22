/**
 * Cloudinary Service
 * Handles file uploads to Cloudinary using unsigned upload presets.
 */

// Cloudinary configuration using Expo environment variables
// Variables must be prefixed with EXPO_PUBLIC_ to be accessible in the client
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_unsigned_preset';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

/**
 * Uploads a file to Cloudinary
 * @param {string} fileUri - The URI of the file to upload
 * @param {string} folder - The folder path in Cloudinary
 * @param {string} fileName - Optional file name
 * @param {string} mimeType - Optional mime type
 * @returns {Promise<{url: string, publicId: string, fileType: string}>}
 */
export const uploadFileToCloudinary = async (fileUri, folder, fileName = null, mimeType = null) => {
    try {
        const data = new FormData();

        // Prepare the file object
        const name = fileName || fileUri.split('/').pop();
        const extension = name.split('.').pop().toLowerCase();

        // Better mime type detection
        let type = mimeType;
        if (!type) {
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                type = 'image/' + (extension === 'jpg' ? 'jpeg' : extension);
            } else if (extension === 'pdf') {
                type = 'application/pdf';
            } else if (extension === 'zip') {
                type = 'application/zip';
            } else {
                type = 'application/octet-stream';
            }
        }

        data.append('file', {
            uri: fileUri,
            type: type,
            name: name,
        });

        data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        data.append('folder', folder);

        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        const result = await response.json();

        if (result.error) {
            console.error("Cloudinary API Error:", result.error);
            throw new Error(result.error.message || "Failed to upload to Cloudinary");
        }

        return {
            url: result.secure_url,
            publicId: result.public_id,
            fileType: result.format || extension,
        };
    } catch (error) {
        console.error("Cloudinary Upload Service Error:", error);
        throw error;
    }
};

/**
 * Helper to get Cloudinary folder paths
 */
export const CloudinaryFolders = {
    MATERIALS_ADMIN: 'bca-focus/materials/admin',
    MATERIALS_STUDENT: (uid) => `bca-focus/materials/students/${uid}`,
    PROJECTS_INSTRUCTIONS: 'bca-focus/projects/instructions',
    PROJECTS_SUBMISSIONS: (projectId, uid) => `bca-focus/projects/submissions/${projectId}/${uid}`,
    CAREER: 'bca-focus/career',
};
