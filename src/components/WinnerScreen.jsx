import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PLAYER_COLORS, TOTAL_PHASES } from '../constants';

export default function WinnerScreen({ winner, players, sortedPlayers }) {
  const { t } = useTranslation();
  const winnerPlayer = players?.[winner?.uid];
  const color = PLAYER_COLORS[winnerPlayer?.colorIndex ?? 0] ?? PLAYER_COLORS[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-4 text-7xl"
      >
        🏆
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mb-1 text-4xl font-black ${color.text}`}
      >
        {winner?.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 text-gray-400"
      >
        {t('winner.won')} {t('winner.score', { score: winner?.score })}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-800/60 p-4 text-left"
      >
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          {t('winner.standings')}
        </h3>
        <div className="space-y-2.5">
          {sortedPlayers.map((p, i) => {
            const pColor = PLAYER_COLORS[p.colorIndex ?? 0] ?? PLAYER_COLORS[0];
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={p.uid} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-base">{medals[i] ?? `${i + 1}.`}</span>
                  <div className={`h-2 w-2 shrink-0 rounded-full ${pColor.bg}`} />
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                </div>
                <div className="text-right text-sm">
                  <span className="text-gray-400">
                    {t('scoreCard.phase')} {Math.min(p.currentPhase, TOTAL_PHASES)} ·{' '}
                  </span>
                  <span className="font-bold text-white">
                    {p.totalScore} {t('scoreCard.pts')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
