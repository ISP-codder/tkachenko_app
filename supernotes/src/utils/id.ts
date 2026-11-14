export function uid(): string {
  // crypto.randomUUID есть в современных браузерах и в Safari 15.4+
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}