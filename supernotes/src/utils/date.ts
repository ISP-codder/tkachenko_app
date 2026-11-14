/** YYYY-MM-DD в локальной таймзоне */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Человекочитаемая дата для списка дней */
export function formatDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });
}

/** Формат времени HH:MM */
export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** «сегодня» / «вчера» / дата */
export function humanDay(key: string): string {
  const today = dayKey(Date.now());
  const yest = dayKey(Date.now() - 86400000);
  if (key === today) return 'Сегодня';
  if (key === yest) return 'Вчера';
  return formatDay(key);
}