import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "cn";

import { useAsRef } from "@/hooks/use-as-ref";
import { useCallbackRef } from "@/hooks/use-callback-ref";
import { useComposedRefs } from "@/hooks/use-composed-refs";
import { useControllableState } from "@/hooks/use-controllable-state";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";

import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

interface SearchableInputPosition {
  top: number;
  left: number;
  width: number;
}

interface SearchableInputProps<TOption> {
  id?: string;
  name?: string;
  value: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  "aria-invalid"?: boolean;
  options: readonly TOption[] | undefined;
  onSearch?: (query: string) => void;
  searchDebounceMs?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  getOptionKey: (option: TOption) => string;
  getOptionLabel: (option: TOption) => string;
  renderOption?: (option: TOption) => ReactNode;
  onOptionSelect?: (option: TOption) => void;
  firstAddon?: React.ReactNode;
  secondAddon?: React.ReactNode;
}

function SearchableInput<TOption>({
  id,
  name,
  value,
  onChange,
  onValueChange,
  onBlur,
  inputRef: externalInputRef,
  placeholder,
  disabled = false,
  className,
  inputClassName,
  options,
  onSearch,
  searchDebounceMs = 300,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  getOptionKey,
  getOptionLabel,
  renderOption,
  onOptionSelect,
  firstAddon,
  secondAddon,
  ...props
}: SearchableInputProps<TOption>) {
  const generatedId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInputRef = useComposedRefs(inputRef, externalInputRef);
  const [isOpenRequested, setIsOpenRequested] = useControllableState({
    prop: openProp,
    defaultProp: false,
    onChange: onOpenChange,
  });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<SearchableInputPosition | null>(
    null
  );

  const inputId = id ?? generatedId;
  const items = useMemo(() => options ?? [], [options]);
  const isOpen = isOpenRequested && items.length > 0;
  const itemsRef = useAsRef(items);
  const isOpenRef = useAsRef(isOpen);
  const stableGetOptionLabel = useCallbackRef(getOptionLabel);
  const stableOnOptionSelect = useCallbackRef(onOptionSelect);

  const debouncedSearch = useDebouncedCallback(
    (query: string) => onSearch?.(query),
    searchDebounceMs
  );

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const closeList = useCallback(() => {
    setIsOpenRequested(false);
    setActiveIndex(-1);
  }, [setIsOpenRequested]);

  const selectOption = useCallback(
    (option: TOption) => {
      debouncedSearch.cancel();
      onChange?.(stableGetOptionLabel(option));
      stableOnOptionSelect(option);
      closeList();
    },
    [
      closeList,
      debouncedSearch,
      onChange,
      stableGetOptionLabel,
      stableOnOptionSelect,
    ]
  );

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      onChange?.(nextValue);
      onValueChange?.(nextValue);
      setIsOpenRequested(true);
      setActiveIndex(-1);
      debouncedSearch(nextValue);
    },
    [debouncedSearch, onChange, onValueChange, setIsOpenRequested]
  );

  const handleOnKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const currentItems = itemsRef.current;
      const currentIsOpen = isOpenRef.current;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (currentItems.length === 0) return;
        event.preventDefault();
        if (!currentIsOpen) {
          setIsOpenRequested(true);
          return;
        }
        const lastIndex = currentItems.length - 1;
        if (event.key === "ArrowDown") {
          setActiveIndex(activeIndex >= lastIndex ? 0 : activeIndex + 1);
        } else {
          setActiveIndex(activeIndex <= 0 ? lastIndex : activeIndex - 1);
        }
        return;
      }

      if (event.key === "Enter" && currentIsOpen && activeIndex >= 0) {
        const option = currentItems[activeIndex];
        if (!option) return;
        event.preventDefault();
        selectOption(option);
        return;
      }

      if (event.key === "Escape" && currentIsOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeList();
      }
    },
    [
      activeIndex,
      closeList,
      isOpenRef,
      itemsRef,
      selectOption,
      setIsOpenRequested,
    ]
  );

  const handleOnFocus = useCallback(() => {
    if (defaultOpen) setIsOpenRequested(true);
  }, [defaultOpen, setIsOpenRequested]);

  const handleOnBlur = useCallback(() => {
    onBlur?.();
    closeList();
  }, [closeList, onBlur]);

  return (
    <>
      <InputGroup className={className}>
        {firstAddon && (
          <InputGroupAddon align="inline-start">{firstAddon}</InputGroupAddon>
        )}
        <InputGroupInput
          {...props}
          ref={setInputRef}
          id={inputId}
          name={name}
          role="combobox"
          type="text"
          autoComplete="off"
          className={inputClassName}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={
            isOpen && activeIndex >= 0
              ? `${listboxId}-${activeIndex}`
              : undefined
          }
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={handleOnChange}
          onKeyDown={handleOnKeyDown}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        />
        {secondAddon && (
          <InputGroupAddon align="inline-end">{secondAddon}</InputGroupAddon>
        )}
      </InputGroup>
      {isOpen && position && (
        <SearchableInputContent position={position}>
          <SearchableInputList id={listboxId}>
            {items.map((option, index) => {
              const isActive = index === activeIndex;
              return (
                <SearchableInputItem
                  key={getOptionKey(option)}
                  id={`${listboxId}-${index}`}
                  active={isActive}
                  onSelect={() => selectOption(option)}
                  onActive={() => setActiveIndex(index)}
                >
                  {renderOption ? renderOption(option) : getOptionLabel(option)}
                </SearchableInputItem>
              );
            })}
          </SearchableInputList>
        </SearchableInputContent>
      )}
    </>
  );
}

interface SearchableInputContentProps {
  position: SearchableInputPosition;
  className?: string;
  children: ReactNode;
}

function SearchableInputContent({
  position,
  className,
  children,
}: SearchableInputContentProps) {
  return createPortal(
    <div style={position} className={cn("fixed z-50", className)}>
      {children}
    </div>,
    document.body
  );
}

interface SearchableInputListProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

function SearchableInputList({
  id,
  children,
  className,
}: SearchableInputListProps) {
  return (
    <ul
      id={id}
      role="listbox"
      className={cn(
        "max-h-75 w-full overflow-y-auto rounded-lg bg-popover p-1 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10",
        className
      )}
    >
      {children}
    </ul>
  );
}

interface SearchableInputItemProps {
  id: string;
  active: boolean;
  onSelect: () => void;
  onActive: () => void;
  className?: string;
  children: ReactNode;
}

function SearchableInputItem({
  id,
  active,
  onSelect,
  onActive,
  className,
  children,
}: SearchableInputItemProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={onActive}
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-md px-2 py-1.5",
        active && "bg-accent text-accent-foreground",
        className
      )}
    >
      {children}
    </li>
  );
}

export {
  SearchableInput,
  SearchableInputContent,
  SearchableInputItem,
  SearchableInputList,
};
export type {
  SearchableInputContentProps,
  SearchableInputItemProps,
  SearchableInputListProps,
  SearchableInputPosition,
  SearchableInputProps,
};
