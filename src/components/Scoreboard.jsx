import { AnimatePresence, motion } from 'framer-motion';
import ScoreCard from './ScoreCard';

export default function Scoreboard({
  players,
  pendingSubmissions,
  isHost,
  onShowHistory,
  currentRound,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Scoreboard</h2>
        {currentRound && (
          <span className="text-sm text-gray-500">Runde {currentRound}</span>
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
                onShowHistory={
                  isHost && onShowHistory ? () => onShowHistory(player) : undefined
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
