import { create } from 'zustand';
import type { Group, Note, PersistedState } from '../types';
import { loadState, saveState } from '../storage/db';
import { uid } from '../utils/id';
import { hashPassword, makeSalt, verifyPassword } from '../storage/crypto';

const GENERAL_ID = 'general';

type State = {
  groups: Group[];
  notes: Note[];
  activeGroupId: string;
  // группа, разблокированная в текущей сессии (только для отображения UI)
  unlockedGroupId: string | null;

  // actions
  init: () => void;
  selectGroup: (id: string) => void;
  createGroup: (name: string, isPrivate: boolean, password?: string) => Promise<void>;
  unlockGroup: (id: string, password: string) => Promise<boolean>;
  lockGroup: () => void;

  createNote: (groupId: string, title: string, body: string, deadline?: Note['deadline']) => void;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'deadline'>>) => void;
  deleteNote: (id: string) => void;
  toggleComplete: (id: string) => void;
  togglePin: (id: string) => void;
};

function persist(get: () => State) {
  const s = get();
  const data: PersistedState = {
    version: 1,
    groups: s.groups,
    notes: s.notes,
    activeGroupId: s.activeGroupId,
  };
  saveState(data);
}

const defaultGroup: Group = {
  id: GENERAL_ID,
  name: 'Общее',
  isPrivate: false,
};

export const useStore = create<State>((set, get) => ({
  groups: [defaultGroup],
  notes: [],
  activeGroupId: GENERAL_ID,
  unlockedGroupId: GENERAL_ID,

  init: () => {
    const saved = loadState();
    if (saved) {
      set({
        groups: saved.groups.length ? saved.groups : [defaultGroup],
        notes: saved.notes,
        activeGroupId: saved.activeGroupId || GENERAL_ID,
        unlockedGroupId:
          saved.groups.find((g) => g.id === saved.activeGroupId)?.isPrivate
            ? null
            : saved.activeGroupId || GENERAL_ID,
      });
    } else {
      const data: PersistedState = {
        version: 1,
        groups: [defaultGroup],
        notes: [],
        activeGroupId: GENERAL_ID,
      };
      saveState(data);
    }
  },

  selectGroup: (id) => {
    const group = get().groups.find((g) => g.id === id);
    if (!group) return;
    if (group.isPrivate) {
      // всегда требуем разблокировку
      set({ activeGroupId: id, unlockedGroupId: null });
    } else {
      set({ activeGroupId: id, unlockedGroupId: id });
    }
  },

  createGroup: async (name, isPrivate, password) => {
    const group: Group = {
      id: uid(),
      name,
      isPrivate,
    };
    if (isPrivate && password) {
      const salt = makeSalt();
      group.salt = salt;
      group.passwordHash = await hashPassword(password, salt);
    }
    set((s) => ({ groups: [...s.groups, group] }));
    persist(get);
  },

  unlockGroup: async (id, password) => {
    const group = get().groups.find((g) => g.id === id);
    if (!group || !group.isPrivate || !group.salt || !group.passwordHash) return false;
    const ok = await verifyPassword(password, group.salt, group.passwordHash);
    if (ok) set({ unlockedGroupId: id });
    return ok;
  },

  lockGroup: () => set({ unlockedGroupId: null }),

  createNote: (groupId, title, body, deadline) => {
    const note: Note = {
      id: uid(),
      groupId,
      title,
      body,
      createdAt: Date.now(),
      pinned: false,
      deadline,
    };
    set((s) => ({ notes: [note, ...s.notes] }));
    persist(get);
  },

  updateNote: (id, patch) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
    persist(get);
  },

  deleteNote: (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    persist(get);
  },

  toggleComplete: (id) => {
    set((s) => ({
      notes: s.notes.map((n) => {
        if (n.id !== id) return n;
        return n.completedAt ? { ...n, completedAt: undefined } : { ...n, completedAt: Date.now() };
      }),
    }));
    persist(get);
  },

  togglePin: (id) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
    persist(get);
  },
}));

export const GENERAL_GROUP_ID = GENERAL_ID;