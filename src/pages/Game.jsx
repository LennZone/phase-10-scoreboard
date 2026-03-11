import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '../hooks/useGame';
import { TOTAL_PHASES } from '../constants';
import Lobby from '../components/Lobby';
import Scoreboard from '../components/Scoreboard';
import RoundEntry from '../components/RoundEntry';
import WinnerScreen from '../components/WinnerScreen';
import Modal from '../components/Modal';
import Button from '../components/Button';
import InputField from '../components/InputField';
import TableRow from '../components/TableRow';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { CheckIcon, XIcon } from '../components/Icons';

export default function Game() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    user,
    game,
    loading,
    error,
    isHost,
    isInGame,
    sortedPlayers,
    myPendingSubmission,
    allSubmitted,
    submittedCount,
    totalPlayers,
    joinGame,
    startGame,
    submitScore,
    closeRound,
    editRoundScore,
    updatePlayerName,
  } = useGame(gameId);

  const [joinName, setJoinName] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const [historyPlayer, setHistoryPlayer] = useState(null);
  const [editingRound, setEditingRound] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const editPhaseCompleted = editingRound?.points !== '' && Number(editingRound?.points) < 50;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg text-slate-500">{t('game.loading')}</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <div className="mb-4 text-5xl text-slate-600">×</div>
          <h2 className="mb-2 text-xl font-bold text-white">{t('game.notFound')}</h2>
          <p className="mb-6 text-sm text-slate-400">{error ?? t('game.notFoundHint')}</p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 underline underline-offset-4 transition-colors hover:text-white"
          >
            {t('game.backHome')}
          </button>
        </div>
      </div>
    );
  }

  if (!isInGame && game.status === 'lobby') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-xs">
          <h1 className="mb-1 text-center text-5xl font-black leading-none text-white">
            Phase <span className="text-violet-400">10</span>
          </h1>
          <p className="mb-8 text-center text-sm text-slate-500">{t('join.invited')}</p>

          <InputField
            label={t('join.nameLabel')}
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder={t('join.namePlaceholder')}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                setJoinLoading(true);
                setJoinError('');
                try {
                  await joinGame(gameId, joinName.trim());
                } catch (err) {
                  setJoinError(err.message);
                } finally {
                  setJoinLoading(false);
                }
              }
            }}
            autoFocus
            error={joinError}
          />
          <Button
            variant="primary"
            size="lg"
            className="mt-4 w-full"
            disabled={joinLoading || !joinName.trim()}
            onClick={async () => {
              setJoinLoading(true);
              setJoinError('');
              try {
                await joinGame(gameId, joinName.trim());
              } catch (err) {
                setJoinError(err.message);
              } finally {
                setJoinLoading(false);
              }
            }}
          >
            {joinLoading ? t('join.joining') : t('join.join')}
          </Button>
        </div>
      </div>
    );
  }

  if (!isInGame) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-slate-500">{t('game.gameStarted')}</p>
      </div>
    );
  }

  if (game.status === 'finished') {
    return (
      <WinnerScreen winner={game.winner} players={game.players} sortedPlayers={sortedPlayers} />
    );
  }

  const myCurrentPhase = game.playerState?.[user?.uid]?.currentPhase ?? 1;

  const historyRounds =
    historyPlayer && game.rounds
      ? game.rounds
          .map((round, i) => ({ ...round, index: i }))
          .filter((r) => r.scores?.[historyPlayer.uid])
      : [];

  return (
    <div className="min-h-screen font-game">
      {/* Sticky header */}
      <header className="border-white/8 border-b bg-[#070711]/80 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1
              className="cursor-pointer text-lg font-black leading-none text-white"
              onClick={() => navigate('/')}
            >
              Phase <span className="text-violet-400">10</span>
            </h1>
            <p className="font-mono text-xs tracking-widest text-slate-500">{gameId}</p>
          </div>

          <div className="flex items-center gap-2">
            {game.status === 'active' && (
              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  {t('game.round')} {game.currentRound}
                </div>
                <div className={`text-xs ${allSubmitted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {submittedCount}/{totalPlayers}
                </div>
              </div>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-10">
        {game.status === 'lobby' && (
          <div className="pt-6">
            <Lobby
              game={game}
              user={user}
              isHost={isHost}
              onStart={startGame}
              onUpdateName={updatePlayerName}
            />
          </div>
        )}

        {game.status === 'active' && (
          <div className="space-y-4 pt-4">
            <Scoreboard
              players={sortedPlayers}
              pendingSubmissions={game.pendingSubmissions}
              isHost={isHost}
              currentRound={game.currentRound}
              onShowHistory={isHost ? setHistoryPlayer : undefined}
            />

            <RoundEntry
              currentPhase={myCurrentPhase}
              pendingSubmission={myPendingSubmission}
              onSubmit={submitScore}
            />

            {isHost && (
              <div className="glass-card rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-300">{t('hostControls.title')}</h3>
                  <span className="text-xs text-slate-500">
                    {allSubmitted
                      ? t('hostControls.allReady')
                      : t('hostControls.waiting', { count: totalPlayers - submittedCount })}
                  </span>
                </div>

                <div className="mb-4 space-y-1.5">
                  {sortedPlayers.map((p) => {
                    const submitted = !!game.pendingSubmissions?.[p.uid];
                    return (
                      <div key={p.uid} className="flex justify-between text-sm">
                        <span className="text-slate-300">{p.name}</span>
                        <span
                          className={`flex items-center gap-1 ${
                            submitted ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        >
                          {submitted ? (
                            <>
                              <CheckIcon className="h-3.5 w-3.5" />
                              {game.pendingSubmissions[p.uid].points} {t('scoreCard.pts')}
                            </>
                          ) : (
                            '–'
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="success"
                  size="lg"
                  className="w-full"
                  onClick={closeRound}
                  disabled={!allSubmitted}
                >
                  {allSubmitted ? t('hostControls.close') : t('hostControls.waitingBtn')}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Round history modal */}
      <Modal
        isOpen={!!historyPlayer}
        onClose={() => {
          setHistoryPlayer(null);
          setEditingRound(null);
        }}
        title={t('history.title', { name: historyPlayer?.name })}
      >
        {historyPlayer && (
          <>
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-white/8 border-b text-xs text-slate-500">
                    <th className="px-3 py-2 text-left">{t('history.round')}</th>
                    <th className="px-3 py-2 text-center">{t('history.points')}</th>
                    <th className="px-3 py-2 text-center">{t('history.phase')}</th>
                    <th className="px-3 py-2 text-right">{t('history.total')}</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {historyRounds.map((round) => (
                    <TableRow
                      key={round.index}
                      roundNumber={round.roundNumber}
                      score={round.scores[historyPlayer.uid]}
                      isHost={isHost}
                      onEdit={() => {
                        const s = round.scores[historyPlayer.uid];
                        setEditingRound({
                          index: round.index,
                          points: String(s.points ?? 0),
                        });
                      }}
                    />
                  ))}
                  {historyRounds.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-sm text-slate-500">
                        {t('history.noRounds')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full"
              onClick={() => {
                setHistoryPlayer(null);
                setEditingRound(null);
              }}
            >
              {t('history.close')}
            </Button>
          </>
        )}
      </Modal>

      {/* Edit round score modal */}
      <Modal
        isOpen={!!editingRound}
        onClose={() => setEditingRound(null)}
        title={t('editRound.title', {
          n: editingRound ? game.rounds[editingRound.index]?.roundNumber : '',
        })}
      >
        {editingRound && (
          <>
            <InputField
              label={t('editRound.points')}
              type="number"
              inputMode="numeric"
              min="0"
              value={editingRound.points}
              onChange={(e) => setEditingRound((r) => ({ ...r, points: e.target.value }))}
              autoFocus
            />

            {editingRound.points !== '' && (
              <div
                className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                  editPhaseCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {editPhaseCompleted ? (
                  <CheckIcon className="h-4 w-4 shrink-0" />
                ) : (
                  <XIcon className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {editPhaseCompleted
                    ? t('editRound.phaseCompleted')
                    : t('editRound.phaseNotCompleted')}
                  <span className="ml-1 text-xs font-normal opacity-70">
                    (
                    {editPhaseCompleted
                      ? t('roundEntry.below', { n: 50 })
                      : t('roundEntry.aboveOrEqual', { n: 50 })}
                    )
                  </span>
                </span>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setEditingRound(null)}>
                {t('editRound.cancel')}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={editSaving}
                onClick={async () => {
                  setEditSaving(true);
                  try {
                    await editRoundScore(
                      historyPlayer.uid,
                      editingRound.index,
                      Number(editingRound.points),
                      editPhaseCompleted
                    );
                    setEditingRound(null);
                  } finally {
                    setEditSaving(false);
                  }
                }}
              >
                {editSaving ? t('editRound.saving') : t('editRound.save')}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
