import { useMemo, useRef } from 'react';
import { useStore } from '../state/store';
import { NoteCard } from './NoteCard';
import './NoteList.css';

type Props = {
  onCreate: () => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onSwipeLeftEmpty: () => void;
};

export function NoteList({ onCreate, onOpen, onEdit, onSwipeLeftEmpty }: Props) {
  const notes = useStore((s) => s.notes);
  const activeGroupId = useStore((s) => s.activeGroupId);
  const toggleComplete = useStore((s) => s.toggleComplete);
  const togglePin = useStore((s) => s.togglePin);
  const deleteNote = useStore((s) => s.deleteNote);

  const groupNotes = useMemo(() => {
    return notes
      .filter((n) => n.groupId === activeGroupId)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
  }, [notes, activeGroupId]);

  const emptyRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  // свайп влево по пустому месту → открыть навбар
  function onPointerDown(e: React.PointerEvent) {
    if (e.target !== emptyRef.current) return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) && dx > 0) {
  swipeStart.current = null;
  onSwipeLeftEmpty();
}
  }
  function onPointerUp() {
    swipeStart.current = null;
  }

  return (
    <div className="note-list">
      <div
        ref={emptyRef}
        className="note-list__empty-swipe"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-hidden
      />
      <div className="note-list__scroll">
        {groupNotes.length === 0 && (
          <div className="note-list__placeholder">Пока пусто. Добавьте первую заметку.</div>
        )}
        {groupNotes.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            onOpen={() => onOpen(n.id)}
            onEdit={() => onEdit(n.id)}
            onDelete={() => {
              if (confirm('Удалить заметку?')) deleteNote(n.id);
            }}
            onToggleComplete={() => toggleComplete(n.id)}
            onTogglePin={() => togglePin(n.id)}
          />
        ))}
      </div>
      
    </div>
  );
}