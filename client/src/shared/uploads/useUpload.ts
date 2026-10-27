import { uploadToCloudinary } from "@/shared/uploads/upload.service";
import { useEntityMutation } from "@/hooks/shared/useEntityMutation";

export const useUpload = () => {
  const mutation = useEntityMutation({
    mutationFn: (file: File) => uploadToCloudinary(file),
  });

  return {
    upload: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    url: mutation.data,
  };
};
