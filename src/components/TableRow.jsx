import { useTranslation } from 'react-i18next';
import Button from './Button';

export default function TableRow({ roundNumber, score, isHost, onEdit }) {
  const { t } = useTranslation();

  return (
    <tr className="border-b border-gray-800 last:border-0">
      <td className="px-3 py-2.5 text-sm text-gray-400">{roundNumber}</td>
      <td className="px-3 py-2.5 text-center font-bold text-white">{score.points}</td>
      <td className="px-3 py-2.5 text-center">
        {score.phaseCompleted ? (
          <span className="text-sm font-semibold text-green-400">✓</span>
        ) : (
          <span className="text-gray-600">–</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right text-sm text-gray-400">{score.totalAfter ?? '–'}</td>
      {isHost && (
        <td className="px-3 py-2.5 text-right">
          <button
            onClick={onEdit}
            className="text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300"
          >
            {t('history.edit')}
          </button>
        </td>
      )}
    </tr>
  );
}
