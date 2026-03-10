import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PLAYER_COLORS, TOTAL_PHASES } from '../constants';

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export default function ScoreCard({ player, rank, pendingSubmission, onShowHistory }) {
  const { t } = useTranslation();
  const color = PLAYER_COLORS[player.colorIndex ?? 0] ?? PLAYER_COLORS[0];
  const phase = Math.min(player.currentPhase, TOTAL_PHASES);
  const isFinished = player.currentPhase > TOTAL_PHASES;
  const rankLabel = RANK_ICONS[rank - 1] ?? `${rank}.`;

  const submittedThisRound = !!pendingSubmission;

  return (
    <div
      className={`rounded-2xl border ${color.border} bg-gradient-to-r ${color.gradient} bg-gray-900/80 p-4 select-none`}
    >
      <div className="flex items-center gap-3">
        <span className="w-8 shrink-0 text-xl">{rankLabel}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-base font-bold text-white">{player.name}</span>
            {onShowHistory && (
              <button
                onClick={onShowHistory}
                className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-300"
              >
                {t('game.history')}
              </button>
            )}
          </div>
          <div className="truncate text-xs text-gray-400">
            {isFinished ? t('scoreCard.finished') : t(`phases.${phase}`)}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-black leading-none text-white">{player.totalScore}</div>
          <div className="text-xs text-gray-500">{t('scoreCard.pts')}</div>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="mt-3 flex gap-0.5">
        {Array.from({ length: TOTAL_PHASES }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < phase - 1 || isFinished
                ? color.bg
                : i === phase - 1 && !isFinished
                  ? 'bg-white/25'
                  : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${color.badge}`}>
          {t('scoreCard.phase')} {phase}
        </span>
        {pendingSubmission !== undefined && (
          <motion.span
            key={submittedThisRound ? 'submitted' : 'pending'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-xs font-semibold ${
              submittedThisRound ? 'text-green-400' : 'text-yellow-500'
            }`}
          >
            {submittedThisRound ? t('scoreCard.submitted') : t('scoreCard.pending')}
          </motion.span>
        )}
      </div>
    </div>
  );
}
