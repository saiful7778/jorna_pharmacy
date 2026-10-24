export function formatCurrency(
  value: number,
  options?: Intl.NumberFormatOptions
) {
  const number = new Intl.NumberFormat("en-US", {
    ...options,
  }).format(value);
  return `${number} ৳`;
}
