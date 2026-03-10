import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { useGameHistory } from '../hooks/useGameHistory';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import { PLAYER_COLORS, TOTAL_PHASES } from '../constants';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const STATUS_LABEL = {
  lobby: { text: 'Warteraum', color: 'text-yellow-400' },
  active: { text: 'Läuft', color: 'text-green-400' },
  finished: { text: 'Beendet', color: 'text-gray-500' },
};

function GameCard({ game, uid, onJoin, onDelete }) {
  const myPlayer = game.players?.[uid];
  const myState = game.playerState?.[uid];
  const color = PLAYER_COLORS[myPlayer?.colorIndex ?? 0] ?? PLAYER_COLORS[0];
  const playerCount = Object.keys(game.players || {}).length;
  const isHost = game.hostUid === uid;
  const isFinished = game.status === 'finished';
  const isWinner = game.winner?.uid === uid;
  const statusInfo = STATUS_LABEL[game.status] ?? STATUS_LABEL.finished;
  const date = game.createdAt?.toDate?.()?.toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) ?? '–';

  return (
    <div className={`rounded-xl border ${color.border} bg-gradient-to-r ${color.gradient} bg-gray-900/80 p-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-500 tracking-widest">{game.id}</span>
            <span className={`text-xs font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
            {isWinner && <span className="text-yellow-400 text-xs">🏆</span>}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {date} · {playerCount} Spieler
            {isHost && <span className="text-gray-600 ml-1">(Du: Host)</span>}
          </div>
        </div>
        {myState && (
          <div className="text-right shrink-0">
            <div className="font-bold text-white text-sm">
              Phase {Math.min(myState.currentPhase, TOTAL_PHASES)}
            </div>
            <div className="text-xs text-gray-500">{myState.totalScore} Pkt</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2.5">
        <Button
          variant={isFinished ? 'ghost' : 'secondary'}
          size="sm"
          className="flex-1"
          onClick={onJoin}
        >
          {isFinished ? 'Anzeigen' : 'Beitreten'}
        </Button>
        {isHost && (
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
          >
            Löschen
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user, isGoogleUser, signInWithGoogle, signOutUser, createGame, deleteGame } = useGame(null);
  const { games, loading: historyLoading } = useGameHistory(isGoogleUser ? user?.uid : null);

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // game to delete
  const [name, setName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const activeGames = games.filter((g) => g.status === 'lobby' || g.status === 'active');
  const finishedGames = games.filter((g) => g.status === 'finished');

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        setAuthError(e.code ?? e.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const gid = await createGame(name.trim());
      navigate(`/game/${gid}`);
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    const code = gameCode.trim().toUpperCase();
    if (!code) return;
    navigate(`/game/${code}`);
  };

  const handleDelete = async (gid) => {
    try {
      await deleteGame(gid);
    } catch (e) {
      console.error(e);
    }
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Title */}
      <div className="mb-10 text-center">
        <h1 className="text-6xl font-black text-white tracking-tight leading-none mb-1">
          Phase <span className="text-red-500">10</span>
        </h1>
        <p className="text-gray-500 text-sm">Digitaler Scoreboard</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        {/* Google Auth */}
        {isGoogleUser ? (
          <div className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full shrink-0" />
              )}
              <span className="text-sm text-white font-semibold truncate">{user.displayName}</span>
            </div>
            <button
              onClick={signOutUser}
              className="text-xs text-gray-500 hover:text-gray-300 shrink-0 ml-2"
            >
              Abmelden
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 text-gray-800 font-semibold rounded-xl px-5 py-3 transition-all active:scale-95"
          >
            <GoogleIcon />
            {authLoading ? 'Anmelden…' : 'Mit Google anmelden'}
          </button>
        )}
        {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}

        {/* Create + Join */}
        <Button variant="primary" size="lg" className="w-full" onClick={() => { setCreateError(''); setShowCreate(true); }}>
          🎮 Neues Spiel erstellen
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={() => setShowJoin(true)}>
          🔗 Spiel beitreten
        </Button>

        {/* My games */}
        {isGoogleUser && (
          <div className="pt-4 space-y-4">
            {historyLoading ? (
              <p className="text-gray-600 text-sm text-center py-2">Laden…</p>
            ) : (
              <>
                {activeGames.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Aktive Spiele
                    </h2>
                    <div className="space-y-2">
                      {activeGames.map((g) => (
                        <GameCard
                          key={g.id}
                          game={g}
                          uid={user.uid}
                          onJoin={() => navigate(`/game/${g.id}`)}
                          onDelete={() => setConfirmDelete(g)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {finishedGames.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Abgeschlossene Spiele
                    </h2>
                    <div className="space-y-2">
                      {finishedGames.map((g) => (
                        <GameCard
                          key={g.id}
                          game={g}
                          uid={user.uid}
                          onJoin={() => navigate(`/game/${g.id}`)}
                          onDelete={() => setConfirmDelete(g)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {games.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-2">
                    Noch keine Spiele vorhanden.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {!isGoogleUser && (
          <p className="text-center text-gray-600 text-xs pt-2">
            Mit Google anmelden, um Spiele zu speichern und wiederzufinden.
          </p>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Neues Spiel">
        <InputField
          label="Dein Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Spielername"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          autoFocus
          error={createError}
        />
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>Abbrechen</Button>
          <Button variant="primary" className="flex-1" onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? 'Erstelle…' : 'Erstellen'}
          </Button>
        </div>
      </Modal>

      {/* Join modal */}
      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="Spiel beitreten">
        <InputField
          label="Spielcode"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          placeholder="z.B. ABC123"
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          autoFocus
          className="uppercase tracking-widest"
        />
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" className="flex-1" onClick={() => setShowJoin(false)}>Abbrechen</Button>
          <Button variant="primary" className="flex-1" onClick={handleJoin} disabled={!gameCode.trim()}>Beitreten</Button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Spiel löschen?"
      >
        <p className="text-gray-400 text-sm mb-1">
          Spiel <span className="font-mono text-white">{confirmDelete?.id}</span> wird unwiderruflich gelöscht.
        </p>
        <p className="text-gray-500 text-xs mb-4">Alle Spielerdaten und der Rundenverlauf gehen verloren.</p>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(null)}>Abbrechen</Button>
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete.id)}>
            Löschen
          </Button>
        </div>
      </Modal>
    </div>
  );
}
