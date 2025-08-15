import { useCallback, useEffect, RefObject, useRef } from 'react';
import { toast } from 'sonner';
import { ImageData } from './useImageUpload';

interface UseImagePasteProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onImagePaste: (imageData: ImageData) => void;
  currentImageCount: number;
  maxImages: number;
}

export const useImagePaste = ({ textareaRef, onImagePaste, currentImageCount, maxImages }: UseImagePasteProps) => {
  // Track created blob URLs for cleanup
  const createdUrlsRef = useRef<Set<string>>(new Set());
  
  // Cleanup function to revoke all tracked URLs
  const cleanupUrls = useCallback(() => {
    createdUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    createdUrlsRef.current.clear();
  }, []);
  
  // Function to revoke a specific URL
  const revokeUrl = useCallback((url: string) => {
    if (createdUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      createdUrlsRef.current.delete(url);
    }
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!e.clipboardData) return;

    const items = e.clipboardData.items;
    const imageItems: File[] = [];
    
    // First, collect all image items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          imageItems.push(file);
        }
      }
    }

    // If no images, return early
    if (imageItems.length === 0) return;

    // Check if we've reached the image limit
    if (currentImageCount >= maxImages) {
      e.preventDefault();
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Calculate how many images we can actually add
    const availableSlots = maxImages - currentImageCount;
    const imagesToProcess = imageItems.slice(0, availableSlots);

    // Show warning if user tried to paste more than allowed
    if (imageItems.length > availableSlots) {
      toast.warning(`Only ${availableSlots} more images allowed. ${imageItems.length - availableSlots} images were skipped.`);
    }

    // Process the allowed images
    imagesToProcess.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      
      // Track the created URL for cleanup
      createdUrlsRef.current.add(previewUrl);
      
      const imageData: ImageData = {
        file,
        previewUrl,
        originalName: file.name || "pasted-image"
      };
      onImagePaste(imageData);
    });

    // Prevent default paste behavior since we handled images
    e.preventDefault();
  }, [onImagePaste, currentImageCount, maxImages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.addEventListener("paste", handlePaste);
    
    return () => {
      textarea.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste, textareaRef]);

  // Cleanup all tracked URLs on unmount
  useEffect(() => {
    return () => {
      cleanupUrls();
    };
  }, [cleanupUrls]);

  return { 
    handlePaste,
    revokeUrl,
    cleanupUrls
  };
};
