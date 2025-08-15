import { useCallback, useEffect, RefObject } from 'react';
import { toast } from 'sonner';
import { ImageData } from './useImageUpload';

interface UseImagePasteProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onImagePaste: (imageData: ImageData) => void;
  currentImageCount: number;
  maxImages: number;
}

export const useImagePaste = ({ textareaRef, onImagePaste, currentImageCount, maxImages }: UseImagePasteProps) => {
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
      const imageData: ImageData = {
        file,
        previewUrl: URL.createObjectURL(file),
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

  return { handlePaste };
};
