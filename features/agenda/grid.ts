/**
 * Geometry of the day grid: the track spans the minutes of the local day,
 * drawn as one column per hour and selected in steps of `step` minutes. Pure,
 * so the placement rules (clipping at midnight, the half-open end) are
 * unit-tested.
 */

export interface Span {
  start: number
  end: number
}

export interface Placement {
  /** Percent offsets inside the day track. */
  left: number
  width: number
  /** The period continues before the day starts / after it ends. */
  continuesBefore: boolean
  continuesAfter: boolean
}

/** Where a period sits on the track of `day`, or null when it is outside it. */
export function placeOnDay(period: Span, day: Span): Placement | null {
  // Half-open on both sides: [9, 10) touches the day [10, 34) but is not on it.
  if (period.end <= day.start || period.start >= day.end) return null
  const length = day.end - day.start
  const start = Math.max(period.start, day.start)
  const end = Math.min(period.end, day.end)
  return {
    left: ((start - day.start) / length) * 100,
    width: ((end - start) / length) * 100,
    continuesBefore: period.start < day.start,
    continuesAfter: period.end > day.end,
  }
}

/**
 * The start of the `step`-minute slot under a pointer `x` pixels into a track
 * `width` pixels wide.
 */
export function slotAt(
  x: number,
  width: number,
  day: Span,
  step: number
): number {
  const slots = (day.end - day.start) / step
  const slot = Math.floor((x / width) * slots)
  return day.start + Math.min(slots - 1, Math.max(0, slot)) * step
}

/** The period covered by dragging from one slot to another, in either direction. */
export function dragSpan(anchor: number, current: number, step: number): Span {
  return {
    start: Math.min(anchor, current),
    end: Math.max(anchor, current) + step,
  }
}

/** Same rule as the API (BR3): `[a, b)` and `[c, d)` overlap when a < d and c < b. */
export function overlaps(a: Span, b: Span): boolean {
  return a.start < b.end && b.start < a.end
}
