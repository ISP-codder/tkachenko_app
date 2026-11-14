import type { NoteStatus } from '../utils/status';
import './CompleteCircle.css';

export function CompleteCircle({
  status,
  onToggle,
}: {
  status: NoteStatus;
  onToggle: () => void;
}) {
  return (
    <button
      className={
        'complete-circle' +
        (status === 'on-time' ? ' complete-circle--done' : '') +
        (status === 'late' ? ' complete-circle--late' : '')
      }
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={status === 'pending' ? 'Отметить выполненной' : 'Отметить невыполненной'}
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="10" className="complete-circle__ring" />
        <path
          d="M7 12.5l3.2 3.2L17 9"
          className="complete-circle__check"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}