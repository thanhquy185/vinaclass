import { dashboardService } from "@/features/admin/api/dashboard.service";
import axiosClient from "@/shared/api/axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/axios", () => ({
  default: { get: vi.fn() },
}));

const mockedGet = vi.mocked(axiosClient.get);

describe("dashboardService.getAdminStatistics", () => {
  beforeEach(() => mockedGet.mockReset());

  it("sends inclusive custom dates without an empty preset value", async () => {
    mockedGet.mockResolvedValue({ data: {} } as never);

    await dashboardService.getAdminStatistics(
      "learning-outcomes",
      "custom",
      "",
      "2026-10-01",
      "2026-10-27"
    );

    expect(mockedGet).toHaveBeenCalledWith("/dashboard/admin-statistics", {
      params: {
        report: "learning-outcomes",
        period_type: "custom",
        start_date: "2026-10-01",
        end_date: "2026-10-27",
      },
    });
  });

  it("keeps period_value for preset periods", async () => {
    mockedGet.mockResolvedValue({ data: {} } as never);

    await dashboardService.getAdminStatistics(
      "exams",
      "month",
      "2026-10"
    );

    expect(mockedGet).toHaveBeenCalledWith("/dashboard/admin-statistics", {
      params: {
        report: "exams",
        period_type: "month",
        period_value: "2026-10",
      },
    });
  });
});
