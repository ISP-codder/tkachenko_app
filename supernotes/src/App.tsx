import { useEffect, useMemo, useState } from 'react';
import { useStore } from './state/store';
import { GroupTabs } from './components/GroupTabs';
import { GroupUnlockModal } from './components/GroupUnlockModal';
import { GroupCreateModal } from './components/GroupCreateModal';
import { NoteList } from './components/NoteList';
import { NoteView } from './components/NoteView';
import { NoteEditor } from './components/NoteEditor';
import { StatsDrawer } from './components/StatsDrawer';
import { Header } from './components/Header';

export type Screen =
  | { kind: 'list' }
  | { kind: 'view'; noteId: string }
  | { kind: 'edit'; noteId: string }
  | { kind: 'create' };

export default function App() {
  const init = useStore((s) => s.init);
  const groups = useStore((s) => s.groups);
  const activeGroupId = useStore((s) => s.activeGroupId);
  const unlockedGroupId = useStore((s) => s.unlockedGroupId);
  const selectGroup = useStore((s) => s.selectGroup);

  const [screen, setScreen] = useState<Screen>({ kind: 'list' });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId),
    [groups, activeGroupId]
  );

  const isLocked = !!activeGroup?.isPrivate && unlockedGroupId !== activeGroup.id;

  return (
    <div className="app">
<Header onCreateNote={() => setScreen({ kind: 'create' })} onCreateGroup={() => setShowCreateGroup(true)} />
      {isLocked ? (
        <div style={{ flex: 1 }} />
      ) : screen.kind === 'list' ? (
        <NoteList
          onCreate={() => setScreen({ kind: 'create' })}
          onOpen={(id) => setScreen({ kind: 'view', noteId: id })}
          onEdit={(id) => setScreen({ kind: 'edit', noteId: id })}
          onSwipeLeftEmpty={() => setDrawerOpen(true)}
        />
      ) : screen.kind === 'view' ? (
        <NoteView
          noteId={screen.noteId}
          onBack={() => setScreen({ kind: 'list' })}
          onEdit={(id) => setScreen({ kind: 'edit', noteId: id })}
        />
      ) : screen.kind === 'edit' ? (
        <NoteEditor noteId={screen.noteId} onDone={() => setScreen({ kind: 'list' })} />
      ) : (
        <NoteEditor onDone={() => setScreen({ kind: 'list' })} />
      )}

      {isLocked && activeGroup && (
        <GroupUnlockModal group={activeGroup} />
      )}

      {showCreateGroup && (
        <GroupCreateModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={(id) => {
            setShowCreateGroup(false);
            selectGroup(id);
          }}
        />
      )}

      {drawerOpen && <StatsDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}