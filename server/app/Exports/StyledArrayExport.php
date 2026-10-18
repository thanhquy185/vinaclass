<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class StyledArrayExport implements FromArray, WithHeadings, WithEvents
{
    private array $headings;

    private array $rows;

    public function __construct(array $headings, array $rows)
    {
        $this->headings = $headings;
        $this->rows = $rows;
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $columnCount = count($this->headings);

                if ($columnCount === 0) {
                    return;
                }

                $lastColumn = Coordinate::stringFromColumnIndex($columnCount);
                $lastRow = count($this->rows) + 1;
                $headerRange = "A1:{$lastColumn}1";
                $fullRange = "A1:{$lastColumn}{$lastRow}";
                $this->applyFontAndBorders($sheet, $fullRange);
                $this->applyHeaderStyle($sheet, $headerRange);
                $this->setColumnWidths($sheet, $columnCount);
                $this->applyColumnFormats($sheet, $lastRow, $columnCount);
            },
        ];
    }

    private function applyFontAndBorders($sheet, string $fullRange): void
    {
        $sheet->getStyle($fullRange)->applyFromArray([
            'font' => [
                'name' => 'Times New Roman',
                'size' => 12,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);
    }

    private function applyHeaderStyle($sheet, string $headerRange): void
    {
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'name' => 'Times New Roman',
                'bold' => true,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => [
                    'argb' => 'FFC6EFCE',
                ],
            ],
        ]);
    }

    private function setColumnWidths($sheet, int $columnCount): void
    {
        for ($index = 1; $index <= $columnCount; $index++) {
            $column = Coordinate::stringFromColumnIndex($index);
            $maxLength = mb_strlen((string) ($this->headings[$index - 1] ?? ''));

            foreach ($this->rows as $row) {
                $cellValue = (string) ($row[$index - 1] ?? '');
                $cellLength = mb_strlen($cellValue);
                if ($cellLength > $maxLength) {
                    $maxLength = $cellLength;
                }
            }

            $width = min($maxLength + 5, 30);
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    private function applyColumnFormats($sheet, int $lastRow, int $columnCount): void
    {
        $phoneIndex = 5;
        if ($columnCount < $phoneIndex || $lastRow < 2) {
            return;
        }

        $phoneColumn = Coordinate::stringFromColumnIndex($phoneIndex);
        $range = sprintf('%s2:%s%d', $phoneColumn, $phoneColumn, $lastRow);
        $sheet->getStyle($range)->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

        // Birthdate is the 6th column (F). Convert string dates to Excel serials and apply date format.
        $dateIndex = 6;
        if ($columnCount >= $dateIndex) {
            $dateColumn = Coordinate::stringFromColumnIndex($dateIndex);
            for ($r = 2; $r <= $lastRow; $r++) {
                $cellCoord = $dateColumn . $r;
                $raw = $sheet->getCell($cellCoord)->getValue();
                if ($raw === null || $raw === '') {
                    continue;
                }

                // If already numeric (Excel serial), skip
                if (is_numeric($raw)) {
                    continue;
                }

                // Try parse with d-m-Y first, then fallback to strtotime
                $dt = \DateTime::createFromFormat('Y-m-d', (string) $raw);
                if ($dt === false) {
                    $ts = strtotime((string) $raw);
                    if ($ts !== false) {
                        $dt = (new \DateTime())->setTimestamp($ts);
                    }
                }

                if ($dt !== false && $dt !== null) {
                    $excelDate = Date::PHPToExcel($dt);
                    $sheet->setCellValue($cellCoord, $excelDate);
                }
            }

            $dateRange = sprintf('%s2:%s%d', $dateColumn, $dateColumn, $lastRow);
            $sheet->getStyle($dateRange)->getNumberFormat()->setFormatCode('dd-mm-yyyy');
        }
    }
}
