import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useGameHistory(uid) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) {
      setGames([]);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'games'),
      where('participants', 'array-contains', uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const result = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setGames(result);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  return { games, loading };
}
