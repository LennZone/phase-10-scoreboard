import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TOTAL_PHASES } from '../constants';
import Button from './Button';
import InputField from './InputField';

const PHASE_THRESHOLD = 50;

export default function RoundEntry({ currentPhase, pendingSubmission, onSubmit }) {
  const { t } = useTranslation();
  const [points, setPoints] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isSubmitted = !!pendingSubmission && !editing;
  const phase = Math.min(currentPhase, TOTAL_PHASES);

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
      <div className="rounded-2xl border border-yellow-700 bg-yellow-900/20 p-4 text-center">
        <p className="font-bold text-yellow-400">{t('roundEntry.allDone')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800/60 p-4">
      <h3 className="mb-0.5 font-bold text-white">{t('roundEntry.title')}</h3>
      <p className="mb-4 text-xs text-gray-400">
        {t('scoreCard.phase')} {phase}: {t(`phases.${phase}`)}
      </p>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-2 text-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="mb-1 text-2xl font-black text-green-400"
            >
              ✓ {pendingSubmission.points} {t('scoreCard.pts')}
            </motion.div>
            <p className="mb-4 text-sm text-gray-400">
              {pendingSubmission.phaseCompleted ? (
                <span className="text-green-400">
                  {t('roundEntry.phaseCompleted', { phase })}
                </span>
              ) : (
                <span className="text-gray-500">
                  {t('roundEntry.phaseNotCompleted', { phase })}
                </span>
              )}
            </p>
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              {t('roundEntry.change')}
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
              label={t('roundEntry.pointsLabel')}
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
                  {phaseCompleted
                    ? t('roundEntry.phaseCompleted', { phase })
                    : t('roundEntry.phaseNotCompleted', { phase })}
                  <span className="ml-1 text-xs font-normal">
                    ({phaseCompleted
                      ? t('roundEntry.below', { n: PHASE_THRESHOLD })
                      : t('roundEntry.aboveOrEqual', { n: PHASE_THRESHOLD })})
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
              {saving ? t('roundEntry.saving') : t('roundEntry.submit')}
            </Button>

            {editing && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setEditing(false)}
              >
                {t('roundEntry.cancel')}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
