const CLOUD_NAME = "dnv9olomj";
const UPLOAD_PRESET = "mahichan";

export const uploadToCloudinary = async (
  file: File
): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    // Kiểm tra nếu request không thành công (4xx, 5xx)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Lỗi khi tải ảnh lên Cloudinary"
      );
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};
