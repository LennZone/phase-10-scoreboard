import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  arrayUnion,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import { db, auth } from '../firebase';
import {
  generateGameId,
  getSortedPlayers,
  processRoundClose,
  recalcPlayerState,
} from '../gameLogic';
import { MAX_PLAYERS, MIN_PLAYERS } from '../constants';

export function useGame(gameId) {
  const [user, setUser] = useState(null);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth: track state; only auto-sign-in anonymously on game pages (for guests)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else if (gameId) {
        // Guest joining via link — sign in anonymously so they can interact
        try {
          const result = await signInAnonymously(auth);
          setUser(result.user);
        } catch (e) {
          setError('Authentifizierung fehlgeschlagen: ' + e.message);
        }
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, [gameId]);

  // Firestore real-time subscription
  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const gameRef = doc(db, 'games', gameId);
    const unsub = onSnapshot(
      gameRef,
      (snap) => {
        if (snap.exists()) {
          setGame({ id: snap.id, ...snap.data() });
          setError(null);
        } else {
          setGame(null);
          setError('Spiel nicht gefunden.');
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, [gameId]);

  const createGame = useCallback(
    async (hostName) => {
      let currentUser = user || auth.currentUser;
      if (!currentUser) {
        const result = await signInAnonymously(auth);
        currentUser = result.user;
        setUser(currentUser);
      }
      const gid = generateGameId();
      // Anonymous games get a TTL of 24h; Google-signed-in games are kept indefinitely
      const ttl = currentUser.isAnonymous
        ? Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
        : null;
      await setDoc(doc(db, 'games', gid), {
        hostUid: currentUser.uid,
        status: 'lobby',
        createdAt: serverTimestamp(),
        ttl,
        currentRound: 1,
        players: {
          [currentUser.uid]: {
            name: hostName.trim(),
            colorIndex: 0,
            joinedAt: serverTimestamp(),
          },
        },
        playerState: {
          [currentUser.uid]: { currentPhase: 1, totalScore: 0 },
        },
        pendingSubmissions: {},
        rounds: [],
        winner: null,
        participants: [currentUser.uid],
      });
      return gid;
    },
    [user]
  );

  const joinGame = useCallback(
    async (gid, playerName) => {
      const currentUser = user || auth.currentUser;
      if (!currentUser) throw new Error('Nicht angemeldet.');
      const gameRef = doc(db, 'games', gid);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(gameRef);
        if (!snap.exists()) throw new Error('Spiel nicht gefunden.');
        const data = snap.data();
        if (data.status !== 'lobby') throw new Error('Das Spiel hat bereits begonnen.');
        const count = Object.keys(data.players || {}).length;
        if (count >= MAX_PLAYERS) throw new Error('Das Spiel ist voll (max. 6 Spieler).');
        tx.update(gameRef, {
          [`players.${currentUser.uid}`]: {
            name: playerName.trim(),
            colorIndex: count,
            joinedAt: serverTimestamp(),
          },
          [`playerState.${currentUser.uid}`]: { currentPhase: 1, totalScore: 0 },
          participants: arrayUnion(currentUser.uid),
        });
      });
    },
    [user]
  );

  const startGame = useCallback(async () => {
    if (!user || !game || game.hostUid !== user.uid) return;
    if (Object.keys(game.players || {}).length < MIN_PLAYERS)
      throw new Error(`Mindestens ${MIN_PLAYERS} Spieler erforderlich.`);
    await updateDoc(doc(db, 'games', game.id), {
      status: 'active',
      pendingSubmissions: {},
    });
  }, [user, game]);

  const submitScore = useCallback(
    async (points, phaseCompleted) => {
      if (!user || !game) return;
      await updateDoc(doc(db, 'games', game.id), {
        [`pendingSubmissions.${user.uid}`]: {
          points: Number(points) || 0,
          phaseCompleted: !!phaseCompleted,
          submittedAt: serverTimestamp(),
        },
      });
    },
    [user, game]
  );

  const closeRound = useCallback(async () => {
    if (!user || !game || game.hostUid !== user.uid) return;
    const gameRef = doc(db, 'games', game.id);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef);
      const data = snap.data();
      const { newPlayerState, newRounds, finished, winner } = processRoundClose(data);

      const updates = {
        playerState: newPlayerState,
        rounds: newRounds,
        pendingSubmissions: {},
        currentRound: finished ? data.currentRound : data.currentRound + 1,
        status: finished ? 'finished' : 'active',
      };
      if (finished && winner) {
        updates.winner = {
          uid: winner.uid,
          name: winner.name || data.players[winner.uid]?.name,
          score: winner.totalScore,
        };
      }
      tx.update(gameRef, updates);
    });
  }, [user, game]);

  const editRoundScore = useCallback(
    async (targetUid, roundIndex, newPoints, newPhaseCompleted) => {
      if (!user || !game || game.hostUid !== user.uid) return;
      const gameRef = doc(db, 'games', game.id);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(gameRef);
        const data = snap.data();

        // Update the entry for the target player in the specified round
        const updatedRounds = data.rounds.map((round, i) => {
          if (i !== roundIndex) return round;
          return {
            ...round,
            scores: {
              ...round.scores,
              [targetUid]: {
                ...round.scores?.[targetUid],
                points: Number(newPoints) || 0,
                phaseCompleted: !!newPhaseCompleted,
              },
            },
          };
        });

        // Recompute phaseAfter/totalAfter for that player across all rounds
        let runningPhase = 1;
        let runningTotal = 0;
        const recomputed = updatedRounds.map((round) => {
          const score = round.scores?.[targetUid];
          if (!score) return round;
          runningTotal += score.points || 0;
          if (score.phaseCompleted && runningPhase <= 10) runningPhase++;
          return {
            ...round,
            scores: {
              ...round.scores,
              [targetUid]: {
                ...score,
                phaseAfter: runningPhase,
                totalAfter: runningTotal,
              },
            },
          };
        });

        tx.update(gameRef, {
          rounds: recomputed,
          [`playerState.${targetUid}`]: {
            currentPhase: runningPhase,
            totalScore: runningTotal,
          },
        });
      });
    },
    [user, game]
  );

  const updatePlayerName = useCallback(
    async (targetUid, newName) => {
      if (!game || !newName.trim()) return;
      await updateDoc(doc(db, 'games', game.id), {
        [`players.${targetUid}.name`]: newName.trim(),
      });
    },
    [game]
  );

  const deleteGame = useCallback(
    async (gid) => {
      const currentUser = user || auth.currentUser;
      if (!currentUser) throw new Error('Nicht angemeldet.');
      await deleteDoc(doc(db, 'games', gid));
    },
    [user]
  );

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const isGoogleUser = user?.providerData?.some((p) => p.providerId === 'google.com') ?? false;

  const isHost = !!(user && game && game.hostUid === user.uid);
  const isInGame = !!(user && game?.players?.[user.uid]);
  const sortedPlayers = getSortedPlayers(game?.players, game?.playerState);
  const myPendingSubmission = user ? game?.pendingSubmissions?.[user.uid] : null;

  const submittedCount = Object.keys(game?.pendingSubmissions || {}).length;
  const totalPlayers = Object.keys(game?.players || {}).length;
  const allSubmitted = totalPlayers > 0 && submittedCount >= totalPlayers;

  return {
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
    createGame,
    joinGame,
    startGame,
    submitScore,
    closeRound,
    editRoundScore,
    updatePlayerName,
    deleteGame,
    signInWithGoogle,
    signOutUser,
    isGoogleUser,
  };
}
