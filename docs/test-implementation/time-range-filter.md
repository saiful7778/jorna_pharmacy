# Time Range Filter

Owner of the shared date range picker in `src/components/time-range-filter/**` and the
range enum in `src/lib/zod-schemas/baseZodSchema.ts`. Used by the sale, purchase, and
sale closing tables, and by the dashboard home page.

## Coverage summary

| Status      | Count |
| ----------- | ----- |
| Implemented | 2     |
| Partial     | 0     |
| Missing     | 3     |
| Obsolete    | 0     |

## Source map

- `src/components/time-range-filter/index.tsx`
- `src/components/time-range-filter/date-range-select.tsx`
- `src/components/time-range-filter/week-range-select.tsx`
- `src/components/time-range-filter/month-range-select.tsx`
- `src/components/time-range-filter/range-grid.tsx`
- `src/hooks/use-range-selection.ts`
- `src/lib/zod-schemas/baseZodSchema.ts` (`RangeSearchEnumSchema`)
- `src/components/time-range-filter/date-range-select.test.tsx`
- Test file not yet created (planned: `src/components/time-range-filter/index.test.tsx`)

## Cases

### TRF-001 · Today preset covers the current local day

- **Covers:** `TimeRangeFilter`, `presetRanges.TODAY` — `src/components/time-range-filter/index.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the current time is frozen to a fixed local date and the range dropdown is open
- **When** the user selects "Today"
- **Then** `setRangeSearch` is called with `range: "TODAY"`, a `startTime` at local 00:00:00.000 of that day, and an `endTime` at local 23:59:59.999 of that day
- **Notes:** Freeze time with fake timers. The trigger label reads "Today".

### TRF-002 · Today is an accepted range value

- **Covers:** `RangeSearchEnumSchema` — `src/lib/zod-schemas/baseZodSchema.ts`
- **Type:** unit · **Priority:** P1 · **Status:** Missing
- **Given** the range enum schema
- **When** the value `"TODAY"` is parsed
- **Then** parsing succeeds and returns `"TODAY"`; an unknown value such as `"TOMORROW"` fails parsing

### TRF-003 · Chosen days apply as whole-day boundaries

- **Covers:** `DateRangeSelect` — `src/components/time-range-filter/date-range-select.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** the date range picker is showing the current month
- **When** the user clicks day 10, then day 20, then "Apply Range"
- **Then** `onApply` receives a range that starts at 00:00:00.000 of the first local day and ends at 23:59:59.999 of the second local day, as ISO strings
- **Notes:** Test: `src/components/time-range-filter/date-range-select.test.tsx`.

### TRF-004 · Default range is displayed and can be cleared

- **Covers:** `DateRangeSelect` — `src/components/time-range-filter/date-range-select.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** the picker receives a default range of March 10–20, 2026
- **When** it renders, and the user then clicks "Clear"
- **Then** the summary shows both dates, and clearing removes the summary and calls `onClear`
- **Notes:** Test: `src/components/time-range-filter/date-range-select.test.tsx`.

### TRF-005 · Custom date range applies the `CUSTOM_DAY` range

- **Covers:** `TimeRangeFilter` — `src/components/time-range-filter/index.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the range dropdown is open
- **When** the user chooses "Custom Date Range", picks a start and end day, and applies
- **Then** `setRangeSearch` receives `range: "CUSTOM_DAY"` with the picked start and end times, and the dialog closes
- **Notes:** The day option now opens a day-level date range picker instead of the week picker.
