'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

interface UploadedImage {
  id: string;
  filename: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
}

interface ImageUploadProps {
  multiple?: boolean;
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  maxFiles?: number;
  className?: string;
  imageType?: 'product' | 'icon' | 'banner';
}

export default function ImageUpload({
  multiple = false,
  value = [],
  onChange,
  maxFiles = 10,
  className = '',
  imageType = 'product',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const fileArray = Array.from(files);

      // Check max files
      if (multiple && value.length + fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`);
        setUploading(false);
        return;
      }

      // Validate file types
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const invalidFiles = fileArray.filter(f => !validTypes.includes(f.type));
      if (invalidFiles.length > 0) {
        setError('Only JPEG, PNG, GIF, and WebP images are allowed');
        setUploading(false);
        return;
      }

      // Validate file sizes (10MB max)
      const oversizedFiles = fileArray.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('Maximum file size is 10MB');
        setUploading(false);
        return;
      }

      let uploadedImages: UploadedImage[];

      if (multiple && fileArray.length > 1) {
        uploadedImages = await adminApi.uploadMultipleImages(fileArray, imageType);
      } else {
        const uploaded = await adminApi.uploadImage(fileArray[0], imageType);
        uploadedImages = [uploaded];
      }

      if (multiple) {
        onChange?.([...value, ...uploadedImages]);
      } else {
        onChange?.(uploadedImages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [multiple, value, onChange, maxFiles]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleRemove = useCallback((imageId: string) => {
    onChange?.(value.filter(img => img.id !== imageId));
  }, [value, onChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={openFileDialog}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">
              {dragActive ? 'Drop images here' : 'Click or drag images to upload'}
            </p>
            <p className="text-sm text-gray-400">
              {multiple ? `Up to ${maxFiles} images` : 'Single image'} - JPEG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={image.url}
                alt={image.filename}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {image.filename}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && !uploading && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <ImageIcon className="w-6 h-6 text-gray-400 mr-2" />
          <span className="text-gray-500">No images uploaded</span>
        </div>
      )}
    </div>
  );
}
