# Time Range Filter

Owner of the shared date range picker in `src/components/time-range-filter/**` and the
range enum in `src/lib/zod-schemas/baseZodSchema.ts`. Used by the sale, purchase, and
sale closing tables, and by the dashboard home page.

## Coverage summary

| Status      | Count |
| ----------- | ----- |
| Implemented | 0     |
| Partial     | 0     |
| Missing     | 2     |
| Obsolete    | 0     |

## Source map

- `src/components/time-range-filter/index.tsx`
- `src/lib/zod-schemas/baseZodSchema.ts` (`RangeSearchEnumSchema`)
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
