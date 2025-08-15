import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { XIcon, Trash2Icon, EyeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  images: string[];
  onRemove: (index: number) => void;
  onClearAll?: () => void;
  maxImages?: number;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemove,
  onClearAll,
  maxImages = 3,
  className,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Header with count and clear all button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Reference Images
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {images.length}/{maxImages}
            </span>
          </div>
          
          {onClearAll && images.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
            >
              <Trash2Icon className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        {/* Image grid - optimized for 3 images */}
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              {/* Image container with much smaller aspect ratio */}
              <div className="relative aspect-[3/2] bg-muted rounded-md overflow-hidden border border-border hover:border-primary/50 transition-all duration-200 group-hover:shadow-sm">
                <Image
                  src={image}
                  alt={`Reference ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 640px) 30vw, 100px"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <button
                      type="button"
                      className="h-6 w-6 rounded-full p-0 bg-white/90 hover:bg-white text-black shadow-lg flex items-center justify-center border-0 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                      onClick={() => openImageModal(image)}
                      title="View full size"
                    >
                      <EyeIcon className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="h-6 w-6 rounded-full p-0 bg-white/90 hover:bg-white shadow-lg flex items-center justify-center border-0 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove(index);
                      }}
                      title="Remove image"
                    >
                      <XIcon className="h-3 w-3 text-gray-800" />
                    </button>
                  </div>
                </div>

                {/* Image number badge */}
                <div className="absolute top-0.5 left-0.5 bg-black/70 text-white text-xs px-1 py-0.5 rounded font-medium">
                  {index + 1}
                </div>
              </div>

              {/* Remove button for mobile - always visible and smaller */}
              <button
                type="button"
                className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 opacity-100 transition-all duration-200 bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-lg z-10 flex items-center justify-center border-0 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(index);
                }}
                title="Remove image"
              >
                <XIcon className="h-2.5 w-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>

        {/* Help text */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-border/50">
          <div className="flex items-start gap-2">
            <div className="text-blue-500 mt-0.5">💡</div>
            <div className="space-y-0.5">
              <p className="font-medium">Image Guidelines:</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>• Maximum {maxImages} reference images</li>
                <li>• Supported: PNG, JPG, WebP</li>
                <li>• Click image to view full size</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage}
              alt="Full size preview"
              width={800}
              height={600}
              className="rounded-lg shadow-2xl"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            
            {/* Close button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 h-10 w-10 p-0 bg-white/90 hover:bg-white text-black shadow-lg"
              onClick={closeImageModal}
            >
              <XIcon className="h-5 w-5" />
            </Button>
            
            {/* Download button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-16 h-10 px-3 bg-white/90 hover:bg-white text-black shadow-lg"
              onClick={() => {
                const link = document.createElement('a');
                link.href = selectedImage;
                link.download = 'reference-image';
                link.click();
              }}
            >
              Download
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
