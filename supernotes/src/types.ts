export type Group = {
  id: string;
  name: string;
  isPrivate: boolean;
  passwordHash?: string; // hex
  salt?: string;         // hex
};

export type Deadline = {
  start: number; // ms
  end: number;   // ms
};

export type Note = {
  id: string;
  groupId: string;
  title: string;
  body: string;
  createdAt: number;
  completedAt?: number;
  deadline?: Deadline;
  pinned: boolean;
};

export type PersistedState = {
  version: 1;
  groups: Group[];
  notes: Note[];
  activeGroupId: string;
};