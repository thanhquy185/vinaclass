import { uploadToCloudinary } from "@/services/external/upload.service";
import { useMutation } from "@tanstack/react-query";

export const useUpload = () => {
  const mutation = useMutation({
    mutationFn: (file: File) => uploadToCloudinary(file),
    onSuccess: (url) => {
      console.log("Upload thành công:", url);
    },
    onError: (error) => {
      console.error("Upload thất bại:", error);
    },
  });

  return {
    upload: mutation.mutateAsync, // Dùng mutateAsync để có thể dùng await khi gọi
    isLoading: mutation.isPending, // TanStack Query v5 dùng isPending thay cho isLoading
    error: mutation.error,
    url: mutation.data, // Link ảnh trả về sau khi upload thành công
  };
};
