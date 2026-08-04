import { cn } from "@/lib/utils";
import { ExportRange } from "@/types/export";
import { TimeRange } from "@/types/timeline";
import { getExportCoveragePercent } from "@/utils/exportRangeUtils";

type ReviewThumbnailProps = {
  timeRange: TimeRange;
  exportedRanges?: ExportRange[];
  className?: string;
};

export default function ReviewThumbnail({
  timeRange,
  exportedRanges = [],
  className,
}: ReviewThumbnailProps) {
  const progressValue = Math.min(
    100,
    Math.max(
      0,
      getExportCoveragePercent(
        timeRange.after,
        timeRange.before,
        exportedRanges,
      ),
    ),
  );

  return (
    <div className={cn("pointer-events-none w-full", className)}>
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-2 py-1 shadow-sm backdrop-blur-sm">
        <span className="text-xs font-medium text-white/90">
          Exported: {progressValue}%
        </span>

        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </div>
  );
}
