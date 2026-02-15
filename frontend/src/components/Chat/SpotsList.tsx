import type { Place } from '../../api/navigation';

interface SpotsListProps {
  spots: Place[];
  onSelect?: (spot: Place) => void;
  selectedSpots?: Place[];
}

export function SpotsList({ spots, onSelect, selectedSpots = [] }: SpotsListProps) {
  const isSelected = (spot: Place) => selectedSpots.some((s) => s.name === spot.name);
  if (spots.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
          <svg
            className="h-10 w-10 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="mb-3 text-xl font-semibold text-gray-800">ドライブ先を教えてください</h3>
        <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-gray-600">
          行きたい場所や寄り道したいスポットを教えてください。
          <br />
          AIがあなたにぴったりのルートを提案します。
        </p>
        <div className="flex w-full max-w-md flex-col gap-2">
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-sm text-gray-700">💡 例: 「東京駅から箱根まで行きたい」</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50/50 to-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-sm text-gray-700">💡 例: 「途中で温泉に寄りたい」</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-6 py-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        おすすめスポット（タップして経由地に追加）
      </h3>
      {spots.map((spot, index) => (
        <button
          key={`${spot.name}-${spot.address}-${index}`}
          onClick={() => onSelect?.(spot)}
          className={`group w-full rounded-xl border p-4 text-left shadow-sm transition-all hover:shadow-md ${
            isSelected(spot)
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="mb-1 font-semibold text-gray-800 group-hover:text-blue-600">
                {spot.name}
              </h4>
              <p className="mb-2 text-sm text-gray-600">{spot.address}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {spot.price_level && (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {spot.price_level}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-4 flex flex-col items-end">
              <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {spot.rating.toFixed(1)}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
