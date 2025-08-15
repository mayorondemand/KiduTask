/** biome-ignore-all lint/complexity/useOptionalChain: <No issue> */
"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, X, AlertCircle, Loader2 } from "lucide-react";
import { 
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitUploadNetworkError,
  ImageKitServerError,
} from "@imagekit/next";
import Image from "next/image";

interface ImageUploaderProps {
  nameToUse: string;
  folderToUse: string;
  onUploadSuccess: (url: string, fileId: string) => void;
  onUploadError?: (error: string) => void;
  currentImageUrl?: string;
  onRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

interface AuthParams {
  signature: string;
  expire: number;
  token: string;
  publicKey: string;
}

export function ImageUploader({
  onUploadSuccess,
  onUploadError,
  currentImageUrl,
  onRemove,
  nameToUse,
  folderToUse,
  accept = "image/*",
  maxSize = 5,
  className,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { setNodeRef } = useDroppable({
    id: "image-uploader",
  });

  const authenticator = async (): Promise<AuthParams> => {
    try {
      const response = await fetch("/api/upload-auth");
      if (!response.ok) {
        throw new Error("Failed to get upload authentication");
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Authentication failed: ${error}`);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please select an image file";
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onUploadError) onUploadError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      // Get authentication parameters
      const authParams = await authenticator();
      const { signature, expire, token, publicKey } = authParams;

      // Upload to ImageKit
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: nameToUse,
        folder: folderToUse,
        onProgress: (event) => {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        },
        abortSignal: abortControllerRef.current.signal,
      });
      if (!uploadResponse.url || !uploadResponse.fileId) {
        throw new Error("Upload failed");
      }
      // Success
      onUploadSuccess(uploadResponse.url, uploadResponse.fileId);
      setIsUploading(false);
      setUploadProgress(100);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);

      let errorMessage = "Upload failed";

      if (error instanceof ImageKitAbortError) {
        errorMessage = "Upload was cancelled";
      } else if (error instanceof ImageKitInvalidRequestError) {
        errorMessage = `Invalid request: ${error.message}`;
      } else if (error instanceof ImageKitUploadNetworkError) {
        errorMessage = `Network error: ${error.message}`;
      } else if (error instanceof ImageKitServerError) {
        errorMessage = `Server error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  const handleChooseFile = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleRemove = () => {
    onRemove?.();
    setError(null);
    setUploadProgress(0);
  };

  // Show current image if uploaded
  if (currentImageUrl && !isUploading) {
    return (
      <div className={cn("relative", className)}>
        <div className="relative rounded-lg overflow-hidden border border-border">
          <div className="w-full h-48 object-cover">
          <Image
            src={currentImageUrl}
            alt="Uploaded banner"
            className="object-cover"
            fill
          />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleChooseFile}
              disabled={disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload file"
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        role="dialog"
        ref={setNodeRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver && !disabled && !isUploading
            ? "border-primary bg-primary/5"
            : "border-border",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "pointer-events-none"
        )}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin rounded-full h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Uploading... {Math.round(uploadProgress)}%
              </p>
              <Progress value={uploadProgress} className="h-2" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drop your image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse (PNG, JPG up to {maxSize}MB)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={handleChooseFile}
              disabled={disabled}
            >
              Choose File
            </Button>
          </>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
