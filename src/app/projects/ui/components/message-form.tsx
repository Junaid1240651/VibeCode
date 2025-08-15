import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, Loader2Icon, PaperclipIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Usage } from "@/modules/home/ui/components/usage";
import { useRouter } from "next/navigation";
import { useImageUpload, ImageData } from "@/hooks/useImageUpload";
import { addImageToForm, removeImageFromForm } from "@/hooks/imageFormUtils";
import { useImagePaste } from "@/hooks/useImagePaste";
import { ImagePreview } from "@/components/ui/image-preview";

interface Props {
  projectId: string;
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Prompt is required" })
    .max(10000, { message: "Prompt is too long" }),
  projectId: z.string().min(1, { message: "Project ID is required" }),
  images: z.array(z.string()).optional(),
  imageFiles: z.array(z.any()).optional(),
});

export const MessageForm = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryclient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: usage } = useQuery(trpc.usage.status.queryOptions());
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        resetImages();
        form.reset();
        queryclient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId })
        );
        queryclient.invalidateQueries(trpc.usage.status.queryOptions());
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === "TOO_MANY_REQUESTS") {
          router.push("/pricing");
        }
      },
    })
  );

  const [isFocused, setIsFocused] = useState(false);
  const {
    uploadedImages,
    fileInputRef,
    handleImageUpload,
    uploadImagesToAzure,
    resetImages,
    addImageDirectly,
    removeImage,
    isUploading,
  } = useImageUpload(3);

  const isPending = createMessage.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
      projectId: projectId,
      images: [],
      imageFiles: [],
    },
  });
  const watchedValue = form.watch("value");
  const isBtnDisabled =
    isPending || isUploading || !watchedValue || watchedValue.trim().length === 0;
  const showUsage = !!usage;

  // Add image to form state when uploaded
  const handleImageAdd = useCallback(
    (imageData: ImageData) => {
      
      addImageToForm(form, imageData);
      // Also update the uploadedImages state for preview display
      addImageDirectly(imageData);
    },
    [form, addImageDirectly]
  );

  // Use the reusable image paste hook
  const { revokeUrl: revokePasteUrl } = useImagePaste({
    textareaRef,
    onImagePaste: handleImageAdd,
    currentImageCount: uploadedImages.length,
    maxImages: 3
  });

  // Remove image from form state when deleted
  const handleImageRemove = (index: number) => {
    // Get the preview URL from the display array
    const previewUrl = uploadedImages[index];
    if (!previewUrl) return;

    // Revoke URL from paste hook if it was created there
    revokePasteUrl(previewUrl);

    // Remove using the preview URL to ensure correct URL revocation
    removeImage(previewUrl, ({ index: removedIndex }) => {
      // Remove from form state using the correct index
      removeImageFromForm(form, removedIndex);
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Upload images to Azure
      const imageUrls = await uploadImagesToAzure(values.imageFiles || []);
      // Create message with uploaded URLs
      await createMessage.mutateAsync({
        value: values.value,
        projectId,
        images: imageUrls,
      });
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };
  return (
    <Form {...form}>
      {showUsage && (
        <Usage
          points={usage.remainingPoints}
          msBeforeNext={usage.msBeforeNext}
        />
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xs",
          showUsage && "rounded-t-none"
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <textarea
              {...field}
              ref={textareaRef}
              disabled={isPending || isUploading}
              className="pt-4 resize-none border-none w-full outline-none bg-transparent min-h-[80px] max-h-[200px] overflow-y-auto scrollbar-hide"
              placeholder="What would you like to build?"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={2}
              style={{ height: '80px' }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (!e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)();
                }
              }}
            />
          )}
        />
        
        {/* Enhanced Image Upload Section */}
        {uploadedImages.length > 0 && (
          <div className="border-t pt-3">
            <ImagePreview
              images={uploadedImages}
              onRemove={handleImageRemove}
              onClearAll={() => {
                resetImages();
                form.setValue("imageFiles", []);
              }}
              maxImages={3}
            />
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e, handleImageAdd)}
          className="hidden"
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="flex items-center gap-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-100"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || isUploading || uploadedImages.length >= 3}
              title={
                isUploading ? "Uploading images..." :
                  uploadedImages.length >= 3 ? "Maximum 3 images reached" :
                    "Upload images"
              }
            >
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            {/* Image count indicator */}
            <div className="text-xs text-muted-foreground">
              {uploadedImages.length}/3 images
            </div>
            
            <div className="text-[10px] text-muted-foreground font-mono">
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span>&#8984;</span>Enter
              </kbd>
              &nbsp;to submit
            </div>
          </div>
          <Button
            className={cn(
              "size-8 rounded-full",
              isBtnDisabled && "bg-muted-foreground border"
            )}
            disabled={isBtnDisabled}
          >
            {isPending || isUploading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
