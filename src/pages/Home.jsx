import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '../hooks/useGame';
import { useGameHistory } from '../hooks/useGameHistory';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import LanguageSwitcher from '../components/LanguageSwitcher';
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

function GameCard({ game, uid, onJoin, onDelete }) {
  const { t, i18n } = useTranslation();
  const myPlayer = game.players?.[uid];
  const myState = game.playerState?.[uid];
  const color = PLAYER_COLORS[myPlayer?.colorIndex ?? 0] ?? PLAYER_COLORS[0];
  const playerCount = Object.keys(game.players || {}).length;
  const isHost = game.hostUid === uid;
  const isFinished = game.status === 'finished';
  const isWinner = game.winner?.uid === uid;

  const statusLabel = {
    lobby: { text: t('gameCard.lobby'), color: 'text-yellow-400' },
    active: { text: t('gameCard.active'), color: 'text-green-400' },
    finished: { text: t('gameCard.finished'), color: 'text-gray-500' },
  };
  const statusInfo = statusLabel[game.status] ?? statusLabel.finished;

  const date = game.createdAt?.toDate?.()?.toLocaleDateString(i18n.resolvedLanguage, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) ?? '–';

  return (
    <div className={`rounded-xl border ${color.border} bg-gradient-to-r ${color.gradient} bg-gray-900/80 p-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs tracking-widest text-gray-500">{game.id}</span>
            <span className={`text-xs font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
            {isWinner && <span className="text-xs text-yellow-400">🏆</span>}
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            {date} · {t('gameCard.players', { count: playerCount })}
            {isHost && <span className="ml-1 text-gray-600">{t('gameCard.youHost')}</span>}
          </div>
        </div>
        {myState && (
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-white">
              {t('scoreCard.phase')} {Math.min(myState.currentPhase, TOTAL_PHASES)}
            </div>
            <div className="text-xs text-gray-500">{myState.totalScore} {t('scoreCard.pts')}</div>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex gap-2">
        <Button
          variant={isFinished ? 'ghost' : 'secondary'}
          size="sm"
          className="flex-1"
          onClick={onJoin}
        >
          {isFinished ? t('gameCard.view') : t('gameCard.join')}
        </Button>
        {isHost && (
          <Button variant="danger" size="sm" onClick={onDelete}>
            {t('gameCard.delete')}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isGoogleUser, signInWithGoogle, signOutUser, createGame, deleteGame } = useGame(null);
  const { games, loading: historyLoading } = useGameHistory(isGoogleUser ? user?.uid : null);

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6">
      {/* Title */}
      <div className="mb-10 text-center">
        <h1 className="mb-1 text-6xl font-black leading-none tracking-tight text-white">
          Phase <span className="text-red-500">10</span>
        </h1>
        <p className="text-sm text-gray-500">{t('app.subtitle')}</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        {/* Language switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        {/* Google Auth */}
        {isGoogleUser ? (
          <div className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="h-8 w-8 shrink-0 rounded-full" />
              )}
              <span className="truncate text-sm font-semibold text-white">{user.displayName}</span>
            </div>
            <button
              onClick={signOutUser}
              className="ml-2 shrink-0 text-xs text-gray-500 hover:text-gray-300"
            >
              {t('home.signOut')}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={authLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3 font-semibold text-gray-800 transition-all hover:bg-gray-100 active:scale-95 active:bg-gray-200 disabled:opacity-50"
          >
            <GoogleIcon />
            {authLoading ? t('home.signingIn') : t('home.signIn')}
          </button>
        )}
        {authError && <p className="text-center text-xs text-red-400">{authError}</p>}

        {/* Create + Join */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            setCreateError('');
            setShowCreate(true);
          }}
        >
          🎮 {t('home.createGame')}
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={() => setShowJoin(true)}>
          🔗 {t('home.joinGame')}
        </Button>

        {/* My games */}
        {isGoogleUser && (
          <div className="space-y-4 pt-4">
            {historyLoading ? (
              <p className="py-2 text-center text-sm text-gray-600">{t('game.loading')}</p>
            ) : (
              <>
                {activeGames.length > 0 && (
                  <div>
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                      {t('home.activeGames')}
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
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                      {t('home.finishedGames')}
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
                  <p className="py-2 text-center text-sm text-gray-600">{t('home.noGames')}</p>
                )}
              </>
            )}
          </div>
        )}

        {!isGoogleUser && (
          <p className="pt-2 text-center text-xs text-gray-600">{t('home.saveHint')}</p>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('home.create.title')}>
        <InputField
          label={t('home.create.nameLabel')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('home.create.namePlaceholder')}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          autoFocus
          error={createError}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>
            {t('home.create.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
          >
            {creating ? t('home.create.creating') : t('home.create.create')}
          </Button>
        </div>
      </Modal>

      {/* Join modal */}
      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title={t('home.join.title')}>
        <InputField
          label={t('home.join.codeLabel')}
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          placeholder={t('home.join.codePlaceholder')}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          autoFocus
          className="uppercase tracking-widest"
        />
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setShowJoin(false)}>
            {t('home.join.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleJoin}
            disabled={!gameCode.trim()}
          >
            {t('home.join.join')}
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={t('home.delete.title')}
      >
        <p className="mb-1 text-sm text-gray-400">
          {t('home.delete.confirm', { id: confirmDelete?.id })}
        </p>
        <p className="mb-4 text-xs text-gray-500">{t('home.delete.warning')}</p>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(null)}>
            {t('home.delete.cancel')}
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => handleDelete(confirmDelete.id)}
          >
            {t('home.delete.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
