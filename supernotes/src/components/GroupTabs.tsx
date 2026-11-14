import { useStore } from '../state/store';
import './GroupTabs.css';

export function GroupTabs({ onCreate }: { onCreate: () => void }) {
  const groups = useStore((s) => s.groups);
  const activeGroupId = useStore((s) => s.activeGroupId);
  const selectGroup = useStore((s) => s.selectGroup);

  return (
    <div className="group-tabs">
      <div className="group-tabs__scroll">
        {groups.map((g) => (
          <button
            key={g.id}
            className={
              'group-tab' + (g.id === activeGroupId ? ' group-tab--active' : '')
            }
            onClick={() => selectGroup(g.id)}
          >
            {g.isPrivate && <span className="group-tab__lock">🔒</span>}
            {g.name}
          </button>
        ))}
      </div>
      <button className="group-tabs__add" onClick={onCreate} aria-label="Добавить группу">
        +
      </button>
    </div>
  );
}