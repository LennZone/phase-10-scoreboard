import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHASES, TOTAL_PHASES } from '../constants';
import Button from './Button';
import InputField from './InputField';

const PHASE_THRESHOLD = 50;

export default function RoundEntry({ currentPhase, pendingSubmission, onSubmit }) {
  const [points, setPoints] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isSubmitted = !!pendingSubmission && !editing;
  const phase = Math.min(currentPhase, TOTAL_PHASES);
  const phaseDesc = PHASES[phase - 1]?.desc ?? '';

  // Phase is automatically completed when points < 50
  const phaseCompleted = points !== '' && Number(points) < PHASE_THRESHOLD;

  const handleSubmit = async () => {
    if (points === '' || Number(points) < 0) return;
    setSaving(true);
    try {
      await onSubmit(points, phaseCompleted);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (pendingSubmission) {
      setPoints(String(pendingSubmission.points ?? ''));
    }
    setEditing(true);
  };

  if (currentPhase > TOTAL_PHASES) {
    return (
      <div className="rounded-2xl bg-yellow-900/20 border border-yellow-700 p-4 text-center">
        <p className="text-yellow-400 font-bold">🎉 Du hast alle Phasen abgeschlossen!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gray-800/60 border border-gray-700 p-4">
      <h3 className="font-bold text-white mb-0.5">Deine Runde</h3>
      <p className="text-xs text-gray-400 mb-4">
        Phase {phase}: {phaseDesc}
      </p>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-2"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-green-400 text-2xl font-black mb-1"
            >
              ✓ {pendingSubmission.points} Punkte
            </motion.div>
            <p className="text-sm text-gray-400 mb-4">
              Phase {phase}{' '}
              {pendingSubmission.phaseCompleted ? (
                <span className="text-green-400">geschafft ✓</span>
              ) : (
                <span className="text-gray-500">nicht geschafft</span>
              )}
            </p>
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              Ändern
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <InputField
              label="Punkte (Handkarten)"
              type="number"
              inputMode="numeric"
              min="0"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="0"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />

            {points !== '' && (
              <motion.div
                key={phaseCompleted ? 'success' : 'fail'}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 text-sm font-semibold ${
                  phaseCompleted ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                <span>{phaseCompleted ? '✓' : '✗'}</span>
                <span>
                  Phase {phase} {phaseCompleted ? 'geschafft' : 'nicht geschafft'}
                  <span className="font-normal text-xs ml-1">
                    ({phaseCompleted ? `< ${PHASE_THRESHOLD} Pkt` : `≥ ${PHASE_THRESHOLD} Pkt`})
                  </span>
                </span>
              </motion.div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={saving || points === '' || Number(points) < 0}
            >
              {saving ? 'Speichern...' : 'Einreichen'}
            </Button>

            {editing && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setEditing(false)}
              >
                Abbrechen
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
