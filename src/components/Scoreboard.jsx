import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ScoreCard from './ScoreCard';

export default function Scoreboard({
  players,
  pendingSubmissions,
  isHost,
  onShowHistory,
  currentRound,
}) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t('scoreboard.title')}
        </h2>
        {currentRound && (
          <span className="text-sm text-slate-500">
            {t('scoreboard.round', { n: currentRound })}
          </span>
        )}
      </div>
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={player.uid}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                layout: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <ScoreCard
                player={player}
                rank={index + 1}
                pendingSubmission={pendingSubmissions?.[player.uid]}
                onShowHistory={isHost && onShowHistory ? () => onShowHistory(player) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
