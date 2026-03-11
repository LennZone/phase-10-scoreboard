import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PLAYER_COLORS, TOTAL_PHASES } from '../constants';

export default function ScoreCard({ player, rank, pendingSubmission, onShowHistory }) {
  const { t } = useTranslation();
  const color = PLAYER_COLORS[player.colorIndex ?? 0] ?? PLAYER_COLORS[0];
  const phase = Math.min(player.currentPhase, TOTAL_PHASES);
  const isFinished = player.currentPhase > TOTAL_PHASES;
  const submittedThisRound = !!pendingSubmission;

  return (
    <div className="glass-card select-none rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <span className="w-7 shrink-0 text-sm font-semibold tabular-nums text-slate-500">
          {rank}.
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-base font-semibold text-white">{player.name}</span>
            {onShowHistory && (
              <button
                onClick={onShowHistory}
                className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-300"
              >
                {t('game.history')}
              </button>
            )}
          </div>
          <div className="truncate text-xs text-slate-400">
            {isFinished ? t('scoreCard.finished') : t(`phases.${phase}`)}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold tabular-nums leading-none text-white">
            {player.totalScore}
          </div>
          <div className="text-xs text-slate-500">{t('scoreCard.pts')}</div>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="mt-3 flex gap-0.5">
        {Array.from({ length: TOTAL_PHASES }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < phase - 1 || isFinished
                ? color.bg
                : i === phase - 1 && !isFinished
                  ? 'bg-white/25'
                  : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${color.badge}`}>
          {t('scoreCard.phase')} {phase}
        </span>
        {pendingSubmission !== undefined && (
          <motion.span
            key={submittedThisRound ? 'submitted' : 'pending'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-xs font-medium ${
              submittedThisRound ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {submittedThisRound ? t('scoreCard.submitted') : t('scoreCard.pending')}
          </motion.span>
        )}
      </div>
    </div>
  );
}
