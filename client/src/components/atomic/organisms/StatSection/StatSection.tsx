/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import {
  UserCheck,
  UserPlus,
  UserX,
  BarChart3,
  TrendingDown,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Info,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { useExamActions } from "@/hooks/useExamActions";
import type { User } from "@/types";

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  textColor: string;
  iconBgColor: string;
}

export default function StatSection({ sinhViens }: { sinhViens: User[] }) {
  const { t } = useTranslation();
  const { testData } = useDeThiStore();

  const { examAttempts } = useExamActions();
  console.log();

  // --- LOGIC XỬ LÝ DỮ LIỆU ĐỘNG ---
  const { statsSummary, chartData } = useMemo(() => {
    const currentDeThiId = testData?.id;
    const currentExamAttempts = (examAttempts || []).filter(
      (bl) => bl.examId === currentDeThiId
    );

    // 1. Thống kê số lượng
    const submittedList = currentExamAttempts.filter(
      (bl) => bl.status === "SUBMITTED"
    );
    const submittedCount = submittedList.length;
    const totalStudents = sinhViens?.length || 0;

    // Thí sinh chưa nộp = Có trong danh sách lớp nhưng chưa có bài làm hoặc chưa bấm nộp
    const unsubmittedCount = totalStudents - submittedCount;

    // 2. Tính toán điểm số
    const scores = submittedList.map((bl) => Number(bl.totalScore) || 0);
    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    const countLE1 = scores.filter((s) => s <= 1).length;
    const countLE5 = scores.filter((s) => s <= 5).length;
    const countGE5 = scores.filter((s) => s >= 5).length;

    // 3. Phân phối biểu đồ (Hệ 10)
    const distribution = [
      { name: "<= 1", students: 0 },
      { name: "<= 2", students: 0 },
      { name: "<= 3", students: 0 },
      { name: "<= 4", students: 0 },
      { name: "<= 5", students: 0 },
      { name: "<= 6", students: 0 },
      { name: "<= 7", students: 0 },
      { name: "<= 8", students: 0 },
      { name: "<= 9", students: 0 },
      { name: "<= 10", students: 0 },
    ];

    scores.forEach((s) => {
      const index = Math.min(Math.floor(s === 0 ? 0 : s - 0.01), 9);
      if (index >= 0) distribution[index].students++;
    });

    const summary: StatItem[] = [
      {
        label: t("statSection.summary.submitted"),
        value: submittedCount,
        icon: <UserCheck size={20} />,
        textColor: "text-primary-main",
        iconBgColor: "bg-primary-background",
      },
      {
        label: t("statSection.summary.unsubmitted"),
        value: unsubmittedCount,
        icon: <UserPlus size={20} />,
        textColor: "text-warning-main",
        iconBgColor: "bg-warning-background",
      },
      {
        label: t("statSection.summary.totalStudents"),
        value: totalStudents,
        icon: <UserX size={20} />,
        textColor: "text-error-main",
        iconBgColor: "bg-error-background",
      },
      {
        label: t("statSection.summary.avgScore"),
        value: avgScore.toFixed(2),
        icon: <BarChart3 size={20} />,
        textColor: "text-info-main",
        iconBgColor: "bg-info-background",
      },
      {
        label: t("statSection.summary.scoreLE", { score: 1 }),
        value: countLE1,
        icon: <TrendingDown size={20} />,
        textColor: "text-error-dark",
        iconBgColor: "bg-error-background",
      },
      {
        label: t("statSection.summary.scoreLE", { score: 5 }),
        value: countLE5,
        icon: <ThumbsDown size={20} />,
        textColor: "text-warning-dark",
        iconBgColor: "bg-warning-background",
      },
      {
        label: t("statSection.summary.scoreGE", { score: 5 }),
        value: countGE5,
        icon: <ThumbsUp size={20} />,
        textColor: "text-success-main",
        iconBgColor: "bg-success-background",
      },
      {
        label: t("statSection.summary.maxScore"),
        value: maxScore.toFixed(2),
        icon: <Trophy size={20} />,
        textColor: "text-primary-dark",
        iconBgColor: "bg-primary-background",
      },
    ];

    return { statsSummary: summary, chartData: distribution };
  }, [testData, sinhViens, examAttempts, t]);

  return (
    <div className="flex flex-col gap-6 bg-background-body-background p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsSummary.map((item, idx) => (
          <div
            key={idx}
            className="group flex items-center justify-between rounded-xl border border-other-outlined-border bg-background-paper p-5 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="text-h5 leading-none text-text-primary">
                {item.value}
              </span>
              <span className="text-overline text-text-secondary">
                {item.label}
              </span>
            </div>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 ${item.iconBgColor} ${item.textColor}`}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div className="rounded-2xl border border-other-outlined-border bg-background-paper p-8 shadow-sm">
        <div className="mb-10">
          <h3 className="text-h6 mb-1 flex items-center gap-2 text-text-primary">
            {t("statSection.chart.title")}{" "}
            <Info size={16} className="text-text-disabled" />
          </h3>
          <p className="text-caption text-text-secondary">
            {t("statSection.chart.subtitle")}
          </p>
        </div>

        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-other-divider)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-caption fill-text-secondary"
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-caption fill-text-secondary"
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--color-action-hover)", radius: 4 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="flex flex-col gap-1 rounded-lg bg-other-tooltip p-4">
                        <p className="text-tooltip text-common-white">
                          {t("statSection.chart.tooltipScale", { label })}
                        </p>
                        <p className="text-body-2-semibold text-common-white">
                          {t("statSection.chart.tooltipStudents")}:{" "}
                          <span className="text-primary-main">
                            {payload[0].value}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="students" barSize={52} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    className={
                      entry.students > 0
                        ? "fill-primary-main"
                        : "fill-grey-grey-200"
                    }
                  />
                ))}
                <LabelList
                  dataKey="students"
                  position="top"
                  offset={12}
                  className="text-subtitle-2 fill-text-primary font-bold"
                  formatter={(val: any) => (val > 0 ? val : "")}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
