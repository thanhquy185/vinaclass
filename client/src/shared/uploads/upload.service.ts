import { cloudinaryConfig } from "@/shared/uploads/cloudinary.config";

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  const responseData: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      typeof responseData === "object" &&
      responseData !== null &&
      "error" in responseData &&
      typeof responseData.error === "object" &&
      responseData.error !== null &&
      "message" in responseData.error &&
      typeof responseData.error.message === "string"
        ? responseData.error.message
        : "Không thể tải ảnh lên Cloudinary.";

    throw new Error(errorMessage);
  }

  if (
    typeof responseData !== "object" ||
    responseData === null ||
    !("secure_url" in responseData) ||
    typeof responseData.secure_url !== "string"
  ) {
    throw new Error("Cloudinary không trả về đường dẫn ảnh hợp lệ.");
  }

  return responseData.secure_url;
};
