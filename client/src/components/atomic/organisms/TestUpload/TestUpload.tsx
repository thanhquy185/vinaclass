import React, { useState } from "react";
import { useUpload } from "@/hooks/useUpload";
import { Icon } from "@/components/atomic/atoms";

const TestUpload = () => {
  const { upload, isLoading, error } = useUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Tạo preview tạm thời bằng Blob (để hiện ảnh ngay lập tức trên máy khách)
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      // 2. Gọi hàm upload từ Hook (đẩy lên Cloudinary)
      const remoteUrl = await upload(file);

      if (remoteUrl) {
        // 3. Cập nhật preview bằng link thật từ Cloudinary
        setPreviewUrl(remoteUrl);
        console.log("Link ảnh từ Cloudinary:", remoteUrl);
        alert("Upload thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi upload:", err);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800">Kiểm tra Upload Ảnh</h2>

      {/* Khung hiển thị ảnh */}
      <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className={`h-full w-full object-contain ${isLoading ? "opacity-50" : "opacity-100"}`}
            />
            {!isLoading && (
              <button
                onClick={handleRemoveImage}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
              >
                <Icon name="close" size={20} />
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <Icon name="image" size={48} className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Chưa có ảnh nào được chọn
            </p>
          </div>
        )}

        {/* Overlay Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-20">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white"></div>
            <p className="mt-2 font-medium text-white">Đang tải lên...</p>
          </div>
        )}
      </div>

      {/* Input chọn file */}
      <div className="flex flex-col gap-3">
        <label className="block text-sm font-medium text-gray-700">
          Chọn ảnh từ máy tính:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        />

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">
            ⚠️ Lỗi: {error.message || "Không thể upload ảnh"}
          </p>
        )}

        {previewUrl && !isLoading && (
          <div className="mt-2 rounded border border-green-200 bg-green-50 p-2">
            <p className="break-all font-mono text-xs text-green-700">
              <strong>URL:</strong> {previewUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUpload;
