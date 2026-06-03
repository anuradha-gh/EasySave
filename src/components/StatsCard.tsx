import { useMemo } from 'react';
import { Zap, CheckCircle2, Trophy, Wallet } from 'lucide-react';

interface StatsCardProps {
  quickWinsLeft: number;
  highestChecked: number;
  totalTiles: number;
  checkedCount: number;
  grid: number[];
  checkedTiles: boolean[];
}

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

export default function StatsCard({
  totalTiles,
  checkedCount,
  grid,
  checkedTiles,
}: StatsCardProps) {
  const stats = useMemo(() => {
    // 25th percentile threshold for "quick wins"
    const sorted = [...grid].sort((a, b) => a - b);
    const p25Index = Math.floor(sorted.length * 0.25);
    const p25Threshold = sorted[p25Index] ?? 0;

    const quickWinsLeft = grid.filter(
      (amount, idx) => amount <= p25Threshold && !checkedTiles[idx],
    ).length;

    // Highest checked amount
    let highestChecked = 0;
    let totalSaved = 0;
    grid.forEach((amount, idx) => {
      if (checkedTiles[idx]) {
        totalSaved += amount;
        if (amount > highestChecked) highestChecked = amount;
      }
    });

    return { quickWinsLeft, highestChecked, totalSaved };
  }, [grid, checkedTiles]);

  const statItems: StatItem[] = [
    {
      icon: <Zap className="w-5 h-5" />,
      value: String(stats.quickWinsLeft),
      label: 'Quick Wins',
      color: 'text-amber-400 bg-amber-500/15',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      value: `${checkedCount} / ${totalTiles}`,
      label: 'Tiles Done',
      color: 'text-emerald-400 bg-emerald-500/15',
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      value: `Rs. ${stats.highestChecked.toLocaleString()}`,
      label: 'Highest Saved',
      color: 'text-yellow-400 bg-yellow-500/15',
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      value: `Rs. ${stats.totalSaved.toLocaleString()}`,
      label: 'Total Saved',
      color: 'text-teal-400 bg-teal-500/15',
    },
  ];

  return (
    <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex items-center gap-3 min-w-[160px]"
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-white truncate">
                {stat.value}
              </p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
