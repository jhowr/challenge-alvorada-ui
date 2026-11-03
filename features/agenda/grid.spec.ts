import { dragSpan, overlaps, placeOnDay, slotAt } from "./grid"

// A day of 24 hours in minutes, starting at minute 6000.
const day = { start: 6000, end: 6000 + 24 * 60 }
const at = (hours: number) => day.start + hours * 60

describe("placeOnDay", () => {
  it("places a period inside the day by its minutes", () => {
    expect(placeOnDay({ start: at(9), end: at(10.5) }, day)).toEqual({
      left: (9 / 24) * 100,
      width: (1.5 / 24) * 100,
      continuesBefore: false,
      continuesAfter: false,
    })
  })

  it("clips a period that crosses midnight and says it continues", () => {
    expect(placeOnDay({ start: at(22), end: at(26) }, day)).toMatchObject({
      left: (22 / 24) * 100,
      width: (2 / 24) * 100,
      continuesAfter: true,
    })
    expect(placeOnDay({ start: at(-2), end: at(2) }, day)).toMatchObject({
      left: 0,
      width: (2 / 24) * 100,
      continuesBefore: true,
    })
  })

  it.each([
    ["ends exactly when the day starts", { start: at(-1), end: at(0) }],
    ["starts exactly when the day ends", { start: at(24), end: at(25) }],
  ])("leaves out a period that %s", (_label, period) => {
    expect(placeOnDay(period, day)).toBeNull()
  })
})

describe("pointer to slot", () => {
  // 960 px for 96 quarter hours: 10 px per slot, 40 px per hour.
  it("maps a pointer to the start of the quarter hour under it", () => {
    expect(slotAt(0, 960, day, 15)).toBe(at(0))
    expect(slotAt(9, 960, day, 15)).toBe(at(0))
    expect(slotAt(10, 960, day, 15)).toBe(at(0.25))
    expect(slotAt(375, 960, day, 15)).toBe(at(9.25))
    expect(slotAt(959, 960, day, 15)).toBe(at(23.75))
  })

  it("clamps a pointer dragged past either edge", () => {
    expect(slotAt(-30, 960, day, 15)).toBe(at(0))
    expect(slotAt(2000, 960, day, 15)).toBe(at(23.75))
  })

  it("selects whole slots whichever way the drag goes", () => {
    expect(dragSpan(at(9), at(10.5), 15)).toEqual({
      start: at(9),
      end: at(10.75),
    })
    expect(dragSpan(at(10.5), at(9), 15)).toEqual({
      start: at(9),
      end: at(10.75),
    })
    expect(dragSpan(at(9), at(9), 15)).toEqual({ start: at(9), end: at(9.25) })
  })
})

describe("overlaps", () => {
  it("matches the API's half-open rule", () => {
    expect(overlaps({ start: 9, end: 11 }, { start: 11, end: 12 })).toBe(false)
    expect(overlaps({ start: 9, end: 11 }, { start: 10, end: 12 })).toBe(true)
  })
})
