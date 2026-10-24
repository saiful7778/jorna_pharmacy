export function strInitials(name: string, length: number = 2) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, length);
}
