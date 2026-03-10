import { motion } from 'framer-motion';
import { PLAYER_COLORS, TOTAL_PHASES } from '../constants';

export default function WinnerScreen({ winner, players, sortedPlayers }) {
  const winnerPlayer = players?.[winner?.uid];
  const color = PLAYER_COLORS[winnerPlayer?.colorIndex ?? 0] ?? PLAYER_COLORS[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-7xl mb-4"
      >
        🏆
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-4xl font-black mb-1 ${color.text}`}
      >
        {winner?.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-400 mb-8"
      >
        hat gewonnen! Phase 10 mit {winner?.score} Punkten.
      </motion.p>

      {/* Final standings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm bg-gray-800/60 border border-gray-700 rounded-2xl p-4 text-left"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Endstand
        </h3>
        <div className="space-y-2.5">
          {sortedPlayers.map((p, i) => {
            const pColor = PLAYER_COLORS[p.colorIndex ?? 0] ?? PLAYER_COLORS[0];
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={p.uid} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-base">{medals[i] ?? `${i + 1}.`}</span>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${pColor.bg}`} />
                  <span className="text-white font-semibold text-sm">{p.name}</span>
                </div>
                <div className="text-right text-sm">
                  <span className="text-gray-400">
                    Phase {Math.min(p.currentPhase, TOTAL_PHASES)} ·{' '}
                  </span>
                  <span className="text-white font-bold">{p.totalScore} Pkt</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
