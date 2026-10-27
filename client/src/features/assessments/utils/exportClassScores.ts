import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

export interface ClassScoreExportStudent {
  username: string;
  fullName: string;
  totalScore?: number | null;
}

export interface ClassScoreExportMetadata {
  subjectCode: string;
  subjectName: string;
  groupName: string;
  semester: string | number;
  academicYear: string | number;
  teacherCode: string;
  teacherName: string;
}

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const lastName = parts.pop() ?? "";

  return {
    middleAndFirstNames: parts.join(" "),
    lastName,
  };
};

const sanitizeFileName = (value: string) =>
  value.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, "_");

export const exportClassScores = (
  students: ClassScoreExportStudent[],
  metadata: ClassScoreExportMetadata
): void => {
  const dataRows = students.map((student, index) => {
    const { middleAndFirstNames, lastName } = splitFullName(student.fullName);

    return [
      index + 1,
      metadata.subjectCode,
      student.username,
      middleAndFirstNames,
      lastName,
      student.totalScore == null ? "" : Number(student.totalScore).toFixed(2),
    ];
  });

  const worksheetData = [
    [
      "UBND THÀNH PHỐ HỒ CHÍ MINH",
      "",
      "",
      "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
      "",
      "",
    ],
    ["TRƯỜNG ĐẠI HỌC SÀI GÒN", "", "", "Độc lập - Tự do - Hạnh phúc", "", ""],
    ["", "", "", "", "", ""],
    ["BẢNG ĐIỂM QUÁ TRÌNH", "", "", "", "", ""],
    [
      `Học kì ${metadata.semester}, năm học ${metadata.academicYear}`,
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", ""],
    [
      `Học phần: ${metadata.subjectCode} - ${metadata.subjectName} - Nhóm: ${metadata.groupName}`,
      "",
      "",
      "",
      "",
      "",
    ],
    [
      `Giảng viên: ${metadata.teacherCode} - ${metadata.teacherName}`,
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", ""],
    ["STT", "Mã môn học", "Mã SV", "Họ lót", "Tên", "Điểm kiểm tra"],
    ...dataRows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 5 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 5 } },
  ];

  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
  ];

  const thinBorder = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  const setCellStyle = (
    row: number,
    column: number,
    style: Record<string, unknown>
  ) => {
    const cellReference = XLSX.utils.encode_cell({ r: row, c: column });
    if (!worksheet[cellReference]) return;
    worksheet[cellReference].s = style;
  };

  const setRowStyle = (
    row: number,
    startColumn: number,
    endColumn: number,
    style: Record<string, unknown>
  ) => {
    for (let column = startColumn; column <= endColumn; column += 1) {
      setCellStyle(row, column, style);
    }
  };

  setRowStyle(0, 0, 5, {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: "center", vertical: "center" },
  });
  setRowStyle(1, 0, 5, {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: "center", vertical: "center" },
  });
  setRowStyle(3, 0, 5, {
    font: { bold: true, sz: 18 },
    alignment: { horizontal: "center", vertical: "center" },
  });
  setRowStyle(4, 0, 5, {
    font: { bold: false, sz: 13 },
    alignment: { horizontal: "center", vertical: "center" },
  });
  setRowStyle(6, 0, 5, {
    font: { bold: true, sz: 12 },
    alignment: { horizontal: "left", vertical: "center" },
  });
  setRowStyle(7, 0, 5, {
    font: { bold: true, sz: 12 },
    alignment: { horizontal: "left", vertical: "center" },
  });

  const tableHeaderRow = 9;
  const tableStartRow = 10;
  const tableEndRow = tableStartRow + dataRows.length - 1;

  setRowStyle(tableHeaderRow, 0, 5, {
    font: { bold: true, sz: 12 },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: thinBorder,
    fill: { fgColor: { rgb: "E9ECEF" } },
  });

  for (let row = tableStartRow; row <= tableEndRow; row += 1) {
    for (let column = 0; column <= 5; column += 1) {
      setCellStyle(row, column, {
        font: { sz: 11 },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true,
        },
        border: thinBorder,
      });
    }
  }

  worksheet["!rows"] = [
    { hpt: 26 },
    { hpt: 24 },
    { hpt: 10 },
    { hpt: 32 },
    { hpt: 22 },
    { hpt: 10 },
    { hpt: 20 },
    { hpt: 20 },
    { hpt: 10 },
    { hpt: 24 },
    ...Array.from({ length: dataRows.length }, () => ({ hpt: 20 })),
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng điểm");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const fileName = sanitizeFileName(
    `Bang-diem-qua-trinh_${metadata.subjectCode}_nhom-${metadata.groupName}_HK-${metadata.semester}_NH-${metadata.academicYear}.xlsx`
  );

  saveAs(
    new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName
  );
};
