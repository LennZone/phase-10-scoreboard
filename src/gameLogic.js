import { TOTAL_PHASES } from './constants';

export function generateGameId() {
  // Omit chars that look similar (0/O, 1/I) to avoid confusion
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export function getSortedPlayers(players = {}, playerState = {}) {
  return Object.keys(players)
    .map((uid) => ({
      uid,
      ...players[uid],
      currentPhase: playerState[uid]?.currentPhase ?? 1,
      totalScore: playerState[uid]?.totalScore ?? 0,
    }))
    .sort((a, b) => {
      const phaseDiff = b.currentPhase - a.currentPhase;
      if (phaseDiff !== 0) return phaseDiff;
      return a.totalScore - b.totalScore;
    });
}

// Pure function — called inside a Firestore transaction in useGame.js
export function processRoundClose(data) {
  const { players, playerState, rounds = [], currentRound, pendingSubmissions = {} } = data;

  const roundScores = {};
  const newPlayerState = Object.fromEntries(
    Object.entries(playerState || {}).map(([uid, s]) => [uid, { ...s }])
  );

  for (const [uid, sub] of Object.entries(pendingSubmissions)) {
    if (!players[uid]) continue;
    const current = newPlayerState[uid] ?? { currentPhase: 1, totalScore: 0 };
    const points = Number(sub.points) || 0;
    const phaseCompleted = !!sub.phaseCompleted;
    const newPhase = phaseCompleted
      ? Math.min(current.currentPhase + 1, TOTAL_PHASES + 1)
      : current.currentPhase;
    const newTotal = current.totalScore + points;

    roundScores[uid] = {
      points,
      phaseCompleted,
      phaseAfter: newPhase,
      totalAfter: newTotal,
    };
    newPlayerState[uid] = { currentPhase: newPhase, totalScore: newTotal };
  }

  const newRound = { roundNumber: currentRound, scores: roundScores };
  const newRounds = [...rounds, newRound];

  const finished = Object.values(newPlayerState).some((s) => s.currentPhase > TOTAL_PHASES);

  let winner = null;
  if (finished) {
    const sorted = Object.entries(newPlayerState)
      .map(([uid, s]) => ({ uid, ...s, name: players[uid]?.name }))
      .sort((a, b) => b.currentPhase - a.currentPhase || a.totalScore - b.totalScore);
    winner = sorted[0];
  }

  return { newPlayerState, newRounds, finished, winner };
}

// Recalculate a single player's state from the full round history
export function recalcPlayerState(uid, rounds) {
  let currentPhase = 1;
  let totalScore = 0;
  for (const round of rounds) {
    const score = round.scores?.[uid];
    if (!score) continue;
    totalScore += score.points || 0;
    if (score.phaseCompleted && currentPhase <= TOTAL_PHASES) {
      currentPhase++;
    }
  }
  return { currentPhase, totalScore };
}
