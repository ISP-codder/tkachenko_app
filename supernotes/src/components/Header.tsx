import { Sun, Moon, Pencil, FolderPlus } from 'lucide-react';
import { useStore } from '../state/store';
import { useTheme } from '../utils/useTheme';
import './Header.css';

export function Header({
  onCreateNote,
  onCreateGroup,
}: {
  onCreateNote: () => void;
  onCreateGroup: () => void;
}) {
  const groups = useStore((s) => s.groups);
  const activeGroupId = useStore((s) => s.activeGroupId);
  const selectGroup = useStore((s) => s.selectGroup);
  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const { theme, toggle } = useTheme();

  return (
    <header className="header">
      <div className="header__top">
        <h1 className="header__title serif">
          {activeGroup?.isPrivate && <span className="header__lock">🔒 </span>}
          {activeGroup?.name || 'Заметки'}
        </h1>
        <div className="header__actions">
          <button className="icon-btn" onClick={toggle} aria-label="Сменить тему">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="icon-btn" onClick={onCreateGroup} aria-label="Новая группа">
            <FolderPlus size={20} />
          </button>
          <button className="icon-btn icon-btn--accent" onClick={onCreateNote} aria-label="Новая заметка">
            <Pencil size={20} />
          </button>
        </div>
      </div>

      <div className="header__tabs">
        {groups.map((g) => (
          <button
            key={g.id}
            className={'tab' + (g.id === activeGroupId ? ' tab--active' : '')}
            onClick={() => selectGroup(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>
    </header>
  );
}