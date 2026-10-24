import { cn } from "cn";

interface RangeGridItem {
  label: string;
  sublabel?: string;
}

interface RangeGridProps {
  items: RangeGridItem[];
  columns: number;
  scrollable?: boolean;
  isSelected: (index: number) => boolean;
  isHovering: (index: number) => boolean;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
}

export function RangeGrid({
  items,
  columns,
  scrollable,
  isSelected,
  isHovering,
  onSelect,
  onHover,
}: RangeGridProps) {
  return (
    <div
      role="group"
      className={cn("grid gap-2", scrollable && "max-h-68 overflow-y-auto")}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => {
        const selected = isSelected(index);
        const hovering = isHovering(index);
        return (
          <button
            key={index}
            type="button"
            aria-pressed={selected}
            data-selected={selected || undefined}
            data-hover={hovering || undefined}
            className="cursor-pointer rounded border p-2 text-sm font-medium transition-all duration-200 hover:border-muted-foreground/20 hover:bg-secondary data-hover:border-primary/40 data-hover:bg-primary/20 data-selected:border-primary data-selected:bg-muted data-selected:shadow-md"
            onClick={() => onSelect(index)}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="text-center">
              <div className="font-semibold">{item.label}</div>
              {item.sublabel && (
                <div className="text-xs opacity-75">{item.sublabel}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
