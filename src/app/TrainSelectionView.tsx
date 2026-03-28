import { trains } from "../engine/challenges/trains";
import { useNavigate } from 'react-router-dom';

export function TrainSelectionView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl text-white font-bold mb-6">
        Choose Your Train 🚆
      </h1>

      {trains.map(train => (
        <button
          key={train.id}
          onClick={() => navigate(`/train/${train.id}`)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-xl w-80 text-left shadow"
        >
          <h2 className="text-xl font-semibold">{train.title}</h2>
          <p className="text-gray-400 text-sm">{train.description}</p>
        </button>
      ))}
    </div>
  );
}