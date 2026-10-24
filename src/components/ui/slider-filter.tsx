import { useCallback, useEffect, useState } from "react";

import { cn } from "cn";
import { PlusCircle, X } from "lucide-react";

import { useControllableState } from "@/hooks/use-controllable-state";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useIsMobile } from "@/hooks/use-mobile";

import { Button, type ButtonProps } from "./button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Field, FieldLabel } from "./field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";
import { Slider } from "./slider";

type RangeValue = [number, number];

export interface SliderFilterProps {
  value?: RangeValue;
  onValueChange?: (value: RangeValue | undefined) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  debounceMs?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SliderFilter({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  placeholder = "Filter",
  variant = "outline",
  size = "sm",
  className,
  debounceMs = 300,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: SliderFilterProps) {
  "use no memo";
  const isMobile = useIsMobile();
  const [open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    defaultProp: false,
    onChange: controlledOnOpenChange,
  });

  const [displayRange, setDisplayRange] = useState<RangeValue>(
    value ?? [min, max]
  );

  useEffect(() => {
    queueMicrotask(() => {
      setDisplayRange(value ?? [min, max]);
    });
  }, [value, min, max]);

  const commitFilter = useDebouncedCallback(
    (next: RangeValue | undefined) => onValueChange?.(next),
    debounceMs
  );

  const update = useCallback(
    (next: RangeValue) => {
      setDisplayRange(next);
      commitFilter(next);
    },
    [commitFilter]
  );

  const handleReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDisplayRange([min, max]);
      onValueChange?.(undefined);
    },
    [min, max, onValueChange]
  );

  const createInputHandler = useCallback(
    (index: 0 | 1) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (Number.isNaN(val)) return;

      const next: RangeValue =
        index === 0
          ? [Math.max(min, Math.min(val, displayRange[1])), displayRange[1]]
          : [displayRange[0], Math.min(max, Math.max(val, displayRange[0]))];

      update(next);
    },
    [min, max, displayRange, update]
  );

  const handleSlider = useCallback(
    (val: number | readonly number[]) => {
      if (Array.isArray(val) && val.length === 2) {
        update([val[0], val[1]]);
      }
    },
    [update]
  );

  const handleBlur = useCallback(
    (index: 0 | 1) => () => {
      const val = displayRange[index];
      if (index === 0 && val < min) update([min, displayRange[1]]);
      else if (index === 1 && val > max) update([displayRange[0], max]);
    },
    [displayRange, min, max, update]
  );

  const trigger = (
    <SliderFilterTrigger
      placeholder={placeholder}
      value={value}
      unit={unit}
      variant={variant}
      size={size}
      className={className}
    />
  );

  const content = (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          {(["from", "to"] as const).map((type, index) => {
            const i = index as 0 | 1;
            const inputMin = i === 0 ? min : displayRange[0];
            const inputMax = i === 1 ? max : displayRange[1];

            return (
              <Field key={type}>
                <FieldLabel className="sr-only">{type}</FieldLabel>
                <InputGroup className="w-24">
                  <InputGroupInput
                    type="number"
                    inputMode="numeric"
                    autoComplete="off"
                    pattern="[0-9]*"
                    min={inputMin}
                    max={inputMax}
                    placeholder={(i === 0 ? min : max).toString()}
                    value={displayRange[i].toString()}
                    onChange={createInputHandler(i)}
                    onBlur={handleBlur(i)}
                  />
                  {unit && (
                    <InputGroupAddon align="inline-end">{unit}</InputGroupAddon>
                  )}
                </InputGroup>
              </Field>
            );
          })}
        </div>
        <Field>
          <FieldLabel className="sr-only">Slider</FieldLabel>
          <Slider
            min={min}
            max={max}
            step={step}
            value={displayRange}
            onValueChange={handleSlider}
          />
        </Field>
      </div>
      <Button variant="secondary" size="sm" onClick={handleReset}>
        <X className="mr-2 size-4" />
        <span>Clear filter</span>
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder}</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="border-t">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent align="start" className="w-auto p-0">
        {content}
      </PopoverContent>
    </Popover>
  );
}

interface SliderFilterTriggerProps extends Omit<ButtonProps, "value"> {
  placeholder?: string;
  value: RangeValue | undefined;
  unit?: string;
}

function SliderFilterTrigger({
  placeholder,
  value,
  unit,
  className,
  variant = "outline",
  size = "sm",
  ...props
}: SliderFilterTriggerProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("border-dashed font-normal", className)}
      {...props}
    >
      <PlusCircle className="mr-2 size-4" />
      <span>{placeholder}</span>

      {value && (
        <>
          <Separator orientation="vertical" className="mx-2" />
          <span>{`${value[0].toLocaleString()} - ${value[1].toLocaleString()}`}</span>
          {unit && <span className="ml-1">{unit}</span>}
        </>
      )}
    </Button>
  );
}
