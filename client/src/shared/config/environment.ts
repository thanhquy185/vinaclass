const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();

export const environment = {
  apiBaseUrl:
    import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000/api",
  webBaseUrl: import.meta.env.VITE_WEB_URL?.trim() || "http://localhost:8000",
  features: {
    permissionManagementV2:
      import.meta.env.VITE_PERMISSION_MANAGEMENT_V2 === "true",
    permissionNavigation:
      import.meta.env.VITE_PERMISSION_NAVIGATION_ENABLED === "true",
  },
  cloudinary: {
    cloudName: cloudName || "dnv9olomj",
    uploadPreset: uploadPreset || "mahichan",
  },
} as const;
