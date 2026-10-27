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
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ExamScoreDistributionItem } from "@/features/assessments/utils/examStatistics";

interface ExamScoreDistributionChartProps {
  data: ExamScoreDistributionItem[];
}

export default function ExamScoreDistributionChart({
  data,
}: ExamScoreDistributionChartProps) {
  const { t } = useTranslation();

  return (
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
            data={data}
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
              {data.map((entry, index) => (
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
                formatter={(value) => (Number(value) > 0 ? value : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
