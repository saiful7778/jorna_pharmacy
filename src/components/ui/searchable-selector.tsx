import {
  createContext,
  Fragment,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";

import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";

import { useControllableState } from "@/hooks/use-controllable-state";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useIsMobile } from "@/hooks/use-mobile";

import { QueryStateBoundary } from "../tanstack-query/query-state-boundary";
import { Button, type ButtonProps } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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

interface SearchableSelectorContextProps {
  isMobile: boolean;
  open: boolean | undefined;
  setOpen: (nextValue: boolean | ((prev: boolean) => boolean)) => void;
  handleSelect: (itemId: string) => void;
  searchValue: string;
  handleSearchChange: (searchValue: string) => void;
  value: string | Array<string> | undefined;
  multiple: boolean;
  disabled?: boolean;
}

const SearchableSelectorContext =
  createContext<SearchableSelectorContextProps | null>(null);

function useSearchableSelectorContext() {
  const context = use(SearchableSelectorContext);
  if (!context) {
    throw new Error(
      "SearchableSelector components must be used within a SearchableSelector"
    );
  }
  return context;
}

interface SearchableSelectorProps<TValue extends string | Array<string>> {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value: TValue | undefined;
  onChange: (value: TValue | undefined) => void;
  onSearch: (searchValue: string) => void;
  searchDebounceMs?: number;
  disabled?: boolean;
  multiple?: boolean;
}

export function SearchableSelector<
  TValue extends string | Array<string> = string,
>({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  value,
  onChange,
  onSearch,
  searchDebounceMs = 500,
  multiple = false,
  disabled = false,
}: SearchableSelectorProps<TValue>) {
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");

  const [open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    defaultProp: false,
    onChange: controlledOnOpenChange,
  });

  const handleSetOpen = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) => {
      if (disabled) return;
      setOpen(val);
    },
    [setOpen, disabled]
  );

  const debouncedSearch = useDebouncedCallback(
    (inputSearchValue: string) => onSearch(inputSearchValue),
    searchDebounceMs
  );

  const handleSelect = useCallback(
    (itemId: string) => {
      if (multiple) {
        const current: Array<string> = Array.isArray(value) ? value : [];
        const next = current.includes(itemId)
          ? current.filter((id) => id !== itemId)
          : [...current, itemId];
        onChange(next as TValue);
        return;
      }
      onChange((itemId === value ? undefined : itemId) as TValue);
      handleSetOpen(false);
    },
    [multiple, value, onChange, handleSetOpen]
  );

  const handleSearchChange = useCallback(
    (inputSearchValue: string) => {
      setSearchValue(inputSearchValue);
      debouncedSearch(inputSearchValue);
    },
    [debouncedSearch, setSearchValue]
  );

  const contextValue = useMemo<SearchableSelectorContextProps>(
    () => ({
      isMobile,
      open,
      setOpen: handleSetOpen,
      handleSelect,
      searchValue,
      handleSearchChange,
      value,
      multiple,
      disabled,
    }),
    [
      isMobile,
      open,
      handleSetOpen,
      handleSelect,
      searchValue,
      handleSearchChange,
      value,
      multiple,
      disabled,
    ]
  );

  const WrapperComp = isMobile ? Drawer : Popover;

  return (
    <SearchableSelectorContext value={contextValue}>
      <WrapperComp open={open} onOpenChange={handleSetOpen}>
        {children}
      </WrapperComp>
    </SearchableSelectorContext>
  );
}

type SearchableSelectorTriggerProps = ButtonProps;

export function SearchableSelectorTrigger({
  className,
  type = "button",
  variant = "outline",
  children,
  ...props
}: SearchableSelectorTriggerProps) {
  const { open, isMobile, disabled } = useSearchableSelectorContext();

  const trigger = (
    <Button
      variant={variant}
      type={type}
      className={cn(
        "group/searchable-selector-trigger w-full justify-start border-input",
        className
      )}
      aria-expanded={open}
      data-open={open ? "true" : undefined}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none ml-auto size-4 text-muted-foreground transition-transform group-data-open/searchable-selector-trigger:rotate-180" />
    </Button>
  );

  if (isMobile) {
    return <DrawerTrigger render={trigger} />;
  }

  return <PopoverTrigger render={trigger} />;
}

interface SearchableSelectorContentProps<T> {
  title: string;
  description: string;
  className?: string;
  searchPlaceholder?: string;
  loadingFallback: React.ReactNode;
  emptyFallback: React.ReactNode;
  errorFallback?: (error: Error) => React.ReactNode;
  children: (item: T) => React.ReactNode;
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function SearchableSelectorContent<T>({
  children,
  title,
  description,
  className,
  searchPlaceholder = "Search...",
  loadingFallback,
  emptyFallback,
  errorFallback,
  data,
  isLoading,
  isError,
  error,
}: SearchableSelectorContentProps<T>) {
  const { isMobile, handleSearchChange, searchValue } =
    useSearchableSelectorContext();

  const commandContent = (
    <Command shouldFilter={false} className={className}>
      <CommandInput
        placeholder={searchPlaceholder}
        value={searchValue}
        onValueChange={handleSearchChange}
        inputMode="search"
        autoCapitalize="none"
      />
      <QueryStateBoundary
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(d) => d.length === 0}
        loadingFallback={loadingFallback}
        emptyFallback={emptyFallback}
        errorFallback={errorFallback}
      >
        {(items) => (
          <CommandList className="max-h-75 overflow-y-auto">
            <CommandGroup>
              {items.map((item, idx) => (
                <Fragment key={idx}>{children(item)}</Fragment>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </QueryStateBoundary>
    </Command>
  );

  if (isMobile) {
    return (
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 border-t">{commandContent}</div>
      </DrawerContent>
    );
  }

  return (
    <PopoverContent className="w-72 p-0" align="start">
      {commandContent}
    </PopoverContent>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

interface SearchableSelectorLoadingSkeletonProps {
  count?: number;
  children: React.ReactNode;
}

export function SearchableSelectorLoadingSkeleton({
  count = 3,
  children,
}: SearchableSelectorLoadingSkeletonProps) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, idx) => (
        <Fragment key={idx}>{children}</Fragment>
      ))}
    </div>
  );
}

// ─── Empty ───────────────────────────────────────────────────────────────────

interface SearchableSelectorEmptyProps {
  icon: React.ReactNode;
  message: string;
}

export function SearchableSelectorEmpty({
  icon,
  message,
}: SearchableSelectorEmptyProps) {
  return (
    <CommandEmpty className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
      {icon}
      <span>{message}</span>
    </CommandEmpty>
  );
}

// ─── Item ────────────────────────────────────────────────────────────────────

interface SearchableSelectorItemProps<T> extends React.ComponentProps<
  typeof CommandItem
> {
  item: T;
  getItemId: (item: T) => string;
}

export function SearchableSelectorItem<T>({
  children,
  item,
  getItemId,
  ...props
}: SearchableSelectorItemProps<T>) {
  const { handleSelect, value, multiple } = useSearchableSelectorContext();
  const itemId = getItemId(item);
  const isChecked = multiple
    ? Array.isArray(value) && value.includes(itemId)
    : itemId === value;

  return (
    <CommandItem
      onSelect={() => handleSelect(itemId)}
      data-checked={isChecked}
      {...props}
    >
      {children}
    </CommandItem>
  );
}
