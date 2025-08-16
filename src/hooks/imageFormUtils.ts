/**
 * Image Form Utilities
 * 
 * Utility functions for managing image data within React Hook Form instances.
 * Provides type-safe helpers for adding and removing images from form arrays,
 * specifically designed to work with the ImageData structure from useImageUpload.
 * 
 * Key Features:
 * - Type-safe form field manipulation
 * - Seamless integration with React Hook Form
 * - Generic support for any form structure
 * - Automatic array management for image collections
 * - Default field name conventions with customization
 * 
 * Usage:
 * - Works with useImageUpload hook for complete image management
 * - Handles form validation and state synchronization
 * - Supports multiple image forms with different field names
 */

import type { UseFormReturn, FieldValues, Path } from "react-hook-form";
import type { ImageData } from "./useImageUpload";

/**
 * Adds an image to the form's image array field
 * 
 * Appends a new ImageData object to the specified form field array,
 * maintaining type safety and form validation state.
 * 
 * @param form - React Hook Form instance
 * @param imageData - Processed image data from useImageUpload
 * @param field - Form field path (defaults to "imageFiles")
 * 
 * @example
 * const form = useForm<FormData>();
 * const imageData = { file, previewUrl, originalName };
 * addImageToForm(form, imageData);
 * 
 * @example
 * // Custom field name
 * addImageToForm(form, imageData, "attachments");
 */
export function addImageToForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  imageData: ImageData,
  field: Path<T> = "imageFiles" as Path<T>
) {
  const currentFiles = (form.getValues(field) as ImageData[]) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form.setValue(field, [...currentFiles, imageData] as any);
}

/**
 * Removes an image from the form's image array field by index
 * 
 * Removes the image at the specified index from the form field array,
 * updating the form state and maintaining validation integrity.
 * 
 * @param form - React Hook Form instance
 * @param index - Zero-based index of the image to remove
 * @param field - Form field path (defaults to "imageFiles")
 * 
 * @example
 * const form = useForm<FormData>();
 * removeImageFromForm(form, 0); // Remove first image
 * 
 * @example
 * // Custom field name
 * removeImageFromForm(form, 2, "attachments");
 */
export function removeImageFromForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  index: number,
  field: Path<T> = "imageFiles" as Path<T>
) {
  const currentFiles = (form.getValues(field) as ImageData[]) || [];
  const newFiles = currentFiles.filter((_, i: number) => i !== index);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form.setValue(field, newFiles as any);
}