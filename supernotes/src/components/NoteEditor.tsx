import { useState } from 'react';
import { ChevronLeft, Calendar, Clock } from 'lucide-react';
import { useStore } from '../state/store';
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

export function NoteEditor({
  noteId,
  onDone,
}: {
  noteId?: string;
  onDone: () => void;
}) {
  const note = useStore((s) => (noteId ? s.notes.find((n) => n.id === noteId) : undefined));
  const activeGroupId = useStore((s) => s.activeGroupId);
  const createNote = useStore((s) => s.createNote);
  const updateNote = useStore((s) => s.updateNote);

  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [deadline, setDeadline] = useState<Deadline | undefined>(note?.deadline);

  function save() {
    if (!title.trim() && !body.trim()) {
      onDone(); // не сохраняем пустую заметку
      return;
    }
    if (note) {
      updateNote(note.id, { title, body, deadline });
    } else {
      createNote(activeGroupId, title, body, deadline);
    }
    onDone();
  }

  const hasDeadline = !!deadline;

  return (
    <div className="note-editor">
      <div className="note-editor__header">
        <button className="icon-btn" onClick={onDone}>
          <ChevronLeft size={24} />
        </button>
        <button className="btn-primary" onClick={save} style={{ padding: '8px 16px' }}>
          Сохранить
        </button>
      </div>

      <div className="note-editor__content">
        <input
          type="text"
          className="note-editor__title serif"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus={!note}
        />
        
        <textarea
          className="note-editor__body"
          placeholder="Текст заметки..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
        />

        <div className="note-editor__deadline-block">
          <label className="toggle-row" style={{ marginBottom: 0 }}>
            <div className="toggle-row__text">
              <Clock size={16} className="toggle-row__icon" />
              Дедлайн
            </div>
            <input
              type="checkbox"
              checked={hasDeadline}
              onChange={(e) => {
                if (e.target.checked) {
                  setDeadline({ start: todayAt('10:00'), end: todayAt('11:00') });
                } else {
                  setDeadline(undefined);
                }
              }}
            />
          </label>

          {hasDeadline && deadline && (
            <div className="deadline-inputs">
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <label>Начало</label>
                <input
                  type="time"
                  value={toHHMM(deadline.start)}
                  onChange={(e) =>
                    setDeadline({ start: todayAt(e.target.value), end: deadline.end })
                  }
                />
              </div>
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <label>Конец</label>
                <input
                  type="time"
                  value={toHHMM(deadline.end)}
                  onChange={(e) =>
                    setDeadline({ start: deadline.start, end: todayAt(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}