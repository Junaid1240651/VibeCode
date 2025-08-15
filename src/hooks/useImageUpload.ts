import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { compressImageFile } from '@/lib/blob-storage';

export interface ImageData {
  file: File;
  previewUrl: string;
  originalName: string;
}

export const useImageUpload = (maxImages: number = 3) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onImageAdd: (imageData: ImageData) => void
  ) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = uploadedImages.length;
    
    if (currentImageCount >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, maxImages - currentImageCount);

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files');
        continue;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file too large. Please use images smaller than 10MB.');
        continue;
      }

      try {
        // Compress the image if needed
        const fileToUpload = file.size > 2 * 1024 * 1024 
          ? await compressImageFile(file, 1200, 900, 0.8)
          : file;
        
        // Create preview URL for display (no upload yet)
        const previewUrl = URL.createObjectURL(fileToUpload);
        
        // Store file object and preview URL for later upload
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

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

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
    
    // Revoke the exact preview URL to free memory
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Remove from images array
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    // Call the callback with both index and URL for form handling
    onImageRemove({ index, previewUrl });
  };

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

  const cleanupPreviewUrls = () => {
    uploadedImages.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setUploadedImages([]);
  };

  const resetImages = () => {
    cleanupPreviewUrls();
  };

  const addImageDirectly = (imageData: ImageData) => {
    if (uploadedImages.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    setUploadedImages(prev => [...prev, imageData.previewUrl]);
  };

  return {
    uploadedImages,
    fileInputRef,
    handleImageUpload,
    removeImage,
    uploadImagesToAzure,
    cleanupPreviewUrls,
    resetImages,
    addImageDirectly,
    isUploading,
  };
};