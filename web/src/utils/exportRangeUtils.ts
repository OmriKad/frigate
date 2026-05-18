import { ExportRange } from "@/types/export";

export type DisplaySegment = {
  startTime: number;
  endTime: number;
  /** 1 = one export, 2 = two, 3 = three or more */
  intensity: 1 | 2 | 3;
  inProgress: boolean;
};

/**
 * Merges raw export ranges into display segments for the timeline overlay.
 *
 * Clips all ranges to [windowAfter, windowBefore], counts how many ranges
 * cover each interval to assign fixed intensity levels, and merges adjacent
 * segments with identical properties.
 *
 * windowAfter is the older/smaller timestamp (bottom of timeline).
 * windowBefore is the newer/larger timestamp (top of timeline).
 */
export function mergeExportRanges(
  ranges: ExportRange[],
  windowAfter: number,
  windowBefore: number,
): DisplaySegment[] {
  const clipped = ranges
    .map((r) => ({
      start: Math.max(r.source_start_time, windowAfter),
      end: Math.min(r.source_end_time, windowBefore),
      inProgress: r.in_progress,
    }))
    .filter((r) => r.start < r.end);

  if (clipped.length === 0) return [];

  const points = [
    ...new Set(clipped.flatMap((r) => [r.start, r.end])),
  ].sort((a, b) => a - b);

  const segments: DisplaySegment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segEnd = points[i + 1];

    const covering = clipped.filter(
      (r) => r.start < segEnd && r.end > segStart,
    );
    if (covering.length === 0) continue;

    const intensity = Math.min(covering.length, 3) as 1 | 2 | 3;
    const inProgress = covering.some((r) => r.inProgress);

    const last = segments[segments.length - 1];
    if (
      last &&
      last.intensity === intensity &&
      last.inProgress === inProgress &&
      last.endTime === segStart
    ) {
      last.endTime = segEnd;
    } else {
      segments.push({ startTime: segStart, endTime: segEnd, intensity, inProgress });
    }
  }

  return segments;
}

/**
 * Returns true if the given [rangeAfter, rangeBefore] selection intersects
 * any of the provided export ranges. Any-intersection semantics:
 * an existing range overlaps when it starts before rangeBefore AND
 * ends after rangeAfter.
 */
export function rangeOverlapsExports(
  rangeAfter: number,
  rangeBefore: number,
  exports: ExportRange[],
): boolean {
  if (rangeBefore <= rangeAfter) return false;
  return exports.some(
    (e) => e.source_start_time < rangeBefore && e.source_end_time > rangeAfter,
  );
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  const makeRange = (
    start: number,
    end: number,
    inProgress = false,
  ): ExportRange => ({
    id: `${start}-${end}`,
    camera: "front",
    name: "test",
    source_type: "recording",
    source_start_time: start,
    source_end_time: end,
    in_progress: inProgress,
  });

  describe("mergeExportRanges", () => {
    it("returns empty array when no ranges", () => {
      expect(mergeExportRanges([], 0, 100)).toEqual([]);
    });

    it("returns empty array when all ranges are outside the window", () => {
      expect(mergeExportRanges([makeRange(200, 300)], 0, 100)).toEqual([]);
    });

    it("clips a single range to the window", () => {
      const result = mergeExportRanges([makeRange(50, 200)], 100, 300);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        startTime: 100,
        endTime: 200,
        intensity: 1,
      });
    });

    it("assigns intensity 1 for a single non-overlapping range", () => {
      const result = mergeExportRanges([makeRange(10, 50)], 0, 100);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ startTime: 10, endTime: 50, intensity: 1 });
    });

    it("produces three segments with intensity 1, 2, 1 for two partially overlapping ranges", () => {
      const result = mergeExportRanges(
        [makeRange(0, 60), makeRange(30, 100)],
        0,
        100,
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({ startTime: 0, endTime: 30, intensity: 1 });
      expect(result[1]).toMatchObject({ startTime: 30, endTime: 60, intensity: 2 });
      expect(result[2]).toMatchObject({ startTime: 60, endTime: 100, intensity: 1 });
    });

    it("caps intensity at 3 for four or more overlapping ranges", () => {
      const result = mergeExportRanges(
        [makeRange(0, 100), makeRange(0, 100), makeRange(0, 100), makeRange(0, 100)],
        0,
        100,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ intensity: 3 });
    });

    it("merges adjacent non-overlapping ranges with the same intensity", () => {
      const result = mergeExportRanges(
        [makeRange(0, 40), makeRange(40, 100)],
        0,
        100,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ startTime: 0, endTime: 100, intensity: 1 });
    });

    it("does not merge adjacent segments when intensity differs", () => {
      // [0-50] covered by two ranges, [50-100] by one
      const result = mergeExportRanges(
        [makeRange(0, 100), makeRange(0, 50)],
        0,
        100,
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ startTime: 0, endTime: 50, intensity: 2 });
      expect(result[1]).toMatchObject({ startTime: 50, endTime: 100, intensity: 1 });
    });

    it("propagates inProgress when any covering range is in progress", () => {
      const result = mergeExportRanges(
        [makeRange(0, 100, true), makeRange(20, 80, false)],
        0,
        100,
      );
      expect(result.every((s) => s.inProgress)).toBe(true);
    });

    it("excludes ranges ending exactly at windowAfter", () => {
      const result = mergeExportRanges([makeRange(0, 100)], 100, 200);
      expect(result).toHaveLength(0);
    });

    it("excludes ranges starting exactly at windowBefore", () => {
      const result = mergeExportRanges([makeRange(100, 200)], 0, 100);
      expect(result).toHaveLength(0);
    });
  });
}
