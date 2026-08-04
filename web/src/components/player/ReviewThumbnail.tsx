import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
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
  const progressValue = getExportCoveragePercent(
    timeRange.after,
    timeRange.before,
    exportedRanges,
  );

  return (
    <div className={cn("pointer-events-none w-full", className)}>
      <div className="rounded-full border border-white/15 bg-black/50 p-1 backdrop-blur-sm">
        <Progress value={progressValue} className="h-1.5" />
      </div>
    </div>
  );
}
