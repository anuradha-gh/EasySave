import { TrendingUp, Target, Calendar } from 'lucide-react';

interface ProgressHeaderProps {
  totalSaved: number;
  targetAmount: number;
  percentComplete: number;
  daysChecked: number;
  totalDays: number;
}

export default function ProgressHeader({
  totalSaved,
  targetAmount,
  percentComplete,
  daysChecked,
  totalDays,
}: ProgressHeaderProps) {
  const remaining = targetAmount - totalSaved;
  const clampedPercent = Math.min(100, Math.max(0, percentComplete));

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/30">
      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Savings Progress
          </h3>
          <span className="text-sm font-bold text-emerald-400">
            {clampedPercent.toFixed(1)}%
          </span>
        </div>
        <div className="relative bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${clampedPercent}%` }}
          />
          {clampedPercent > 8 && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
              {clampedPercent.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Saved */}
        <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/15">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Saved
            </p>
            <p className="text-lg font-bold text-emerald-400">
              Rs. {totalSaved.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Remaining */}
        <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/15">
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Remaining
            </p>
            <p className="text-lg font-bold text-amber-400">
              Rs. {remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-500/15">
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Progress
            </p>
            <p className="text-lg font-bold text-slate-300">
              {daysChecked} / {totalDays} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
