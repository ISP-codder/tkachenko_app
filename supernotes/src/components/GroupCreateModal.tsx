import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { useStore } from '../state/store';

export function GroupCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const createGroup = useStore((s) => s.createGroup);
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) {
      setError('Введите название');
      return;
    }
    if (isPrivate && password.length < 4) {
      setError('Пароль минимум 4 символа');
      return;
    }
    setBusy(true);
    try {
      await createGroup(name.trim(), isPrivate, isPrivate ? password : undefined);
      const groups = useStore.getState().groups;
      const created = groups[groups.length - 1];
      onCreated(created.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Новая группа</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="field">
          <label>Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Работа"
            autoFocus
          />
        </div>

        <label className="toggle-row">
          <div className="toggle-row__text">
            <Lock size={16} className="toggle-row__icon" />
            Приватная группа
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
        </label>

        {isPrivate && (
          <div className="field" style={{ marginTop: 12 }}>
            <label>Код-пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 4 символа"
            />
          </div>
        )}

        {error && <div className="error-text">{error}</div>}

        <div className="modal__actions">
          <button className="btn" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button className="btn-primary" onClick={submit} disabled={busy}>
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}