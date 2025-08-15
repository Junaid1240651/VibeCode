import type { UseFormReturn, FieldValues, Path } from "react-hook-form";
import type { ImageData } from "./useImageUpload";

/**
 * Adds an image to the form's imageFiles array.
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
 * Removes an image from the form's imageFiles array by index.
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