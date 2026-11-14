export type NoteStatus = 'pending' | 'on-time' | 'late';

type StatusInput = {
  completedAt?: number;
  deadline?: { end: number };
};

export function getNoteStatus(n: StatusInput): NoteStatus {
  if (!n.completedAt) return 'pending';
  if (!n.deadline) return 'on-time';
  return n.completedAt <= n.deadline.end ? 'on-time' : 'late';
}