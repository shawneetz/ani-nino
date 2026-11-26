// what this file does: pure helpers for drawing a chart, so they can be tested
//   chartParts  = splits points into bars and target lines, and finds the axis maximum
//   percentOf   = where a value sits on the axis, in percent
//   labelSide   = which side of its line a target label should sit on
// the axis always starts at 0 and ends at the biggest value, bar or target

/**
 * The fields the chart helpers read from a chart point.
 */
export interface ChartValue {
    /** The number to draw. */
    value: number;
    /** `"bar"` draws a bar, `"target"` draws a labeled line across the chart. */
    kind: "bar" | "target";
}

/**
 * The result of splitting a chart's points.
 *
 * @typeParam T - The point shape that was passed in, kept as is.
 */
export interface ChartParts<T extends ChartValue> {
    /** Points drawn as bars, in the original order. */
    bars: T[];
    /** Points drawn as target lines, in the original order. */
    targets: T[];
    /** The value at the right end of the axis, never below 1. */
    axisMax: number;
}

/**
 * Splits chart points into bars and targets and finds the shared axis maximum.
 *
 * @remarks
 * The axis maximum counts targets too, so a goal bigger than every bar still fits.
 *
 * @typeParam T - Any point shape that has a value and a kind.
 * @param points - All points of one chart.
 * @returns The bars, the targets and the axis maximum.
 *
 * @example
 * ```ts
 * chartParts([{ value: 5, kind: "bar" }, { value: 20, kind: "target" }]).axisMax; // 20
 * ```
 */
export function chartParts<T extends ChartValue>(points: T[]): ChartParts<T> {
    return {
        bars: points.filter((point) => point.kind === "bar"),
        targets: points.filter((point) => point.kind === "target"),
        // at least 1, so an empty chart never divides by zero
        axisMax: Math.max(1, ...points.map((point) => point.value)),
    };
}

/**
 * Finds where a value sits on the axis.
 *
 * @param value - The number to place.
 * @param axisMax - The value at the right end of the axis.
 * @returns A percent from 0 to 100. Values outside the axis are held at the edges.
 */
export function percentOf(value: number, axisMax: number): number {
    // keeps the result between 0 and 100 so a bar never leaves its track
    return Math.min(100, Math.max(0, (value / axisMax) * 100));
}

/**
 * Picks the side of its line where a target label should sit.
 *
 * @remarks
 * Labels past 55 percent sit to the left of their line, so they never run off the right edge.
 *
 * @param percent - Where the line sits, from 0 to 100.
 * @returns `"right"` when the label should end at the line, otherwise `"left"` when it should start at the line.
 */
export function labelSide(percent: number): "left" | "right" {
    return percent > 55 ? "right" : "left";
}

const INSIDE_BASE_PERCENT = 20;
const INSIDE_PERCENT_PER_CHAR = 1.8;
const INSIDE_MAX_NEEDED = 70;

export function labelFitsInside(percent: number, textLength: number): boolean {
    const needed = Math.min(INSIDE_MAX_NEEDED, INSIDE_BASE_PERCENT + textLength * INSIDE_PERCENT_PER_CHAR);
    return percent >= needed;
}