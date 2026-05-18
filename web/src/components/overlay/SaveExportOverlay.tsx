import { LuTriangleAlert, LuVideo, LuX } from "react-icons/lu";
import { Button } from "../ui/button";
import { FaCompactDisc } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type SaveExportOverlayProps = {
  className: string;
  show: boolean;
  hidePreview?: boolean;
  saveLabel?: string;
  isSaving?: boolean;
  overlapWarning?: string;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
};
export default function SaveExportOverlay({
  className,
  show,
  hidePreview = false,
  saveLabel,
  isSaving = false,
  overlapWarning,
  onPreview,
  onSave,
  onCancel,
}: SaveExportOverlayProps) {
  const { t } = useTranslation("components/dialog");
  return (
    <div className={className}>
      <div
        className={cn(
          "pointer-events-auto mx-auto mt-5 flex flex-col items-center gap-2 text-center",
          show ? "duration-500 animate-in slide-in-from-top" : "invisible",
        )}
      >
      <div className="flex items-center justify-center gap-2 rounded-lg px-2">
        <Button
          className="flex items-center gap-1 text-primary"
          aria-label={t("button.cancel", { ns: "common" })}
          size="sm"
          disabled={isSaving}
          onClick={onCancel}
        >
          <LuX />
          {t("button.cancel", { ns: "common" })}
        </Button>
        {!hidePreview && (
          <Button
            className="flex items-center gap-1"
            aria-label={t("export.fromTimeline.previewExport")}
            size="sm"
            disabled={isSaving}
            onClick={onPreview}
          >
            <LuVideo />
            {t("export.fromTimeline.previewExport")}
          </Button>
        )}
        <Button
          className="flex items-center gap-1"
          aria-label={saveLabel || t("export.fromTimeline.saveExport")}
          variant="select"
          size="sm"
          disabled={isSaving}
          onClick={onSave}
        >
          <FaCompactDisc />
          {isSaving
            ? t("export.fromTimeline.queueingExport")
            : saveLabel || t("export.fromTimeline.saveExport")}
        </Button>
      </div>
        {overlapWarning && (
          <div className="flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">
            <LuTriangleAlert className="size-3.5 flex-shrink-0" />
            <span>{overlapWarning}</span>
          </div>
        )}
      </div>
    </div>
  );
}
