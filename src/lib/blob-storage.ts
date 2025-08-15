import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'images';

/**
 * Get Azure Blob Service Client
 */
const getBlobServiceClient = () => {
  if (!connectionString) {
    throw new Error('Azure Storage connection string not configured');
  }
  return BlobServiceClient.fromConnectionString(connectionString);
};

/**
 * Upload image to Azure Blob Storage
 * @param file - The image file to upload
 * @param userId - User ID for organizing files
 * @returns Promise<string> - The blob URL
 */
export const uploadImageToBlob = async (
  file: File,
  userId: string
): Promise<string> => {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  // Ensure container exists
  await containerClient.createIfNotExists({
    access: 'blob', // Public read access for images
  });
  
  const filename = `images/${userId}/${Date.now()}-${crypto.randomUUID()}.jpg`;
  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  
  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Upload with proper content type
  await blockBlobClient.uploadData(arrayBuffer, {
    blobHTTPHeaders: {
      blobContentType: file.type,
      blobCacheControl: 'public, max-age=31536000', // 1 year cache
    },
  });
  
  return blockBlobClient.url;
};

/**
 * Delete image from Azure Blob Storage
 * @param url - The blob URL to delete
 */
export const deleteImageFromBlob = async (url: string): Promise<void> => {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  // Extract blob name from URL
  const urlParts = url.split('/');
  const blobName = urlParts.slice(-3).join('/'); // Get the last 3 parts (images/userId/filename)
  
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};

/**
 * Compress image before upload
 * @param file - The image file to compress
 * @returns Promise<File> - Compressed file
 */
export const compressImageFile = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};