import { useState } from 'react';
import { Lock } from 'lucide-react';
import type { Group } from '../types';
import { useStore } from '../state/store';

export function GroupUnlockModal({ group }: { group: Group }) {
  const unlockGroup = useStore((s) => s.unlockGroup);
  const selectGroup = useStore((s) => s.selectGroup);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      const ok = await unlockGroup(group.id, password);
      if (!ok) {
        setError('Неверный пароль');
        setPassword('');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal__header" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <div className="unlock-icon-wrap">
            <Lock size={28} />
          </div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>{group.name}</h2>
        <p className="text-dim" style={{ textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
          Введите пароль для доступа
        </p>

        <div className="field">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoFocus
            style={{ textAlign: 'center', fontSize: 18, letterSpacing: '0.2em' }}
          />
        </div>

        {error && <div className="error-text" style={{ textAlign: 'center' }}>{error}</div>}

        <div className="modal__actions" style={{ marginTop: 24 }}>
          <button
            type="button"
            className="btn"
            onClick={() => selectGroup('general')}
            disabled={busy}
          >
            Назад
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            Войти
          </button>
        </div>
      </form>
    </div>
  );
}