import { useMemo } from 'react';
import { useStore } from '../state/store';
import { dayKey, humanDay } from '../utils/date';
import './StatsDrawer.css';
import { getNoteStatus } from '../utils/status';

type DayStat = {
  key: string;
  total: number;
  doneOnTime: number;
  doneLate: number;
  pending: number;
};

type NoteLike = {
  createdAt: number;
  completedAt?: number;
  deadline?: { end: number };
};

function isOnTime(n: NoteLike): boolean {
  if (!n.completedAt) return false;
  if (!n.deadline) return true;
  return n.completedAt <= n.deadline.end;
}

function computeStats(notes: NoteLike[]): DayStat[] {
  const byDay = new Map<string, DayStat>();

  for (const n of notes) {
    const key = dayKey(n.createdAt);
    let stat = byDay.get(key);
    if (!stat) {
      stat = { key, total: 0, doneOnTime: 0, doneLate: 0, pending: 0 };
      byDay.set(key, stat);
    }
    stat.total++;
    const s = getNoteStatus(n as any); // n должен иметь completedAt/deadline
    if (s === 'on-time') stat.doneOnTime++;
    else if (s === 'late') stat.doneLate++;
    else stat.pending++;
  }

  return Array.from(byDay.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}

export function StatsDrawer({ onClose }: { onClose: () => void }) {
  const notes = useStore((s) => s.notes);

  // Ключевой момент: считаем по "срезу" данных, чтобы useMemo
  // точно зависел от изменений completedAt/deadline.
  const totals = useMemo(() => {
  const total = notes.length;
  const totalDone = notes.filter((n) => n.completedAt).length;
  const onTime = notes.filter((n) => getNoteStatus(n) === 'on-time').length;
  const late = notes.filter((n) => getNoteStatus(n) === 'late').length;
  const pending = total - onTime - late;
  return { total, totalDone, onTime, late, pending };
}, [notes]);
  const days = useMemo(() => computeStats(notes), [notes]);

  const radius = 60;
const circumference = 2 * Math.PI * radius;

const totalForChart = totals.total || 1; // защита от деления на 0
const greenLen = (totals.onTime / totalForChart) * circumference;
const yellowLen = (totals.late / totalForChart) * circumference;
const grayLen = circumference - greenLen - yellowLen;

// Начинаем от 12 часов: смещаем на -90° (в SVG dashoffset работает против часовой)
const offsetGreen = circumference / 4;
const offsetYellow = offsetGreen - greenLen;
const offsetGray = offsetYellow - yellowLen;
  return (
    <div className="stats-drawer" onClick={onClose}>
      <div className="stats-drawer__panel" onClick={(e) => e.stopPropagation()}>
        <div className="stats-drawer__header">
          <h2>Статистика</h2>
          <button className="btn" onClick={onClose}>
            Закрыть
          </button>
        </div>

        <div className="stats-drawer__chart">
          <svg width="160" height="160" viewBox="0 0 160 160">
  {/* фон: серый круг = "невыполненные/остальные" */}
  <circle
    cx="80"
    cy="80"
    r={radius}
    fill="none"
    stroke="var(--bg-elev-2)"
    strokeWidth="16"
  />

  {/* зелёный — выполнено в срок */}
  {greenLen > 0 && (
    <circle
      cx="80"
      cy="80"
      r={radius}
      fill="none"
      stroke="var(--green)"
      strokeWidth="16"
      strokeDasharray={`${greenLen} ${circumference - greenLen}`}
      strokeDashoffset={offsetGreen}
      strokeLinecap="butt"
      style={{ transition: 'stroke-dasharray 0.35s ease, stroke-dashoffset 0.35s ease' }}
    />
  )}

  {/* жёлтый — выполнено не в срок */}
  {yellowLen > 0 && (
    <circle
      cx="80"
      cy="80"
      r={radius}
      fill="none"
      stroke="var(--yellow)"
      strokeWidth="16"
      strokeDasharray={`${yellowLen} ${circumference - yellowLen}`}
      strokeDashoffset={offsetYellow}
      strokeLinecap="butt"
      style={{ transition: 'stroke-dasharray 0.35s ease, stroke-dashoffset 0.35s ease' }}
    />
  )}

  <text
    x="80"
    y="76"
    textAnchor="middle"
    fill="var(--text)"
    fontSize="26"
    fontWeight="700"
  >
    {totals.totalDone}
  </text>
  <text x="80" y="98" textAnchor="middle" fill="var(--text-dim)" fontSize="12">
    выполнено
  </text>
</svg>
         <div className="stats-drawer__legend">
  <div>
    <span className="dot dot--green" /> В срок: {totals.onTime}
  </div>
  <div>
    <span className="dot dot--yellow" /> Не в срок: {totals.late}
  </div>
  <div>
    <span className="dot dot--gray" /> Не выполнено: {totals.pending}
  </div>
  <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
    Всего заметок: {totals.total}
  </div>
</div>
        </div>

        <h3 style={{ marginTop: 8 }}>Активные дни</h3>
        <div className="stats-drawer__days">
          {days.length === 0 && <div style={{ color: 'var(--text-dim)' }}>Пока нет данных</div>}
          {days.map((d) => (
            <div key={d.key} className="stats-day">
              <div className="stats-day__name">{humanDay(d.key)}</div>
              <div className="stats-day__nums">
  <span style={{ color: 'var(--green)' }}>{d.doneOnTime}</span>
  <span style={{ color: 'var(--yellow)' }}>{d.doneLate}</span>
  <span style={{ color: 'var(--text-dim)' }}>{d.pending}</span>
  <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>из {d.total}</span>
</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}