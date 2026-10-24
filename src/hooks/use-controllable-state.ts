import { useCallback, useState } from "react";

import { useAsRef } from "./use-as-ref";
import { useCallbackRef } from "./use-callback-ref";

interface UseControllableStateParams<T> {
  prop?: T;
  defaultProp: T;
  onChange?: (value: T) => void;
}

type SetStateAction<T> = T | ((prev: T) => T);

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {},
}: UseControllableStateParams<T>): readonly [
  T,
  (nextValue: T | ((prev: T) => T)) => void,
] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;

  const onChangeRef = useCallbackRef(onChange);
  const valueRef = useAsRef(value);

  const setValue = useCallback(
    (next: SetStateAction<T>) => {
      const prev = valueRef.current;
      const newValue =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;

      if (Object.is(newValue, prev)) return;

      if (!isControlled) {
        valueRef.current = newValue;
        setUncontrolledValue(newValue);
      }
      onChangeRef(newValue);
    },
    [isControlled, onChangeRef, valueRef]
  );

  return [value, setValue] as const;
}
