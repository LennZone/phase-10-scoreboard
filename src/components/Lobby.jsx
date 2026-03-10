import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PLAYER_COLORS, MIN_PLAYERS } from '../constants';
import Button from './Button';

export default function Lobby({ game, user, isHost, onStart, onUpdateName }) {
  const { t } = useTranslation();
  const [editingUid, setEditingUid] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [copied, setCopied] = useState(false);
  const [startError, setStartError] = useState('');

  const players = Object.entries(game.players || {})
    .map(([uid, p]) => ({ uid, ...p }))
    .sort((a, b) => a.colorIndex - b.colorIndex);

  const shareUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleNameSave = async (uid) => {
    if (editingName.trim()) {
      await onUpdateName(uid, editingName.trim());
    }
    setEditingUid(null);
  };

  const handleStart = async () => {
    setStartError('');
    try {
      await onStart();
    } catch (e) {
      setStartError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Share link */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800/60 p-4">
        <h3 className="mb-2 text-sm font-bold text-white">{t('lobby.shareLink')}</h3>
        <div className="flex gap-2">
          <div className="flex-1 truncate rounded-xl bg-gray-900 px-3 py-2.5 font-mono text-xs text-gray-400">
            {shareUrl}
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? t('lobby.copied') : t('lobby.copy')}
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500">{t('lobby.hint')}</p>
      </div>

      {/* Player list */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-white">
          {t('lobby.players')} ({players.length}/6)
        </h3>
        <div className="space-y-2">
          {players.map((p) => {
            const color = PLAYER_COLORS[p.colorIndex ?? 0] ?? PLAYER_COLORS[0];
            const isMe = p.uid === user?.uid;
            return (
              <div
                key={p.uid}
                className={`flex items-center gap-3 rounded-xl border ${color.border} bg-gradient-to-r ${color.gradient} bg-gray-900/80 px-4 py-3`}
              >
                <div className={`h-3 w-3 shrink-0 rounded-full ${color.bg}`} />

                {editingUid === p.uid ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleNameSave(p.uid)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave(p.uid);
                      if (e.key === 'Escape') setEditingUid(null);
                    }}
                    className="flex-1 rounded-lg bg-gray-800 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                ) : (
                  <span className="flex-1 text-sm font-semibold text-white">
                    {p.name}
                    {isMe && (
                      <span className="ml-1 font-normal text-gray-400">({t('home.you')})</span>
                    )}
                    {p.uid === game.hostUid && (
                      <span className="ml-2 text-xs text-yellow-400">{t('home.host')}</span>
                    )}
                  </span>
                )}

                <button
                  onClick={() => {
                    setEditingUid(p.uid);
                    setEditingName(p.name);
                  }}
                  className="px-1 text-sm text-gray-500 hover:text-gray-300"
                >
                  ✎
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      {isHost ? (
        <div>
          {players.length < MIN_PLAYERS && (
            <p className="mb-3 text-center text-sm text-yellow-400">
              {t('lobby.minPlayers', { min: MIN_PLAYERS })}
            </p>
          )}
          {startError && (
            <p className="mb-3 text-center text-sm text-red-400">{startError}</p>
          )}
          <Button
            variant="success"
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={players.length < MIN_PLAYERS}
          >
            {t('lobby.start', { count: players.length })}
          </Button>
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-gray-500">{t('lobby.waitForHost')}</p>
      )}
    </div>
  );
}
