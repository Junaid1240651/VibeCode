/**
 * Image Paste Hook
 * 
 * A React hook that enables image pasting functionality for textarea elements.
 * Automatically detects image data in clipboard paste events and processes
 * them for upload, with intelligent limit management and memory cleanup.
 * 
 * Key Features:
 * - Automatic clipboard image detection
 * - Multiple image pasting support
 * - Image limit enforcement with user feedback
 * - Memory management with URL cleanup
 * - Event listener management with proper cleanup
 * - File naming for pasted images
 * - Prevention of text paste when images are detected
 * 
 * Integration:
 * - Works seamlessly with useImageUpload hook
 * - Integrates with React Hook Form via imageFormUtils
 * - Provides user feedback via toast notifications
 */

import { useCallback, useEffect, RefObject, useRef } from 'react';
import { toast } from 'sonner';
import { ImageData } from './useImageUpload';

/**
 * Props for useImagePaste hook
 */
interface UseImagePasteProps {
  /** Reference to the textarea element to attach paste listener */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Callback function when images are pasted */
  onImagePaste: (imageData: ImageData) => void;
  /** Current number of images already added */
  currentImageCount: number;
  /** Maximum number of images allowed */
  maxImages: number;
}

/**
 * useImagePaste Hook
 * 
 * Enables image pasting functionality for textarea elements with automatic
 * clipboard monitoring, validation, and memory management.
 * 
 * Workflow:
 * 1. Monitors paste events on target textarea
 * 2. Detects image data in clipboard
 * 3. Validates against image limits
 * 4. Creates preview URLs with cleanup tracking
 * 5. Processes images and calls callback
 * 6. Prevents default text paste for image pastes
 * 
 * @param props - Configuration object with textarea ref and callbacks
 * @returns Object with paste handling functions and cleanup utilities
 * 
 * @example
 * const textareaRef = useRef<HTMLTextAreaElement>(null);
 * const { handleImageUpload, addImageDirectly } = useImageUpload(3);
 * 
 * const { cleanupUrls } = useImagePaste({
 *   textareaRef,
 *   onImagePaste: addImageDirectly,
 *   currentImageCount: uploadedImages.length,
 *   maxImages: 3
 * });
 */
export const useImagePaste = ({ textareaRef, onImagePaste, currentImageCount, maxImages }: UseImagePasteProps) => {
  // Track created blob URLs for proper memory cleanup
  const createdUrlsRef = useRef<Set<string>>(new Set());
  
  /**
   * Cleanup function to revoke all tracked URLs
   * Prevents memory leaks from blob URLs
   */
  const cleanupUrls = useCallback(() => {
    createdUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    createdUrlsRef.current.clear();
  }, []);
  
  /**
   * Revoke a specific URL and remove from tracking
   * Used when individual images are removed
   */
  const revokeUrl = useCallback((url: string) => {
    if (createdUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      createdUrlsRef.current.delete(url);
    }
  }, []);

  /**
   * Handles paste events and processes image data
   * 
   * Detects images in clipboard, validates limits, processes files,
   * and prevents default text paste behavior for image pastes.
   */
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!e.clipboardData) return;

    const items = e.clipboardData.items;
    const imageItems: File[] = [];
    
    // Collect all image items from clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          imageItems.push(file);
        }
      }
    }

    // Exit early if no images found
    if (imageItems.length === 0) return;

    // Enforce image limit
    if (currentImageCount >= maxImages) {
      e.preventDefault();
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Calculate available slots and limit images to process
    const availableSlots = maxImages - currentImageCount;
    const imagesToProcess = imageItems.slice(0, availableSlots);

    // Warn user if some images were skipped due to limits
    if (imageItems.length > availableSlots) {
      toast.warning(`Only ${availableSlots} more images allowed. ${imageItems.length - availableSlots} images were skipped.`);
    }

    // Process allowed images
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

  /**
   * Effect to attach/detach paste event listener
   * Manages textarea event listener lifecycle
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.addEventListener("paste", handlePaste);
    
    return () => {
      textarea.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste, textareaRef]);

  /**
   * Effect to cleanup all tracked URLs on unmount
   * Ensures no memory leaks when component unmounts
   */
  useEffect(() => {
    return () => {
      cleanupUrls();
    };
  }, [cleanupUrls]);

  return { 
    /** Paste event handler function */
    handlePaste,
    /** Function to revoke a specific URL */
    revokeUrl,
    /** Function to cleanup all tracked URLs */
    cleanupUrls
  };
};
