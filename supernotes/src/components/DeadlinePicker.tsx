import type { Deadline } from '../types';

function todayAt(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function toHHMM(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function DeadlinePicker({
  value,
  onChange,
}: {
  value?: Deadline;
  onChange: (d: Deadline | undefined) => void;
}) {
  const enabled = !!value;
  const start = value ? toHHMM(value.start) : '10:00';
  const end = value ? toHHMM(value.end) : '11:00';

  function setEnabled(on: boolean) {
    if (on) {
      onChange({ start: todayAt('10:00'), end: todayAt('11:00') });
    } else {
      onChange(undefined);
    }
  }

  return (
    <div className="field">
      <label className="checkbox-row" style={{ marginBottom: 0 }}>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Дедлайн (интервал)
      </label>
      {enabled && value && (
        <div className="row" style={{ marginTop: 8 }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label>с</label>
            <input
              type="time"
              value={start}
              onChange={(e) =>
                onChange({ start: todayAt(e.target.value), end: value.end })
              }
            />
          </div>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label>до</label>
            <input
              type="time"
              value={end}
              onChange={(e) =>
                onChange({ start: value.start, end: todayAt(e.target.value) })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}