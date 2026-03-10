import Button from './Button';

export default function TableRow({ roundNumber, score, isHost, onEdit }) {
  return (
    <tr className="border-b border-gray-800 last:border-0">
      <td className="py-2.5 px-3 text-gray-400 text-sm">{roundNumber}</td>
      <td className="py-2.5 px-3 font-bold text-white text-center">{score.points}</td>
      <td className="py-2.5 px-3 text-center">
        {score.phaseCompleted ? (
          <span className="text-green-400 text-sm font-semibold">✓</span>
        ) : (
          <span className="text-gray-600">–</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-gray-400 text-sm text-right">{score.totalAfter ?? '–'}</td>
      {isHost && (
        <td className="py-2.5 px-3 text-right">
          <button
            onClick={onEdit}
            className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            Bearbeiten
          </button>
        </td>
      )}
    </tr>
  );
}
