import { useCallback } from "react";

import { cn } from "cn";
import { Check, PlusCircle, X } from "lucide-react";

import { useControllableState } from "@/hooks/use-controllable-state";
import { useIsMobile } from "@/hooks/use-mobile";

import { Badge } from "./badge";
import { Button, type ButtonProps } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

export interface Option {
  label: string;
  value: string;
  count?: number;
}

export interface FacetedFilterProps {
  selectedValues?: Set<string>;
  onSelect?: (option: Option, isSelected: boolean) => void;
  onReset?: () => void;
  options: Option[];
  isMultiple?: boolean;
  placeholder?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FacetedFilter({
  selectedValues = new Set(),
  onSelect,
  onReset,
  options,
  isMultiple,
  placeholder,
  variant = "outline",
  size = "default",
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: FacetedFilterProps) {
  "use no memo";
  const isMobile = useIsMobile();

  const [open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    defaultProp: false,
    onChange: controlledOnOpenChange,
  });

  const handleSelect = useCallback(
    (option: Option, isSelected: boolean) => {
      onSelect?.(option, isSelected);
      if (!isMultiple) {
        setOpen(false);
      }
    },
    [onSelect, isMultiple, setOpen]
  );

  const content = (
    <FacetedFilterContent
      isMultiple={isMultiple}
      placeholder={placeholder}
      options={options}
      selectedValues={selectedValues}
      onSelect={handleSelect}
      onReset={onReset}
    />
  );

  const trigger = (
    <FacetedFilterTrigger
      selectedValues={selectedValues}
      options={options}
      placeholder={placeholder}
      variant={variant}
      size={size}
      className={className}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder}</DrawerTitle>
            <DrawerDescription>
              {selectedValues.size > 0
                ? `${selectedValues.size} selected`
                : "Select an option"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 border-t pt-2">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="w-50 p-0" align="start">
        {content}
      </PopoverContent>
    </Popover>
  );
}

interface FacetedFilterTriggerProps extends ButtonProps {
  selectedValues: Set<string>;
  options: Option[];
  placeholder?: string;
}

function FacetedFilterTrigger({
  selectedValues,
  options,
  className,
  variant = "outline",
  placeholder,
  ...props
}: FacetedFilterTriggerProps) {
  return (
    <Button
      variant={variant}
      className={cn("border-dashed font-normal", className)}
      {...props}
    >
      <PlusCircle className="size-4" />
      <span>{placeholder}</span>
      {selectedValues.size > 0 && (
        <>
          <Separator
            orientation="vertical"
            className="mx-2 hidden lg:inline-block"
          />
          <div className="hidden items-center gap-1 lg:flex">
            {selectedValues.size > 2 ? (
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {selectedValues.size} selected
              </Badge>
            ) : (
              options
                .filter((option) => selectedValues.has(option.value))
                .map((option) => (
                  <Badge
                    variant="secondary"
                    key={option.value}
                    className="rounded-sm px-1 font-normal"
                  >
                    {option.label}
                  </Badge>
                ))
            )}
          </div>
        </>
      )}
    </Button>
  );
}

interface FacetedFilterContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Command>,
  "onSelect"
> {
  isMultiple?: boolean;
  placeholder?: string;
  options: Option[];
  selectedValues: Set<string>;
  onSelect: (option: Option, isSelected: boolean) => void;
  onReset?: () => void;
}

function FacetedFilterContent({
  isMultiple,
  placeholder,
  options,
  selectedValues,
  onSelect,
  onReset,
  className,
  ...props
}: FacetedFilterContentProps) {
  return (
    <Command className={cn("p-0", className)} {...props}>
      {isMultiple && <CommandInput placeholder={placeholder} />}
      <CommandList className="max-h-full">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup className="max-h-50 scroll-py-1 overflow-x-hidden overflow-y-auto">
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value);

            return (
              <CommandItem
                key={option.value}
                value={option.value}
                className="[&>svg:last-child]:hidden"
                onSelect={() => onSelect(option, isSelected)}
              >
                <span
                  className={cn(
                    "mr-2 inline-flex size-4 items-center justify-center rounded-sm border border-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground group-data-selected/command-item:bg-primary group-data-selected/command-item:text-primary-foreground group-data-selected/command-item:[&>svg]:text-primary-foreground"
                      : "[&>svg]:invisible"
                  )}
                >
                  <Check className="size-3.5" />
                </span>
                <span className="truncate">{option.label}</span>
                {!!option.count && (
                  <span className="ml-auto rounded border px-1 py-px font-mono text-xs font-medium text-muted-foreground shadow-xs select-none">
                    {option.count}
                  </span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
        {selectedValues.size > 0 && onReset && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => onReset()}
                className="justify-center text-center"
              >
                <X className="size-4" />
                <span>Clear filter</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}
