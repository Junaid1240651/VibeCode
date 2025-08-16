/**
 * Image Upload Hook
 * 
 * A comprehensive React hook for handling image upload functionality with
 * preview, compression, validation, and Azure Blob Storage integration.
 * Provides complete image management for forms and user interactions.
 * 
 * Key Features:
 * - Multiple image upload with configurable limits
 * - Automatic image compression for large files
 * - File type and size validation
 * - Preview URL generation and memory management
 * - Parallel upload to Azure Blob Storage
 * - Error handling with user feedback
 * - Memory cleanup and URL revocation
 * 
 * Workflow:
 * 1. User selects images → validation → compression → preview
 * 2. Images stored locally with preview URLs
 * 3. On form submit → batch upload to Azure → get permanent URLs
 * 4. Cleanup preview URLs to prevent memory leaks
 */

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { compressImageFile } from '@/lib/blob-storage';

/**
 * Image data structure for managing uploaded images
 */
export interface ImageData {
  /** The actual file object for uploading */
  file: File;
  /** Temporary blob URL for preview display */
  previewUrl: string;
  /** Original filename for reference */
  originalName: string;
}

/**
 * useImageUpload Hook
 * 
 * Manages the complete image upload lifecycle from selection to cloud storage.
 * Handles validation, compression, previews, and batch uploading to Azure.
 * 
 * @param maxImages - Maximum number of images allowed (default: 3)
 * @returns Object with image management functions and state
 * 
 * @example
 * const MyForm = () => {
 *   const {
 *     uploadedImages,
 *     fileInputRef,
 *     handleImageUpload,
 *     removeImage,
 *     uploadImagesToAzure,
 *     resetImages
 *   } = useImageUpload(5);
 *   
 *   const onSubmit = async (imageFiles) => {
 *     const urls = await uploadImagesToAzure(imageFiles);
 *     // Use permanent URLs in form submission
 *   };
 * };
 */
export const useImageUpload = (maxImages: number = 3) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection and processing
   * 
   * Validates file types and sizes, compresses large images,
   * creates preview URLs, and manages the upload queue.
   * 
   * Validation Rules:
   * - Only image files accepted
   * - Maximum 10MB file size
   * - Respects maxImages limit
   * - Auto-compression for files > 2MB
   * 
   * @param event - File input change event
   * @param onImageAdd - Callback to handle processed image data
   */
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onImageAdd: (imageData: ImageData) => void
  ) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = uploadedImages.length;
    
    // Enforce image limit
    if (currentImageCount >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Process only allowed number of files
    const filesToProcess = Array.from(files).slice(0, maxImages - currentImageCount);

    for (const file of filesToProcess) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files');
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file too large. Please use images smaller than 10MB.');
        continue;
      }

      try {
        // Compress large images for better performance
        const fileToUpload = file.size > 2 * 1024 * 1024 
          ? await compressImageFile(file, 1200, 900, 0.8)
          : file;
        
        // Create preview URL for immediate display
        const previewUrl = URL.createObjectURL(fileToUpload);
        
        // Package image data for form handling
        const imageData: ImageData = {
          file: fileToUpload,
          previewUrl: previewUrl,
          originalName: file.name
        };
        
        onImageAdd(imageData);
        
      } catch {
        toast.error('Failed to process image. Please try again.');
      }
    }

    // Clear the input for next selection
    if (event.target) {
      event.target.value = '';
    }
  };

  /**
   * Removes an image from the upload queue
   * 
   * Handles cleanup of preview URLs and updates the image list.
   * Prevents memory leaks by revoking blob URLs properly.
   * 
   * @param previewUrl - The preview URL of the image to remove
   * @param onImageRemove - Callback with removed image details
   */
  const removeImage = (
    previewUrl: string,
    onImageRemove: (removedImageData: { index: number; previewUrl: string }) => void
  ) => {
    // Find the index of the image to remove
    const index = uploadedImages.findIndex(url => url === previewUrl);
    
    if (index === -1) {
      console.warn('Image not found in uploadedImages:', previewUrl);
      return;
    }
    
    // Revoke the preview URL to free memory
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Remove from images array
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    // Call the callback with removal details
    onImageRemove({ index, previewUrl });
  };

  /**
   * Uploads processed images to Azure Blob Storage
   * 
   * Performs parallel uploads for better performance and handles
   * partial failures gracefully. Returns permanent URLs for storage.
   * 
   * Features:
   * - Parallel upload processing
   * - Error handling for individual uploads
   * - Progress tracking with loading state
   * - Returns only successful upload URLs
   * 
   * @param imageFiles - Array of processed image data to upload
   * @returns Promise resolving to array of permanent Azure URLs
   */
  const uploadImagesToAzure = async (imageFiles: ImageData[]): Promise<string[]> => {
    if (!imageFiles || imageFiles.length === 0) return [];

    setIsUploading(true);
    
    try {
      // Upload images in parallel for better performance
      const uploadPromises = imageFiles.map(async (imageData) => {
        const formData = new FormData();
        formData.append('file', imageData.file);
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const { url } = await response.json();
          return url;
        }
        return null;
      });
      
      // Wait for uploads with error handling
      const results = await Promise.allSettled(uploadPromises);
      const imageUrls = results
        .filter((result): result is PromiseFulfilledResult<string> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      return imageUrls;
    } catch {
      toast.error('Some images failed to upload', { id: 'upload-images' });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Cleans up all preview URLs to prevent memory leaks
   * Revokes blob URLs and clears the uploaded images array
   */
  const cleanupPreviewUrls = () => {
    uploadedImages.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setUploadedImages([]);
  };

  /**
   * Resets the image upload state
   * Alias for cleanupPreviewUrls for better semantic clarity
   */
  const resetImages = () => {
    cleanupPreviewUrls();
  };

  /**
   * Adds an image directly to the upload queue
   * Used for programmatic image addition (e.g., paste functionality)
   * 
   * @param imageData - Processed image data to add
   */
  const addImageDirectly = (imageData: ImageData) => {
    if (uploadedImages.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    setUploadedImages(prev => [...prev, imageData.previewUrl]);
  };

  return {
    /** Array of preview URLs for currently selected images */
    uploadedImages,
    /** Ref for the file input element */
    fileInputRef,
    /** Function to handle file input changes */
    handleImageUpload,
    /** Function to remove an image from the queue */
    removeImage,
    /** Function to upload images to Azure Blob Storage */
    uploadImagesToAzure,
    /** Function to cleanup preview URLs */
    cleanupPreviewUrls,
    /** Function to reset all images */
    resetImages,
    /** Function to add images programmatically */
    addImageDirectly,
    /** Boolean indicating if upload is in progress */
    isUploading,
  };
};