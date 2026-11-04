export function gardenWeekDates(todayIso: string): string[] {
  const today = new Date(`${todayIso}T00:00:00Z`);
  const fromMonday = (today.getUTCDay() + 6) % 7;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - fromMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}
