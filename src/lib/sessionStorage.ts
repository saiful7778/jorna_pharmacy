export function setItem(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(err);
  }
}

export function getItem<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const data = window.sessionStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : undefined;
  } catch (err) {
    console.error(err);
  }
}

export function removeItem(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(key);
  } catch (err) {
    console.error(err);
  }
}
