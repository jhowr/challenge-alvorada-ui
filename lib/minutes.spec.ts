import {
  dayRange,
  formatDateTime,
  formatDuration,
  formatPeriod,
  formatRaw,
  minuteOf,
  minuteToDate,
  parseDayParam,
  toDayParam,
} from "./minutes"

// Every test runs in America/Sao_Paulo (UTC-3, no DST since 2019); see
// vitest.config.ts. 2026-11-02 09:00 local is 12:00Z, minute 29893680.
const NINE_AM = 29893680
const HOUR = 60

describe("minute convention", () => {
  it("maps an integer to the whole UTC minute since the epoch", () => {
    expect(minuteToDate(0).toISOString()).toBe("1970-01-01T00:00:00.000Z")
    expect(minuteToDate(NINE_AM).toISOString()).toBe("2026-11-02T12:00:00.000Z")
    expect(minuteToDate(NINE_AM + 15).toISOString()).toBe(
      "2026-11-02T12:15:00.000Z"
    )
  })

  it("round-trips through a date", () => {
    expect(minuteOf(minuteToDate(NINE_AM))).toBe(NINE_AM)
  })

  it("rounds a date inside a minute down to that minute", () => {
    expect(minuteOf(new Date("2026-11-02T12:00:59Z"))).toBe(NINE_AM)
  })

  it("maps every int32 minute to a valid date", () => {
    expect(Number.isNaN(minuteToDate(2 ** 31 - 1).getTime())).toBe(false)
    expect(Number.isNaN(minuteToDate(-(2 ** 31)).getTime())).toBe(false)
  })
})

describe("dayRange", () => {
  it("covers the 24 hours of a local day as [start, end)", () => {
    const range = dayRange(new Date(2026, 10, 2, 15))
    expect(range.end - range.start).toBe(24 * HOUR)
    expect(formatDateTime(range.start)).toBe("02/11 00:00")
    expect(formatDateTime(range.end)).toBe("03/11 00:00")
  })

  it("starts the next day exactly where the previous one ends", () => {
    expect(dayRange(new Date(2026, 10, 2)).end).toBe(
      dayRange(new Date(2026, 10, 3)).start
    )
  })
})

describe("formatPeriod", () => {
  it("names the day once for a period inside one day", () => {
    expect(formatPeriod(NINE_AM, NINE_AM + 2 * HOUR)).toBe(
      "02/11 09:00 – 11:00"
    )
  })

  it("shows quarter hours", () => {
    expect(formatPeriod(NINE_AM + 15, NINE_AM + 105)).toBe(
      "02/11 09:15 – 10:45"
    )
  })

  it("names both days when the period crosses midnight", () => {
    expect(formatPeriod(NINE_AM + 13 * HOUR, NINE_AM + 17 * HOUR)).toBe(
      "02/11 22:00 – 03/11 02:00"
    )
  })

  it("keeps a period ending exactly at midnight on its own day", () => {
    expect(formatPeriod(NINE_AM + 13 * HOUR, NINE_AM + 15 * HOUR)).toBe(
      "02/11 22:00 – 00:00"
    )
  })

  it("shows the raw integers as half-open", () => {
    expect(formatRaw(NINE_AM, NINE_AM + 2 * HOUR)).toBe("[29893680, 29893800)")
  })
})

describe("formatDuration", () => {
  it.each([
    [2 * HOUR, "2 h"],
    [45, "45 min"],
    [90, "1 h 30 min"],
  ])("reads %i minutes as %s", (minutes, label) => {
    expect(formatDuration(NINE_AM, NINE_AM + minutes)).toBe(label)
  })
})

describe("day param", () => {
  const today = new Date(2026, 10, 2, 15)

  it("round-trips a local day", () => {
    expect(toDayParam(parseDayParam("2026-11-03", today))).toBe("2026-11-03")
  })

  it.each([undefined, "", "03/11/2026", "2026-02-30", "2026-13-01"])(
    "falls back to today for %j",
    (value) => {
      expect(toDayParam(parseDayParam(value, today))).toBe("2026-11-02")
    }
  )
})
