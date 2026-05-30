export function todayISO(): string {
  return new Date().toISOString().split("T")[0]!;
}
