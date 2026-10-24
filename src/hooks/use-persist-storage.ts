import { useCallback, useState } from "react";

import * as local from "@/lib/localStorage";
import * as session from "@/lib/sessionStorage";

import { useAsRef } from "./use-as-ref";

export type DispatchAction<T> = T | ((prevState: T) => T);
export type PersistStorageType = "local" | "session";

interface WebStorage {
  getItem: <T>(key: string) => T | undefined;
  setItem: (key: string, value: unknown) => void;
  removeItem: (key: string) => void;
}

const storages: Record<PersistStorageType, WebStorage> = {
  local,
  session,
};

export function usePersistStorage<T>(
  key: string,
  initialData: T,
  type: PersistStorageType = "local"
) {
  const storage = storages[type];
  const initialDataRef = useAsRef(initialData);

  const [value, setValue] = useState(() => {
    const item = storage.getItem<T>(key);
    return item === undefined ? initialData : item;
  });
  const valueRef = useAsRef(value);

  const handleDispatch = useCallback(
    (action: DispatchAction<T>) => {
      const prev = valueRef.current;
      const next =
        typeof action === "function"
          ? (action as (prevState: T) => T)(prev)
          : action;

      if (Object.is(next, prev)) return;

      valueRef.current = next;
      setValue(next);
      storage.setItem(key, next);
    },
    [key, storage, valueRef]
  );

  const handleRemove = useCallback(() => {
    storage.removeItem(key);
    const next = initialDataRef.current;
    valueRef.current = next;
    setValue(next);
  }, [key, storage, initialDataRef, valueRef]);

  return [value, handleDispatch, handleRemove] as const;
}
