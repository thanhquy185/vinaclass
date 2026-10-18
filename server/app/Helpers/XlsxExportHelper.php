<?php

namespace App\Helpers;

use App\Exports\StyledArrayExport;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class XlsxExportHelper
{
    public function buildFileNameNhomHocPhan(array $attributes): string
    {
        $namHoc = (string) ($attributes['namHoc'] ?? 'unknown');
        $hocKy = (string) ($attributes['hocKy'] ?? '0');
        $tenNhomHocPhan = (string) ($attributes['tenNhomHocPhan'] ?? 'nhom-hoc-phan');
        $idNhomHocPhan = (string) ($attributes['idNhomHocPhan'] ?? '0');

        $slugTenNhomHocPhan = Str::slug($tenNhomHocPhan, '-');
        if ($slugTenNhomHocPhan === '') {
            $slugTenNhomHocPhan = 'nhom-hoc-phan';
        }

        return '[' . $namHoc . '-HK' . $hocKy . ']-' . $slugTenNhomHocPhan . '.' . $idNhomHocPhan . '.xlsx';
    }

    public function download(array $fileNameAttributes, array $headerTitles, array $data): BinaryFileResponse
    {
        $fileName = $this->buildFileNameNhomHocPhan($fileNameAttributes);
        return Excel::download(new StyledArrayExport($headerTitles, $data), $fileName);
    }
}
