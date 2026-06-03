import { useState, useMemo } from 'react';
import Tile from './Tile';

type FilterMode = 'all' | 'unchecked' | 'checked';

interface SavingsGridProps {
  grid: number[];
  checkedTiles: boolean[];
  onTileToggle: (index: number) => void;
}

export default function SavingsGrid({
  grid,
  checkedTiles,
  onTileToggle,
}: SavingsGridProps) {
  const [filter, setFilter] = useState<FilterMode>('all');

  const checkedCount = useMemo(
    () => checkedTiles.filter(Boolean).length,
    [checkedTiles],
  );

  // Top 10% threshold for high-value tiles
  const highValueThreshold = useMemo(() => {
    const sorted = [...grid].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * 0.9);
    return sorted[idx] ?? Infinity;
  }, [grid]);

  // Build indexed tile data and apply filter
  const visibleTiles = useMemo(() => {
    const tiles = grid.map((amount, index) => ({
      amount,
      index,
      isChecked: checkedTiles[index] ?? false,
    }));

    switch (filter) {
      case 'unchecked':
        return tiles.filter((t) => !t.isChecked);
      case 'checked':
        return tiles.filter((t) => t.isChecked);
      default:
        return tiles;
    }
  }, [grid, checkedTiles, filter]);

  const filterButtons: { label: string; value: FilterMode }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unchecked', value: 'unchecked' },
    { label: 'Checked', value: 'checked' },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        {/* Tile count */}
        <p className="text-sm text-slate-400 font-medium">
          <span className="text-emerald-400 font-bold">{checkedCount}</span>
          {' of '}
          <span className="text-white font-bold">{grid.length}</span>
          {' tiles completed'}
        </p>

        {/* Filter pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/60 rounded-lg border border-slate-700/40">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
                filter === btn.value
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visibleTiles.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {visibleTiles.map((tile) => (
            <Tile
              key={tile.index}
              amount={tile.amount}
              index={tile.index}
              isChecked={tile.isChecked}
              isHighValue={tile.amount >= highValueThreshold}
              onToggle={onTileToggle}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <p className="text-sm font-medium">
            No tiles match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
