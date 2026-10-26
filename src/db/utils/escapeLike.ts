/**
 * Escapes SQL LIKE wildcard characters (`%`, `_`) and the escape
 * character itself (`\`) so that user input is treated as a literal
 * substring when used with `LIKE ... ESCAPE '\'`.
 *
 * Order matters: backslash MUST be escaped first, otherwise we'd
 * double-escape the backslashes we add for `%` and `_`.
 */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
