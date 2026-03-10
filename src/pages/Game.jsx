import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { PHASES, TOTAL_PHASES } from '../constants';
import Lobby from '../components/Lobby';
import Scoreboard from '../components/Scoreboard';
import RoundEntry from '../components/RoundEntry';
import WinnerScreen from '../components/WinnerScreen';
import Modal from '../components/Modal';
import Button from '../components/Button';
import InputField from '../components/InputField';
import TableRow from '../components/TableRow';

export default function Game() {
  const { gameId } = useParams();
  const navigate = useNavigate();
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

  // Round history modal state (host only)
  const [historyPlayer, setHistoryPlayer] = useState(null);
  const [editingRound, setEditingRound] = useState(null); // { index, points }
  const [editSaving, setEditSaving] = useState(false);

  // Phase completion is automatic: < 50 points = phase completed
  const editPhaseCompleted =
    editingRound?.points !== '' && Number(editingRound?.points) < 50;

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Laden…</div>
      </div>
    );
  }

  // Error / not found
  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-4">🎴</div>
          <h2 className="text-white text-xl font-bold mb-2">Spiel nicht gefunden</h2>
          <p className="text-gray-400 text-sm mb-6">{error ?? 'Überprüfe den Spielcode.'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            ← Zurück Hauptseite
          </button>
        </div>
      </div>
    );
  }

  // Guest join form
  if (!isInGame && game.status === 'lobby') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-xs">
          <h1 className="text-5xl font-black text-white text-center leading-none mb-1">
            Phase <span className="text-red-500">10</span>
          </h1>
          <p className="text-gray-500 text-center text-sm mb-8">Du wurdest eingeladen!</p>

          <InputField
            label="Dein Name"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder="Spielername"
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
            className="w-full mt-4"
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
            {joinLoading ? 'Beitrete…' : 'Spiel beitreten'}
          </Button>
        </div>
      </div>
    );
  }

  // Late arrival (game already started)
  if (!isInGame) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-center">
        <p className="text-gray-400">
          Das Spiel hat bereits begonnen. Beitritt nicht mehr möglich.
        </p>
      </div>
    );
  }

  // Winner screen
  if (game.status === 'finished') {
    return (
      <WinnerScreen
        winner={game.winner}
        players={game.players}
        sortedPlayers={sortedPlayers}
      />
    );
  }

  const myCurrentPhase = game.playerState?.[user?.uid]?.currentPhase ?? 1;

  // Round history for a player (used in host modal)
  const historyRounds =
    historyPlayer && game.rounds
      ? game.rounds
        .map((round, i) => ({ ...round, index: i }))
        .filter((r) => r.scores?.[historyPlayer.uid])
      : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-game">
      {/* Sticky header */}
      <header className="bg-gray-900/90 backdrop-blur border-b border-gray-800 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>

            <h1 className="font-black text-lg leading-none" onClick={() => navigate('/')}>
              Phase <span className="text-red-500">10</span>
            </h1>

            <p className="text-xs text-gray-500 font-mono tracking-widest">{gameId}</p>
          </div>

          {game.status === 'active' && (
            <div className="text-right">
              <div className="font-bold text-sm">Runde {game.currentRound}</div>
              <div
                className={`text-xs ${allSubmitted ? 'text-green-400' : 'text-yellow-500'
                  }`}
              >
                {submittedCount}/{totalPlayers} eingereicht
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-10">
        {/* Lobby */}
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

        {/* Active game */}
        {game.status === 'active' && (
          <div className="pt-4 space-y-4">
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

            {/* Host controls */}
            {isHost && (
              <div className="rounded-2xl bg-gray-800/60 border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-gray-300">Runde abschließen</h3>
                  <span className="text-xs text-gray-500">
                    {allSubmitted ? 'Alle bereit ✓' : `Warte auf ${totalPlayers - submittedCount} Spieler…`}
                  </span>
                </div>

                {/* Per-player submission status */}
                <div className="space-y-1.5 mb-4">
                  {sortedPlayers.map((p) => {
                    const submitted = !!game.pendingSubmissions?.[p.uid];
                    return (
                      <div key={p.uid} className="flex justify-between text-sm">
                        <span className="text-gray-400">{p.name}</span>
                        <span className={submitted ? 'text-green-400' : 'text-yellow-500'}>
                          {submitted ? `✓ ${game.pendingSubmissions[p.uid].points} Pkt` : '⏳'}
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
                  {allSubmitted ? 'Runde abschließen ✓' : 'Warte auf alle Spieler…'}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Round history modal (host only) */}
      <Modal
        isOpen={!!historyPlayer}
        onClose={() => { setHistoryPlayer(null); setEditingRound(null); }}
        title={`Verlauf: ${historyPlayer?.name}`}
      >
        {historyPlayer && (
          <>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-700">
                    <th className="text-left py-2 px-3">Runde</th>
                    <th className="text-center py-2 px-3">Punkte</th>
                    <th className="text-center py-2 px-3">Phase</th>
                    <th className="text-right py-2 px-3">Gesamt</th>
                    <th className="py-2 px-3"></th>
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
                      <td colSpan={5} className="py-4 text-center text-gray-500 text-sm">
                        Noch keine Runden gespielt.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => { setHistoryPlayer(null); setEditingRound(null); }}
            >
              Schließen
            </Button>
          </>
        )}
      </Modal>

      {/* Edit round score modal */}
      <Modal
        isOpen={!!editingRound}
        onClose={() => setEditingRound(null)}
        title={`Runde ${editingRound ? game.rounds[editingRound.index]?.roundNumber : ''} bearbeiten`}
      >
        {editingRound && (
          <>
            <InputField
              label="Punkte"
              type="number"
              inputMode="numeric"
              min="0"
              value={editingRound.points}
              onChange={(e) =>
                setEditingRound((r) => ({ ...r, points: e.target.value }))
              }
              autoFocus
            />

            {editingRound.points !== '' && (
              <p className={`mt-3 text-sm font-semibold ${editPhaseCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                {editPhaseCompleted ? '✓ Phase geschafft (< 50 Pkt)' : '✗ Phase nicht geschafft (≥ 50 Pkt)'}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setEditingRound(null)}
              >
                Abbrechen
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
                {editSaving ? 'Speichern…' : 'Speichern'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
