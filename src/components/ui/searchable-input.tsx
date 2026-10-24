import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "cn";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

import { Input } from "./input";

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
  "aria-invalid"?: boolean;
  options: readonly TOption[] | undefined;
  onSearch?: (query: string) => void;
  searchDebounceMs?: number;
  getOptionKey: (option: TOption) => string;
  getOptionLabel: (option: TOption) => string;
  renderOption?: (option: TOption) => ReactNode;
  onOptionSelect?: (option: TOption) => void;
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
  "aria-invalid": ariaInvalid,
  options,
  onSearch,
  searchDebounceMs = 300,
  getOptionKey,
  getOptionLabel,
  renderOption,
  onOptionSelect,
}: SearchableInputProps<TOption>) {
  const generatedId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpenRequested, setIsOpenRequested] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<SearchableInputPosition | null>(
    null
  );

  const inputId = id ?? generatedId;
  const items = options ?? [];
  const isOpen = isOpenRequested && items.length > 0;

  const debouncedSearch = useDebouncedCallback(
    (query: string) => onSearch?.(query),
    searchDebounceMs
  );

  useLayoutEffect(() => {
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
  }, []);

  const selectOption = useCallback(
    (option: TOption) => {
      onChange?.(getOptionLabel(option));
      onOptionSelect?.(option);
      closeList();
    },
    [closeList, getOptionLabel, onChange, onOptionSelect]
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
    [debouncedSearch, onChange, onValueChange]
  );

  const handleOnKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (items.length === 0) return;
        event.preventDefault();
        if (!isOpen) {
          setIsOpenRequested(true);
          return;
        }
        const lastIndex = items.length - 1;
        if (event.key === "ArrowDown") {
          setActiveIndex(activeIndex >= lastIndex ? 0 : activeIndex + 1);
        } else {
          setActiveIndex(activeIndex <= 0 ? lastIndex : activeIndex - 1);
        }
        return;
      }

      if (event.key === "Enter" && isOpen && activeIndex >= 0) {
        const option = items[activeIndex];
        if (!option) return;
        event.preventDefault();
        selectOption(option);
        return;
      }

      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeList();
      }
    },
    [activeIndex, closeList, isOpen, items, selectOption]
  );

  const handleOnBlur = useCallback(() => {
    onBlur?.();
    closeList();
  }, [closeList, onBlur]);

  const setInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      inputRef.current = element;

      if (typeof externalInputRef === "function") {
        externalInputRef(element);
      } else if (externalInputRef) {
        externalInputRef.current = element;
      }
    },
    [externalInputRef]
  );

  return (
    <>
      <Input
        ref={setInputRef}
        id={inputId}
        name={name}
        role="combobox"
        type="text"
        autoComplete="off"
        className={className}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        aria-invalid={ariaInvalid}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        onBlur={handleOnBlur}
      />
      {isOpen && position && (
        <SearchableInputContent position={position}>
          <SearchableInputList id={listboxId}>
            {items.map((option, index) => {
              const isActive = index === activeIndex;
              return (
                <SearchableInputItem
                  key={getOptionKey(option)}
                  id={`${id}-${index}`}
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
