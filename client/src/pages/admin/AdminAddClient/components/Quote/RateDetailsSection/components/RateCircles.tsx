import { Input } from '@/components/ui/input';

interface RateCirclesProps {
  selectedRateIds: number[];
  rateValues: string[];
  setRateValues: (values: string[]) => void;
  editingRateIndex: number | null;
  setEditingRateIndex: (index: number | null) => void;
}

/**
 * Rate circles grid component
 * Displays rate circles that can be clicked to edit rate values
 */
const RateCircles = ({
  selectedRateIds,
  rateValues,
  setRateValues,
  editingRateIndex,
  setEditingRateIndex
}: RateCirclesProps) => {
  return (
    <>
      {selectedRateIds.map((rateId) => (
        <div key={rateId} className="flex justify-center items-center">
          {editingRateIndex === rateId ? (
            <div className="relative">
              <Input
                type="text"
                value={rateValues[rateId]}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '');
                  const newValues = [...rateValues];
                  newValues[rateId] = value;
                  setRateValues(newValues);
                }}
                onBlur={() => setEditingRateIndex(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingRateIndex(null);
                  }
                }}
                placeholder="0.00"
                autoFocus
                className="w-[86px] h-[86px] text-center text-xl font-semibold rounded-full border-4 border-blue-500 bg-white focus:ring-2 focus:ring-blue-300"
                data-testid={`input-rate-${rateId}`}
              />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                %
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingRateIndex(rateId)}
              className="w-[86px] h-[86px] rounded-full transition-colors duration-200 flex items-center justify-center text-white font-semibold text-lg shadow-lg hover:shadow-xl border-2"
              style={{
                backgroundColor: '#1a3373',
                borderColor: '#0d1a3d'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0d1a3d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a3373';
              }}
              data-testid={`button-rate-circle-${rateId}`}
            >
              {rateValues[rateId] ? `${rateValues[rateId]}%` : '%'}
            </button>
          )}
        </div>
      ))}
    </>
  );
};

export default RateCircles;
