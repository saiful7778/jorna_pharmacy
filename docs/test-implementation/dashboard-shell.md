# Dashboard Shell

Owner of the dashboard page header primitives in
`src/components/shared/dashboard-shell/DashboardShellHeader.tsx`. Used by dashboard routes
such as `src/routes/dashboard/_dashboardLayout/index.tsx` and `profile.tsx`.

## Coverage summary

| Status      | Count |
| ----------- | ----- |
| Implemented | 0     |
| Partial     | 0     |
| Missing     | 3     |
| Obsolete    | 0     |

## Source map

- `src/components/shared/dashboard-shell/DashboardShellHeader.tsx`
- Test file not yet created (planned: `src/components/shared/dashboard-shell/DashboardShellHeader.test.tsx`)

## Cases

### DSH-001 · Header without an action keeps the stacked title and description layout

- **Covers:** `DashboardShellHeader`, `DashboardShellTitle`, `DashboardShellDescription` — `src/components/shared/dashboard-shell/DashboardShellHeader.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a header containing a title and a description and no action
- **When** it is rendered
- **Then** the title and description render with their text and the header root does not switch to a grid layout

### DSH-002 · Action slot sits beside the title block

- **Covers:** `DashboardShellHeader`, `DashboardShellHeaderActive` — `src/components/shared/dashboard-shell/DashboardShellHeader.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a header containing a title, a description, and a `DashboardShellHeaderActive` child
- **When** it is rendered
- **Then** the action element has `data-slot="dashboard-shell-header-active"`, the header root uses the two-column grid layout, and the action is rendered with its children
- **Notes:** Layout classes are verified by class name only; visual placement can be checked in a story if needed.

### DSH-003 · Custom class name merges onto the action slot

- **Covers:** `DashboardShellHeaderActive` — `src/components/shared/dashboard-shell/DashboardShellHeader.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a `DashboardShellHeaderActive` with `className="custom-class"`
- **When** it is rendered
- **Then** the element keeps the base `justify-self-end` class and also has `custom-class`
