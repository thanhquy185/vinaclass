/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Icon, Input } from "@/components/atomic/atoms";
import Divider from "@/components/atomic/atoms/Divider/Divider";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import Tabs from "@/components/atomic/molecules/Tabs/Tabs";
import type { TableColumn } from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import DynamicTable from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import { useEffect, useMemo, useState } from "react";
import StatSection from "@/components/atomic/organisms/StatSection/StatSection";
import { useLocation, useNavigate } from "react-router-dom";
import { useExamStore } from "@/stores/useExamStore";
import {
  getDefaultAvatar,
  getProgressColor,
  getTestsStatus,
  getVariantDeThiWithStatus,
} from "@/utils";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { StatusLabel } from "@/components/atomic/atoms/StatusLabel/StatusLabel";
import {
  useCourseGroupDetail,
  useCourseGroupStudents,
} from "@/hooks/useCourseGroup";
import { useExamActions } from "@/hooks/useExamActions";
import { useDifficulties } from "@/hooks/useDifficulty";
import type { ExamAttempt, StudentResult } from "@/types";
import { Overlay } from "@/components/atomic/molecules/Overlay/Overlay";
import ExamResultOverview from "@/components/atomic/organisms/ExamResultOverview/ExamResultOverview";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useExamDetail } from "@/hooks/useDeThi";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

type ViewMode = "user" | "question" | "difficulty";

export default function ResultPage() {
  const [selectedTab, setSelectedTab] = useState<"stat" | "classScore">(
    "classScore"
  );
  const [viewMode, setViewMode] = useState<ViewMode>("user");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { testData } = useDeThiStore();
  const { pathname } = useLocation();
  const parts = pathname.split("/");
  // parts sẽ là ["", "tests", "22", "result", "23"]

  console.log(pathname);
  useExamDetail(Number(parts[2]) || 0);
  const { courseGroup } = useCourseGroupDetail(Number(parts[4]));
  const { students } = useCourseGroupStudents(Number(parts[4]));
  const [openResultModal, setOpenResultModal] = useState(false);
  const handleClose = () => setOpenResultModal(false);

  const { examResults } = useExamActions(courseGroup?.id, testData?.id);

  const handleStartExam = () => {
    // Chuyển hướng thẳng vào trang làm bài (mặc định mode là STUDENT)
    useExamStore.getState().mode = "PREVIEW";
    navigate(`/tests/1/take`);
  };

  const splitFullName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { hoLot: "", ten: "" };
    }

    const ten = parts.pop() || "";
    return {
      hoLot: parts.join(" "),
      ten,
    };
  };

  // --- 1. Cấu hình Cột (Columns) theo ViewMode ---
  const columns = useMemo(() => {
    const ProgressBar = ({
      percent,
      colorClass,
    }: {
      percent: number;
      colorClass: string;
    }) => {
      const [currentWidth, setCurrentWidth] = useState(0);

      useEffect(() => {
        // Kích hoạt animation sau khi component đã mount
        const timer = setTimeout(() => setCurrentWidth(percent), 50);
        return () => clearTimeout(timer);
      }, [percent]);

      return (
        <div className="h-2 w-32 overflow-hidden rounded-full bg-action-focus">
          <div
            className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
            style={{
              width: `${currentWidth}%`,
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      );
    };

    // Render chung cho cột phần trăm
    const renderPercent = (val: number) => {
      // Đảm bảo percent luôn hợp lệ
      const percent = Math.min(Math.max(val, 0), 100);
      const colorClass = getProgressColor(percent);

      return (
        <div className="flex items-center gap-2">
          <ProgressBar percent={percent} colorClass={colorClass} />
          <span className="text-body-2 min-w-[35px] font-semibold duration-1000 animate-in fade-in">
            {percent.toFixed(0)}%
          </span>
        </div>
      );
    };

    if (viewMode === "user") {
      return [
        {
          title: t("resultPage.columns.studentId"),
          key: "username", // SỬA: từ 'mssv' thành 'ma' theo TaiKhoan interface
          render: (val: any, item: StudentResult) => (
            <span>{item.isAverage ? "" : val}</span>
          ),
        },
        {
          title: t("resultPage.columns.fullName"),
          key: "hoTen",
          render: (val: any, item: StudentResult) => (
            <div className="flex items-center gap-3">
              {!item.isAverage ? (
                <img
                  src={getDefaultAvatar(val)}
                  alt={t("resultPage.avatarAlt")}
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <Icon name={"groupUser"} size={20} />
              )}
              <span
                className={item.isAverage ? "font-bold text-primary-main" : ""}
              >
                {val}
              </span>
            </div>
          ),
        },
        {
          title: t("resultPage.columns.percent"),
          key: "phanTram",
          render: (_val, item: StudentResult) =>
            renderPercent(
              ((Number(item.examAttempt?.totalScore) || 0) / 10) * 100
            ),
        },
        {
          title: t("resultPage.columns.score"),
          key: "baiLam",
          className: "text-center",
          render: (_, item) => {
            const diem = item?.examAttempt?.totalScore;

            if (diem === undefined || diem === null) {
              return "—";
            }

            return `${Number(diem).toFixed(2)}/10`;
          },
        },
        {
          title: t("resultPage.columns.startTime"),
          key: "baiLam",
          className: "text-center",
          render: (val: ExamAttempt) =>
            val?.startTime
              ? new Date(val.startTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—",
        },
        {
          title: t("resultPage.columns.switchCount"),
          key: "baiLam",
          className: "text-center",
          render: (val: ExamAttempt) => {
            const count = val?.examAttemptLog?.tabSwitchCount;

            if (count === undefined || count === null) {
              return "—";
            }

            return (
              <span
                className={
                  count > 0 ? "text-alert-error-main" : "text-text-primary"
                }
              >
                {count}
              </span>
            );
          },
        },
      ] as TableColumn<StudentResult>[];
    }

    return [
      { title: t("resultPage.columns.stt"), key: "stt", className: "w-16" },
      {
        title:
          viewMode === "difficulty"
            ? t("resultPage.columns.difficultyLevel")
            : t("resultPage.columns.questionContent"),
        key: "noiDung",
      },
      {
        title: t("resultPage.columns.correctRate"),
        key: "phanTram",
        render: (_, item) => renderPercent(item.phanTram),
      },
      {
        title: t("resultPage.columns.avgScore"),
        key: "diem",
        className: "text-center",
      },
    ] as TableColumn<any>[];
  }, [viewMode]);

  const { difficulties } = useDifficulties();

  const tableData = useMemo(() => {
    const allCauHois = testData?.questions || [];
    const currentBaiLams = examResults?.examAttempts || [];
    const validBaiLams = currentBaiLams.filter(
      (bl) => bl.examAttempt.status === "SUBMITTED"
    );

    // --- 1. MODE: THEO NGƯỜI LÀM (USER) ---
    if (viewMode === "user") {
      let sumScoreExams = 0;

      const data_2 = students.map((item) => {
        const baiLamSinhVien = validBaiLams.find(
          (i) => i.examAttempt.studentId === item.id
        );
        sumScoreExams += Number(baiLamSinhVien?.examAttempt.totalScore) || 0;
        return {
          ...item,
          isAverage: false,
          courseGroup,
          examAttempt: baiLamSinhVien?.examAttempt,
        } as StudentResult;
      });

      if (sortOrder) {
        data_2.sort((a, b) => {
          const scoreA = Number(a.examAttempt?.totalScore) || 0;
          const scoreB = Number(b.examAttempt?.totalScore) || 0;
          return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
        });
      }

      const avgRow = {
        ...data_2[0],
        id: -1,
        username: "31235600",
        fullName: t("resultPage.classAverage"),
        isAverage: true,
        examAttempt: {
          totalScore: sumScoreExams / (students.length || 1),
        },
      } as StudentResult;

      console.log(data_2);

      const result = [avgRow, ...data_2];
      return result;
    }

    // --- 2. MODE: THEO CÂU HỎI (Thống kê tỉ lệ đúng/sai từng câu) ---
    if (viewMode === "question") {
      const questionsData = allCauHois.map((ch, index) => {
        const dapAnDung = ch.answerOptions.find((item) => item.isCorrectAnswer);

        // 2. Đếm số lượng người trả lời đúng
        const correctCount = validBaiLams.filter((bl) => {
          const cauHoiTrongBaiLam = bl.questions.find(
            (item) => item.id === ch.id
          );
          return cauHoiTrongBaiLam?.selectedAnswer === dapAnDung?.id;
        }).length;

        const percent =
          ((correctCount * 1.0) /
            (students.length !== 0 ? students.length : 1)) *
          100;

        return {
          id: ch.id,
          stt: index + 1,
          noiDung: ch.questionContent,
          phanTram: percent,
          // Điểm TB câu hỏi = % đúng * điểm của câu đó
          diem: ((percent / 100) * Number(ch.defaultScore || 1)).toFixed(2),
        };
      });

      if (sortOrder) {
        questionsData.sort((a, b) => {
          return sortOrder === "asc"
            ? a.phanTram - b.phanTram
            : b.phanTram - a.phanTram;
        });
      }

      return questionsData;
    }
    // --- MODE: DIFFICULTY (FIXED HERE) ---
    if (viewMode === "difficulty") {
      const difficultyData = (difficulties || []).map((difficulty, index) => {
        const tongSoCau =
          (testData?.questions?.filter((i) => i.difficultyId === difficulty.id)
            .length || 0) * students.length;

        let tongSoCauDung = 0;

        validBaiLams.forEach((item) => {
          const soCauDungMoiBai = item.questions.filter((ch) => {
            const daAnId = ch.answerOptions.find(
              (ctl) => ctl.isCorrectAnswer
            )?.id;
            return ch.difficultyId === difficulty.id && ch.selectedAnswer === daAnId;
          }).length;

          tongSoCauDung += soCauDungMoiBai || 0;
        });

        const percent = (tongSoCauDung / (tongSoCau || 1)) * 100;
        return {
          id: `dk-${difficulty.id}`,
          stt: index + 1,
          noiDung: difficulty.difficultyName,
          phanTram: percent,
          diem: (percent / 10).toFixed(2), // Điểm TB hệ 10 của mức độ này
        };
      });

      if (sortOrder) {
        difficultyData.sort((a, b) => {
          return sortOrder === "asc"
            ? a.phanTram - b.phanTram
            : b.phanTram - a.phanTram;
        });
      }

      return difficultyData;
    }

    return [];
  }, [
    testData?.questions,
    examResults?.examAttempts,
    viewMode,
    students,
    courseGroup,
    difficulties,
    sortOrder,
  ]);

  const userModeTableData = useMemo(() => {
    if (viewMode !== "user") {
      return [] as StudentResult[];
    }

    return (tableData as StudentResult[]).filter((item) => !item.isAverage);
  }, [tableData, viewMode]);

  const status = getTestsStatus(
    testData?.startTime,
    testData?.endTime,
    new Date()
  );

  const { reviewExam } = useExamActions();

  const { startLoading, stopLoading } = useLoadingStore();
  const handleViewResult = async (examAttemptId: number) => {
    useExamStore.getState().mode = "STUDENT";
    try {
      startLoading();
      // Gọi action review bài thi (đã bao gồm logic setFinalResult vào Store)
      await reviewExam(examAttemptId);

      // Sau khi dữ liệu đã vào Store thành công, mở Modal
      setOpenResultModal(true);
    } catch (error) {
      stopLoading();
      console.error("Lỗi khi tải kết quả:", error);
      // Bạn có thể thêm Toast thông báo lỗi ở đây
    } finally {
      stopLoading();
    }
  };

  const handleExportScores = () => {
    if (viewMode !== "user" || userModeTableData.length === 0) {
      return;
    }

    const maMonHoc =
      testData?.subject?.subjectCode ||
      courseGroup?.subject?.subjectCode ||
      "---";
    const tenMonHoc =
      testData?.subject?.subjectName ||
      courseGroup?.subject?.subjectName ||
      "---";
    const groupName = courseGroup?.groupName || "---";
    const semester = courseGroup?.semester ?? "---";
    const academicYear = courseGroup?.academicYear ?? "---";
    const maGiangVien =
      courseGroup?.teacher?.code ||
      testData?.creator?.code ||
      testData?.creator?.username ||
      "---";
    const tenGiangVien =
      courseGroup?.teacher?.fullName || testData?.creator?.fullName || "---";

    const dataRows = userModeTableData.map((item, index) => {
      const { hoLot, ten } = splitFullName(item.fullName || "");

      return [
        index + 1,
        maMonHoc,
        item.username || "",
        hoLot,
        ten,
        item.examAttempt?.totalScore !== null &&
        item.examAttempt?.totalScore !== undefined
          ? Number(item.examAttempt.totalScore).toFixed(2)
          : "",
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
      [`Học kì ${semester}, năm học ${academicYear}`, "", "", "", "", ""],
      ["", "", "", "", "", ""],
      [
        `Học phần: ${maMonHoc} - ${tenMonHoc} - Nhóm: ${groupName}`,
        "",
        "",
        "",
        "",
        "",
      ],
      [`Giảng viên: ${maGiangVien} - ${tenGiangVien}`, "", "", "", "", ""],
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

    const borderThin = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    const setCellStyle = (
      r: number,
      c: number,
      style: Record<string, unknown>
    ) => {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = style;
    };

    const setRowStyle = (
      row: number,
      startCol: number,
      endCol: number,
      style: Record<string, unknown>
    ) => {
      for (let c = startCol; c <= endCol; c += 1) {
        setCellStyle(row, c, style);
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
      border: borderThin,
      fill: { fgColor: { rgb: "E9ECEF" } },
    });

    for (let r = tableStartRow; r <= tableEndRow; r += 1) {
      for (let c = 0; c <= 5; c += 1) {
        setCellStyle(r, c, {
          font: { sz: 11 },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: borderThin,
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

    const fileName =
      `Bang-diem-qua-trinh_${maMonHoc}_nhom-${groupName}_HK-${semester}_NH-${academicYear}.xlsx`
        .replace(/[\\/:*?"<>|]/g, "-")
        .replace(/\s+/g, "_");

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      fileName
    );
  };

  return (
    <MainContentLayout hasFooter={false} classname="w-full">
      {" "}
      {/* Overview */}
      <div className="flex flex-col rounded-md bg-background-body-background p-8 pb-0">
        <div className="flex-bet-center">
          <div className="text-body-1 flex items-center gap-2 text-alert-info-content">
            <Icon name="testsOverview" />
            <span>{t("resultPage.overview.title")}</span>
          </div>

          <div className="flex-bet-center gap-3">
            <StatusLabel variant={getVariantDeThiWithStatus(status.status)}>
              {status.label}{" "}
            </StatusLabel>
            <Divider orientation="vertical" />
            <Button
              variant={"outline"}
              size={"small"}
              onClick={handleStartExam}
            >
              <Icon name="play" /> {t("resultPage.overview.preview")}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-3 pb-8 pt-5">
            <div className="flex flex-col gap-2">
              <div className="text-h5 text-text-primary">
                {testData?.examName}
              </div>
              {/* infor */}
              <div className="flex flex-col gap-2 text-text-secondary">
                <div className="flex items-center gap-1">
                  <Icon name="groupUser" size={20} />
                  <span className="text-body-1">{courseGroup?.groupName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col rounded-md bg-background-body-background">
        {/*  */}
        <Tabs
          value={selectedTab}
          onChange={(value) => setSelectedTab(value as "stat" | "classScore")}
          tabs={[
            { value: "classScore", label: t("resultPage.tabs.classScore") },
            { value: "stat", label: t("resultPage.tabs.stat") },
          ]}
          className="border-b border-other-outlined-border"
        />

        {/*  */}
        {selectedTab === "classScore" && (
          <div className="border-other-outlined-borde flex justify-between border-b bg-background-body-background px-4 py-3">
            {/* Left */}
            <div className="flex gap-2">
              <SelectField
                placeholder={t("resultPage.filters.rolePlaceholder")}
                options={[
                  { label: t("resultPage.filters.roles.all"), value: 0 },
                  { label: t("resultPage.filters.roles.student"), value: 3 },
                  { label: t("resultPage.filters.roles.teacher"), value: 2 },
                  { label: t("resultPage.filters.roles.admin"), value: 1 },
                ]}
                onSelect={(val) => console.log("Filter role:", val)}
                defaultIndex={0}
              />
              <Input
                hasBoder={true}
                placeholder={t("resultPage.search.placeholder")}
                icon={<Icon name="search" className="text-text-disabled" />}
              />
            </div>

            {/* Right */}
            <div className="flex gap-2">
              {/* Sắp xếp tăng dần */}
              <Button
                variant={sortOrder === "asc" ? "contained" : "outline"}
                color={sortOrder === "asc" ? "primary" : "standard"}
                size="small"
                onClick={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
              >
                <Icon name="arrowUp" />
              </Button>

              {/* Sắp xếp giảm dần */}
              <Button
                variant={sortOrder === "desc" ? "contained" : "outline"}
                color={sortOrder === "desc" ? "primary" : "standard"}
                size={"small"}
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? null : "desc")
                }
              >
                <Icon name="up" /> {/* Đổi tên icon cho đúng nghĩa */}
              </Button>

              <Button
                variant={"contained"}
                color={"primary"}
                size={"small"}
                onClick={handleExportScores}
                disabled={viewMode !== "user" || userModeTableData.length === 0}
              >
                <Icon name="document" size={20} />
                {t("resultPage.actions.exportScores")}
              </Button>
            </div>
          </div>
        )}

        {/*  */}
        {selectedTab === "classScore" && (
          <div className="flex gap-4 border-b border-other-outlined-border bg-background-body-background px-4 py-3">
            {[
              { id: "user", label: t("resultPage.viewModes.user") },
              { id: "question", label: t("resultPage.viewModes.question") },
              { id: "difficulty", label: t("resultPage.viewModes.difficulty") },
            ].map((mode) => (
              <Button
                key={mode.id}
                size="medium"
                className={
                  viewMode === mode.id
                    ? "bg-action-selected font-bold text-primary-main"
                    : "text-text-secondary"
                }
                onClick={() => setViewMode(mode.id as ViewMode)}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        )}

        {/* table */}
        {selectedTab === "classScore" && (
          <div
            className="p-4 duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-2"
            key={`${viewMode}-${sortOrder}`}
          >
            <DynamicTable
              columns={columns}
              data={tableData as any}
              key={viewMode}
              rowKey={"id"}
              hasColumnActions={viewMode === "user"}
              className="border border-other-outlined-border"
              getRowClassName={(item) =>
                item.isAverage ? "bg-warning-background" : ""
              }
              renderActions={(item: StudentResult) => {
                if (item.isAverage) return null;

                // 2. Kiểm tra trạng thái bài làm
                const status = item.examAttempt?.status;

                if (status === "SUBMITTED") {
                  return (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() =>
                        handleViewResult(item.examAttempt?.id || 0)
                      }
                    >
                      <Icon name="eye" size={16} className="mr-1" />{" "}
                      {/* Thêm icon cho đẹp */}
                      {t("resultPage.actions.result")}
                    </Button>
                  );
                }

                // 3. Nếu đang làm (DANG_LAM)
                if (status === "IN_PROGRESS") {
                  return (
                    <span className="text-caption rounded bg-warning-background px-2 py-1 font-medium text-warning-main">
                      {t("resultPage.status.inProgress")}
                    </span>
                  );
                }

                return (
                  <span className="text-caption font-medium italic text-text-disabled">
                    {t("resultPage.status.notJoined")}
                  </span>
                );
              }}
            />
          </div>
        )}

        {selectedTab === "stat" && (
          <StatSection sinhViens={students} key="stat-section" />
        )}
      </div>
      {openResultModal && (
        <Overlay onClose={handleClose}>
          {" "}
          <main className="mb-20 flex max-h-[90vh] w-fit flex-col items-center overflow-y-auto rounded-lg bg-background-body-background px-8 py-8">
            <ExamResultOverview onCancel={handleClose} />
          </main>
        </Overlay>
      )}
    </MainContentLayout>
  );
}
