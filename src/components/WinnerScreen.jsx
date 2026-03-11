import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PLAYER_COLORS, TOTAL_PHASES } from '../constants';

export default function WinnerScreen({ winner, players, sortedPlayers }) {
  const { t } = useTranslation();
  const winnerPlayer = players?.[winner?.uid];
  const color = PLAYER_COLORS[winnerPlayer?.colorIndex ?? 0] ?? PLAYER_COLORS[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500"
      >
        {t('winner.won')}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`mb-1 text-5xl font-bold tracking-tight ${color.text}`}
      >
        {winner?.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-10 text-sm text-slate-400"
      >
        {t('winner.score', { score: winner?.score })}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card w-full max-w-sm rounded-2xl p-5 text-left"
      >
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          {t('winner.standings')}
        </h3>
        <div className="space-y-3">
          {sortedPlayers.map((p, i) => {
            const pColor = PLAYER_COLORS[p.colorIndex ?? 0] ?? PLAYER_COLORS[0];
            return (
              <div key={p.uid} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-sm font-medium tabular-nums text-slate-500">
                    {i + 1}.
                  </span>
                  <div className={`h-2 w-2 shrink-0 rounded-full ${pColor.bg}`} />
                  <span className="text-sm font-medium text-white">{p.name}</span>
                </div>
                <div className="text-right text-sm">
                  <span className="text-slate-400">
                    {t('scoreCard.phase')} {Math.min(p.currentPhase, TOTAL_PHASES)} ·{' '}
                  </span>
                  <span className="font-semibold text-white">
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
