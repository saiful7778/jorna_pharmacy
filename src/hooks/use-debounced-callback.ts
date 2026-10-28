import { useCallback, useEffect, useMemo, useRef } from "react";

import { useCallbackRef } from "./use-callback-ref";

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);

  const cancel = useCallback(() => {
    window.clearTimeout(debounceTimerRef.current);
  }, []);

  const setValue = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      debounceTimerRef.current = window.setTimeout(
        () => handleCallback(...args),
        delay
      );
    },
    [cancel, handleCallback, delay]
  );

  // eslint-disable-next-line react-hooks/refs -- cancel only touches the timer ref when called, not during render
  return useMemo(() => Object.assign(setValue, { cancel }), [setValue, cancel]);
}
