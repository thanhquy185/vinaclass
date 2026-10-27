<?php

namespace App\Services;

use App\Models\CourseGroupMaterial;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CourseGroupMaterialFileService
{
    public function storePrivate(
        UploadedFile $file,
        string $directory,
        string $failureMessage
    ): string
    {
        $path = $file->store($directory, 'private');
        if (!is_string($path)) {
            throw new \RuntimeException($failureMessage);
        }

        return $path;
    }

    public function delete(string $disk, string $path): void
    {
        Storage::disk($disk)->delete($path);
    }

    public function download(CourseGroupMaterial $material)
    {
        $disk = Storage::disk($material->storage_disk);
        abort_unless($disk->exists($material->storage_path), 404);

        $fileName = basename(str_replace('\\', '/', $material->original_file_name));
        $fileName = preg_replace('/[\x00-\x1F\x7F"\\\\]/u', '_', $fileName) ?: 'material';

        return $disk->download($material->storage_path, $fileName, [
            'Content-Type' => $material->mime_type ?: 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
