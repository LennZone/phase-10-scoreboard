import { useState } from 'react';
import { PLAYER_COLORS, MIN_PLAYERS } from '../constants';
import Button from './Button';

export default function Lobby({ game, user, isHost, onStart, onUpdateName }) {
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
      // fallback: select the text
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
      <div className="rounded-2xl bg-gray-800/60 border border-gray-700 p-4">
        <h3 className="font-bold text-white mb-2 text-sm">Link teilen</h3>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-900 rounded-xl px-3 py-2.5 text-xs text-gray-400 font-mono truncate">
            {shareUrl}
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? '✓ Kopiert' : 'Kopieren'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Mitspieler öffnen diesen Link auf ihrem Gerät.
        </p>
      </div>

      {/* Player list */}
      <div>
        <h3 className="font-bold text-white text-sm mb-2">
          Spieler ({players.length}/{6})
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
                <div className={`w-3 h-3 rounded-full shrink-0 ${color.bg}`} />

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
                    className="flex-1 bg-gray-800 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                ) : (
                  <span className="flex-1 text-white font-semibold text-sm">
                    {p.name}
                    {isMe && <span className="text-gray-400 font-normal ml-1">(Du)</span>}
                    {p.uid === game.hostUid && (
                      <span className="text-yellow-400 text-xs ml-2">Host</span>
                    )}
                  </span>
                )}

                <button
                  onClick={() => {
                    setEditingUid(p.uid);
                    setEditingName(p.name);
                  }}
                  className="text-gray-500 hover:text-gray-300 text-sm px-1"
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
            <p className="text-yellow-400 text-sm text-center mb-3">
              Mindestens {MIN_PLAYERS} Spieler erforderlich.
            </p>
          )}
          {startError && (
            <p className="text-red-400 text-sm text-center mb-3">{startError}</p>
          )}
          <Button
            variant="success"
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={players.length < MIN_PLAYERS}
          >
            Spiel starten ({players.length} Spieler)
          </Button>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm py-4">
          Warte auf den Host, das Spiel zu starten…
        </p>
      )}
    </div>
  );
}
