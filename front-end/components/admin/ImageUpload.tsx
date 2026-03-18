"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<"product" | "icon">("product");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      // Reset status on new file selection
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file); // Backend expects 'files' for multiple upload
    });
    formData.append("type", uploadType);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://alraay.com/api";
      // Remove /api suffix if it exists to avoid double /api/api
      // But wait, the backend controller is @Controller('upload'), so it should be at /upload
      // If NEXT_PUBLIC_API_URL includes /api, we should use it.
      // Usually NestJS app.setGlobalPrefix('api') is used.
      // Let's assume the variable points to the base API URL.

      const response = await fetch(`${apiUrl}/upload/multiple`, {
        method: "POST",
        body: formData,
        credentials: 'include', // cookies are sent automatically
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const result = await response.json();
      // Result is array of objects { url: string, ... }
      const urls = result.map((img: any) => img.url);

      setUploadedUrls((prev) => [...prev, ...urls]);
      setSelectedFiles([]); // Clear selection after upload
    } catch (err) {
      console.error(err);
      setError("خطأ في عملية الرفع. تأكد من تشغيل الخادم وصلاحياتك (Admin).");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        رفع الصور (Backend)
      </h2>

      <div className="space-y-6">
        {/* Type Selection */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setUploadType("product")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${uploadType === "product"
              ? "bg-white dark:bg-gray-700 shadow text-primary"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
          >
            صور منتجات (800px)
          </button>
          <button
            onClick={() => setUploadType("icon")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${uploadType === "icon"
              ? "bg-white dark:bg-gray-700 shadow text-primary"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
          >
            أيقونات / شعارات (120px)
          </button>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-lg">اختر صور للرفع</p>
              <p className="text-sm text-gray-500 mt-1">
                يمكنك اختيار أكثر من صورة (JPG, PNG, WebP)
              </p>
            </div>
            <Button variant="outline" type="button" onClick={() => document.getElementById("file-upload")?.click()}>
              استعراض الملفات
            </Button>
          </label>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-500">الملفات المختارة ({selectedFiles.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="relative group aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-contain bg-black/10"
                  />
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate text-center">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                "رفع ومتابعة"
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Uploaded Results */}
        {uploadedUrls.length > 0 && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-green-500" />
              تم الرفع بنجاح
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedUrls.map((url, idx) => (
                <div key={idx} className="space-y-2">
                  <div className={`relative aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2 ${uploadType === 'icon' ? 'p-8' : ''}`}>
                    <Image
                      src={url}
                      alt="Uploaded"
                      width={uploadType === 'icon' ? 120 : 300}
                      height={uploadType === 'icon' ? 120 : 300}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={url}
                      className="text-xs w-full bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-700 select-all"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
