import useSWR from "swr";
import { ExportRange } from "@/types/export";

export function useExportedRanges(
  camera: string | undefined,
  windowAfter: number,
  windowBefore: number,
  enabled: boolean,
) {
  const windowSize = windowBefore - windowAfter;
  const buffer = Math.round(windowSize * 0.1);

  const { data, mutate } = useSWR<ExportRange[]>(
    enabled && camera
      ? [
          "exports/ranges",
          {
            camera,
            after: Math.round(windowAfter) - buffer,
            before: Math.round(windowBefore) + buffer,
          },
        ]
      : null,
    { refreshInterval: 30_000 },
  );

  return { exportedRanges: data ?? [], mutateExportedRanges: mutate };
}
