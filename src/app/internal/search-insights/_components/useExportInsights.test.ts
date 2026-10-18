import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useExportInsights } from "./useExportInsights";

const exportSearchInsights = vi.hoisted(() => vi.fn());
const downloadBlob = vi.hoisted(() => vi.fn());

vi.mock("@/services/dashboard/dashboard.service", () => ({
  DashboardService: { exportSearchInsights },
}));
vi.mock("@/lib/download", () => ({ downloadBlob }));

const base = { sortBy: "SEARCHES", sortDir: "DESC" } as const;

describe("useExportInsights", () => {
  beforeEach(() => {
    exportSearchInsights.mockReset();
    downloadBlob.mockReset();
  });

  it("exports with the current filters and names the file after the period", async () => {
    const blob = new Blob(["a,b"]);
    exportSearchInsights.mockResolvedValue(blob);
    const { result } = renderHook(() =>
      useExportInsights({ ...base, selection: { period: "30d" }, zeroResultsOnly: false } as never),
    );

    await act(() => result.current.exportCsv());

    expect(exportSearchInsights).toHaveBeenCalledWith({
      period: "LAST_30_DAYS",
      startDate: undefined,
      endDate: undefined,
      zeroResultsOnly: false,
      sortBy: "SEARCHES",
      sortDir: "DESC",
    });
    expect(downloadBlob).toHaveBeenCalledWith("search-queries-last_30_days.csv", blob);
    expect(result.current.exporting).toBe(false);
  });

  it("uses a separate file name for zero-result exports", async () => {
    exportSearchInsights.mockResolvedValue(new Blob([""]));
    const { result } = renderHook(() =>
      useExportInsights({ ...base, selection: { period: "today" }, zeroResultsOnly: true } as never),
    );
    await act(() => result.current.exportCsv());
    expect(downloadBlob.mock.calls[0][0]).toBe("zero-result-queries-today.csv");
  });

  it("does nothing for an incomplete custom range", async () => {
    const { result } = renderHook(() =>
      useExportInsights({
        ...base,
        selection: { period: "custom", startDate: "2026-10-01" },
        zeroResultsOnly: false,
      } as never),
    );
    await act(() => result.current.exportCsv());
    expect(exportSearchInsights).not.toHaveBeenCalled();
  });

  it("resets the exporting flag when the export fails", async () => {
    exportSearchInsights.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() =>
      useExportInsights({ ...base, selection: { period: "7d" }, zeroResultsOnly: false } as never),
    );
    await act(() => result.current.exportCsv());
    expect(result.current.exporting).toBe(false);
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
