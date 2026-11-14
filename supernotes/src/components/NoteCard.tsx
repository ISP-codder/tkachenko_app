import { useRef, useState } from 'react';
import type { Note } from '../types';
import { CompleteCircle } from './CompeteCircle';
import { formatTime } from '../utils/date';
import { getNoteStatus } from '../utils/status';
import { Pin, Clock, Pencil, Trash2 } from 'lucide-react';
import './NoteCard.css';

const LEFT_ACTIONS_W = 76 * 2; // Изменить + Удалить
const RIGHT_ACTIONS_W = 76;    // Закрепить
const OPEN_THRESHOLD = 0.35;   // доля ширины для открытия
const VELOCITY_THRESHOLD = 0.5; // px/ms — быстрый свайп
const DIRECTION_LOCK = 8;      // px до определения оси

type Props = {
  note: Note;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onTogglePin: () => void;
};

export function NoteCard({
  note,
  onOpen,
  onEdit,
  onDelete,
  onToggleComplete,
  onTogglePin,
}: Props) {
  const [dx, setDx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dragging, setDragging] = useState(false);

  const start = useRef<{ x: number; y: number; time: number } | null>(null);
  const axis = useRef<'x' | 'y' | null>(null);
  const moved = useRef(false);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  const status = getNoteStatus(note);

  function lockOpen(next: number) {
    setAnimating(true);
    setDx(next);
    setTimeout(() => setAnimating(false), 220);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== undefined && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    lastX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
    axis.current = null;
    moved.current = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!start.current) return;
    const deltaX = e.clientX - start.current.x;
    const deltaY = e.clientY - start.current.y;

    if (!axis.current) {
      if (Math.abs(deltaX) > DIRECTION_LOCK || Math.abs(deltaY) > DIRECTION_LOCK) {
        axis.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
      } else {
        return;
      }
    }

    if (axis.current === 'y') return;

    if (Math.abs(deltaX) > 3) moved.current = true;

    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) velocity.current = (e.clientX - lastX.current) / dt;
    lastX.current = e.clientX;
    lastTime.current = now;

    const baseDx = dx;
    let next = baseDx + deltaX;
    if (next > RIGHT_ACTIONS_W) {
      next = RIGHT_ACTIONS_W + (next - RIGHT_ACTIONS_W) * 0.3;
    } else if (next < -LEFT_ACTIONS_W) {
      next = -LEFT_ACTIONS_W + (next + LEFT_ACTIONS_W) * 0.3;
    }
    setDx(next);
    start.current = { x: e.clientX, y: e.clientY, time: now };
  }

  function onPointerUp() {
    if (!start.current) return;
    start.current = null;
    setDragging(false);

    const v = velocity.current;
    const fast = Math.abs(v) > VELOCITY_THRESHOLD;

    let target = 0;
    if (fast && v < 0) {
      target = -LEFT_ACTIONS_W;
    } else if (fast && v > 0) {
      target = RIGHT_ACTIONS_W;
    } else if (dx <= -LEFT_ACTIONS_W * OPEN_THRESHOLD) {
      target = -LEFT_ACTIONS_W;
    } else if (dx >= RIGHT_ACTIONS_W * OPEN_THRESHOLD) {
      target = RIGHT_ACTIONS_W;
    }

    lockOpen(target);
    if (target !== 0 && 'vibrate' in navigator) {
      navigator.vibrate?.(8);
    }
  }

  function handleClick() {
    if (moved.current) {
      if (dx !== 0) lockOpen(0);
      moved.current = false;
      return;
    }
    if (dx !== 0) {
      lockOpen(0);
      return;
    }
    onOpen();
  }

  function closeAnd(action: () => void) {
    lockOpen(0);
    setTimeout(action, 120);
  }

  const deadlineLabel = note.deadline
    ? `${formatTime(note.deadline.start)}–${formatTime(note.deadline.end)}`
    : null;

  const rightProg = Math.min(1, Math.max(0, dx / RIGHT_ACTIONS_W));
  const leftProg = Math.min(1, Math.max(0, -dx / LEFT_ACTIONS_W));

  return (
    <div className="note-card-wrap">
      {/* Левые действия (выезжают при свайпе влево) */}
      <div
        className="note-actions note-actions--right"
        style={{
          opacity: leftProg,
          transform: `translateX(${(1 - leftProg) * 20}px)`,
        }}
      >
        <button
          className="note-action note-action--edit"
          onClick={() => closeAnd(onEdit)}
          style={{ transform: `scale(${0.8 + leftProg * 0.2})` }}
        >
          <Pencil size={18} />
          <span className="note-action__label">Изменить</span>
        </button>
        <button
          className="note-action note-action--delete"
          onClick={() => closeAnd(onDelete)}
          style={{ transform: `scale(${0.8 + leftProg * 0.2})` }}
        >
          <Trash2 size={18} />
          <span className="note-action__label">Удалить</span>
        </button>
      </div>

      {/* Правые действия (выезжают при свайпе вправо) */}
      <div
        className="note-actions note-actions--left"
        style={{
          opacity: rightProg,
          transform: `translateX(${-(1 - rightProg) * 20}px)`,
        }}
      >
        <button
          className="note-action note-action--pin"
          onClick={() => closeAnd(onTogglePin)}
          style={{ transform: `scale(${0.8 + rightProg * 0.2})` }}
        >
          <Pin size={18} />
          <span className="note-action__label">{note.pinned ? 'Открепить' : 'Закрепить'}</span>
        </button>
      </div>

      {/* Сама карточка */}
      <div
        className={
          'note-card' +
          (status === 'on-time' ? ' note-card--done' : '') +
          (status === 'late' ? ' note-card--late' : '') +
          (note.pinned ? ' note-card--pinned' : '') +
          (dragging ? ' note-card--dragging' : '') +
          (animating ? ' note-card--animating' : '')
        }
        style={{ transform: `translateX(${dx}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={handleClick}
      >
        <CompleteCircle status={status} onToggle={onToggleComplete} />
        <div className="note-card__content">
          <div className="note-card__title">
            {note.pinned && <Pin size={12} className="note-card__pin" />}
            <span className="note-card__title-text">{note.title || 'Без названия'}</span>
          </div>
          
          {note.body && <div className="note-card__body">{note.body}</div>}
          
          {deadlineLabel && (
            <div className="note-card__deadline">
              <Clock size={12} className="note-card__deadline-icon" />
              {deadlineLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}