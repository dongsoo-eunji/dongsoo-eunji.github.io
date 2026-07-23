export function shiftAccountDigits(value: string): string {
  return value.replace(/\d/g, (digit) =>
    String((Number.parseInt(digit, 10) + 5) % 10),
  );
}
