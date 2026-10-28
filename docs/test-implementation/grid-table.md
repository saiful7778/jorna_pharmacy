# Grid Table

Owner of the reusable grid-based table primitives in `src/components/ui/grid-table.tsx`.
Used by `src/features/purchase/components/PurchaseCreateDialog.tsx` for the medicine item
rows.

## Coverage summary

| Status      | Count |
| ----------- | ----- |
| Implemented | 3     |
| Partial     | 0     |
| Missing     | 1     |
| Obsolete    | 0     |

## Source map

- `src/components/ui/grid-table.tsx`
- `src/components/ui/grid-table.test.tsx`
- `src/components/ui/grid-table.stories.tsx` (visual stories only: Default, WithExpandedRow, Empty; no play-function assertions, so they do not count toward case status)

## Cases

### GTBL-001 · Renders header and body as table roles

- **Covers:** `GridTable`, `GridTableHeader`, `GridTableBody`, `GridTableRow`, `GridTableHead`, `GridTableCell` — `src/components/ui/grid-table.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** a grid table with one header cell and one body cell
- **When** it is rendered
- **Then** the root exposes a `table`, two `rowgroup`s and two `row`s exist, and the cells expose `columnheader` and `cell` roles with their text

### GTBL-002 · Span prop maps to the matching column span class

- **Covers:** `GridTableCell`, `GridTableHead` — `src/components/ui/grid-table.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** a cell with `span={3}`
- **When** it is rendered
- **Then** it has the `col-span-3` class

### GTBL-003 · Custom class name merges onto the table root

- **Covers:** `GridTable` — `src/components/ui/grid-table.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Implemented
- **Given** a grid table with `className="custom-class"`
- **When** it is rendered
- **Then** the root keeps the base `border` class and also has `custom-class`

### GTBL-004 · Cells draw a right border except the last cell in a row

- **Covers:** `GridTableCell`, `GridTableHead` — `src/components/ui/grid-table.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a row with three cells
- **When** it is rendered
- **Then** the first two cells carry the `border-r` variant class and the last cell does not
- **Notes:** Class-based assertion is acceptable here because the border is purely visual. Could instead be checked with computed styles in a Storybook story.
