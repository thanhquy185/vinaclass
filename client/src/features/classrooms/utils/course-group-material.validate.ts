const ALLOWED_MATERIAL_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "zip",
  "png",
  "jpg",
  "jpeg",
]);

const MAX_MATERIAL_FILE_SIZE = 25 * 1024 * 1024;

export interface MaterialFileMetadata {
  name: string;
  size: number;
}

export function getCourseGroupMaterialFileError(
  file: MaterialFileMetadata
): string | undefined {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !ALLOWED_MATERIAL_EXTENSIONS.has(extension)) {
    return "courseMaterials.fileTypeInvalid";
  }

  if (file.size > MAX_MATERIAL_FILE_SIZE) {
    return "courseMaterials.fileTooLarge";
  }

  return undefined;
}

export function getCourseGroupMaterialRequiredFileError(
  hasExistingMaterial: boolean,
  hasSelectedFile: boolean
): string | undefined {
  return hasExistingMaterial || hasSelectedFile
    ? undefined
    : "courseMaterials.fileRequired";
}
