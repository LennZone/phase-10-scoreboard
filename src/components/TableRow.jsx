import { useTranslation } from 'react-i18next';
import { CheckIcon } from './Icons';

export default function TableRow({ roundNumber, score, isHost, onEdit }) {
  const { t } = useTranslation();

  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="px-3 py-2.5 text-sm text-slate-400">{roundNumber}</td>
      <td className="px-3 py-2.5 text-center font-semibold text-white">{score.points}</td>
      <td className="px-3 py-2.5 text-center">
        {score.phaseCompleted ? (
          <span className="inline-flex text-emerald-400">
            <CheckIcon className="h-4 w-4" />
          </span>
        ) : (
          <span className="text-slate-600">–</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right text-sm text-slate-400">{score.totalAfter ?? '–'}</td>
      {isHost && (
        <td className="px-3 py-2.5 text-right">
          <button
            onClick={onEdit}
            className="text-xs text-violet-400 underline underline-offset-2 hover:text-violet-300"
          >
            {t('history.edit')}
          </button>
        </td>
      )}
    </tr>
  );
}
