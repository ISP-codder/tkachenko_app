import { ChevronLeft, Pencil, Check } from 'lucide-react';
import { useStore } from '../state/store';
import { formatTime, formatDay, dayKey } from '../utils/date';

export function NoteView({
  noteId,
  onBack,
  onEdit,
}: {
  noteId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}) {
  const note = useStore((s) => s.notes.find((n) => n.id === noteId));
  const toggleComplete = useStore((s) => s.toggleComplete);

  if (!note) return null;
  const done = !!note.completedAt;

  return (
    <div className="note-view">
      <div className="note-view__header">
        <button className="icon-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="row" style={{ gap: 8 }}>
          <button className="icon-btn" onClick={() => onEdit(note.id)}>
            <Pencil size={20} />
          </button>
          <button
            className={`icon-btn ${done ? 'icon-btn--active' : ''}`}
            onClick={() => toggleComplete(note.id)}
            style={{ color: done ? 'var(--green)' : 'inherit' }}
          >
            <Check size={20} />
          </button>
        </div>
      </div>

      <div className="note-view__content">
        <h1 className={`note-view__title serif ${done ? 'text-strike' : ''}`}>
          {note.title || 'Без названия'}
        </h1>
        
        <div className="note-view__meta">
          <span>{formatDay(dayKey(note.createdAt))}</span>
          {note.deadline && (
            <span style={{ color: 'var(--yellow)' }}>
              ⏰ {formatTime(note.deadline.start)}–{formatTime(note.deadline.end)}
            </span>
          )}
        </div>

        <div className={`note-view__body ${done ? 'text-strike' : ''}`}>
          {note.body}
        </div>
      </div>
    </div>
  );
}