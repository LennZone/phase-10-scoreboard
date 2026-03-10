import { motion } from 'framer-motion';
import { PLAYER_COLORS, PHASES, TOTAL_PHASES } from '../constants';

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export default function ScoreCard({ player, rank, pendingSubmission, onShowHistory }) {
  const color = PLAYER_COLORS[player.colorIndex ?? 0] ?? PLAYER_COLORS[0];
  const phase = Math.min(player.currentPhase, TOTAL_PHASES);
  const phaseDesc = PHASES[phase - 1]?.desc ?? '';
  const isFinished = player.currentPhase > TOTAL_PHASES;
  const rankLabel = RANK_ICONS[rank - 1] ?? `${rank}.`;

  const submittedThisRound = !!pendingSubmission;

  return (
    <div
      className={`rounded-2xl border ${color.border} bg-gradient-to-r ${color.gradient} bg-gray-900/80 p-4 select-none`}
    >
      {/* Top row: rank + name + score */}
      <div className="flex items-center gap-3">
        <span className="text-xl w-8 shrink-0">{rankLabel}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-base truncate">{player.name}</span>
            {onShowHistory && (
              <button
                onClick={onShowHistory}
                className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2"
              >
                Verlauf
              </button>
            )}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {isFinished ? 'Phase 10 abgeschlossen! 🎉' : phaseDesc}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-white leading-none">{player.totalScore}</div>
          <div className="text-xs text-gray-500">Pkt</div>
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

      {/* Bottom row: phase badge + submission status */}
      <div className="mt-2.5 flex items-center justify-between">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color.badge}`}>
          Phase {phase}
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
            {submittedThisRound ? '✓ eingereicht' : '⏳ ausstehend'}
          </motion.span>
        )}
      </div>
    </div>
  );
}
