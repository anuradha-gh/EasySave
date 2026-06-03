import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getActiveGoal, updateCheckedTiles } from '../lib/db';
import { Goal } from '../lib/types';
import ProgressHeader from '../components/ProgressHeader';
import StatsCard from '../components/StatsCard';
import SavingsGrid from '../components/SavingsGrid';
import CelebrationEffect from '../components/CelebrationEffect';
import ConfirmModal from '../components/ConfirmModal';

const MILESTONES = [25, 50, 75, 100];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── Core state ─────────────────────────────────────────── */
  const [goal, setGoal] = useState<Goal | null>(null);
  const [checkedTiles, setCheckedTiles] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Celebration state ──────────────────────────────────── */
  const [celebrate, setCelebrate] = useState(false);
  const [celebrationIntensity, setCelebrationIntensity] = useState<
    'low' | 'medium' | 'high'
  >('low');

  /* ── Confirm-uncheck modal ──────────────────────────────── */
  const [uncheckIndex, setUncheckIndex] = useState<number | null>(null);

  /* ── Load active goal on mount ──────────────────────────── */
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      const activeGoal = await getActiveGoal(user!.id);

      if (cancelled) return;

      if (!activeGoal) {
        navigate('/setup', { replace: true });
        return;
      }

      setGoal(activeGoal);
      setCheckedTiles(
        activeGoal.checked_tiles ??
          new Array(activeGoal.grid.length).fill(false),
      );
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  /* ── Derived stats ──────────────────────────────────────── */
  const stats = useMemo(() => {
    if (!goal) {
      return {
        totalSaved: 0,
        remaining: 0,
        percentComplete: 0,
        daysChecked: 0,
        totalDays: 0,
        totalTiles: 0,
        checkedCount: 0,
        quickWinsLeft: 0,
        highestChecked: 0,
        daysLeft: 0,
      };
    }

    const grid = goal.grid;
    const totalTiles = grid.length;
    const totalDays = goal.total_days;

    let totalSaved = 0;
    let checkedCount = 0;
    let highestChecked = 0;

    checkedTiles.forEach((checked, i) => {
      if (checked) {
        totalSaved += grid[i];
        checkedCount++;
        if (grid[i] > highestChecked) highestChecked = grid[i];
      }
    });

    const remaining = goal.target_amount - totalSaved;
    const percentComplete =
      goal.target_amount > 0
        ? Math.min(100, Math.round((totalSaved / goal.target_amount) * 100))
        : 0;
    const daysChecked = checkedCount;
    const daysLeft = totalDays - daysChecked;

    // Quick wins = tiles in the bottom 25% by value that haven't been checked
    const sortedValues = [...grid].sort((a, b) => a - b);
    const quickWinThreshold = sortedValues[Math.floor(sortedValues.length * 0.25)] ?? 0;
    const quickWinsLeft = grid.filter(
      (val, i) => val <= quickWinThreshold && !checkedTiles[i],
    ).length;

    return {
      totalSaved,
      remaining,
      percentComplete,
      daysChecked,
      totalDays,
      totalTiles,
      checkedCount,
      quickWinsLeft,
      highestChecked,
      daysLeft,
    };
  }, [goal, checkedTiles]);

  /* ── Helpers ────────────────────────────────────────────── */

  /** Check if the tile at `index` is a top-10% high-value tile */
  const isHighValueTile = useCallback(
    (index: number) => {
      if (!goal) return false;
      const sorted = [...goal.grid].sort((a, b) => a - b);
      const threshold = sorted[Math.floor(sorted.length * 0.9)] ?? Infinity;
      return goal.grid[index] >= threshold;
    },
    [goal],
  );

  /** Determine if a milestone was just crossed */
  const checkMilestone = useCallback(
    (newChecked: boolean[]) => {
      if (!goal) return false;
      const newSaved = newChecked.reduce(
        (sum, c, i) => (c ? sum + goal.grid[i] : sum),
        0,
      );
      const newPercent = Math.round(
        (newSaved / goal.target_amount) * 100,
      );
      const oldPercent = stats.percentComplete;

      return MILESTONES.some((m) => oldPercent < m && newPercent >= m);
    },
    [goal, stats.percentComplete],
  );

  /** Fire the celebration animation */
  const triggerCelebration = useCallback(
    (intensity: 'low' | 'medium' | 'high') => {
      setCelebrationIntensity(intensity);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 3000);
    },
    [],
  );

  /** Persist tiles to DB */
  const persistTiles = useCallback(
    async (newChecked: boolean[]) => {
      if (!goal || !user) return;
      await updateCheckedTiles(goal.id, newChecked);
    },
    [goal, user],
  );

  /* ── Tile toggle handler ────────────────────────────────── */
  const handleTileToggle = useCallback(
    async (index: number) => {
      if (!goal) return;

      // Unchecking → confirm first
      if (checkedTiles[index]) {
        setUncheckIndex(index);
        return;
      }

      // Checking
      const newChecked = [...checkedTiles];
      newChecked[index] = true;
      setCheckedTiles(newChecked);

      // Check celebrations
      const milestoneHit = checkMilestone(newChecked);
      const highValue = isHighValueTile(index);

      if (milestoneHit) {
        // Determine intensity by which milestone
        const newSaved = newChecked.reduce(
          (sum, c, i) => (c ? sum + goal.grid[i] : sum),
          0,
        );
        const newPct = Math.round((newSaved / goal.target_amount) * 100);
        if (newPct >= 100) triggerCelebration('high');
        else if (newPct >= 75) triggerCelebration('high');
        else if (newPct >= 50) triggerCelebration('medium');
        else triggerCelebration('low');
      } else if (highValue) {
        triggerCelebration('medium');
      }

      await persistTiles(newChecked);
    },
    [goal, checkedTiles, checkMilestone, isHighValueTile, triggerCelebration, persistTiles],
  );

  /** Confirm the uncheck */
  const confirmUncheck = useCallback(async () => {
    if (uncheckIndex === null) return;

    const newChecked = [...checkedTiles];
    newChecked[uncheckIndex] = false;
    setCheckedTiles(newChecked);
    setUncheckIndex(null);

    await persistTiles(newChecked);
  }, [uncheckIndex, checkedTiles, persistTiles]);

  /* ── Loading state ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            Loading your savings grid…
          </p>
        </div>
      </div>
    );
  }

  if (!goal) return null;

  /* ── Main render ────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950">
      {/* Celebration overlay */}
      <CelebrationEffect trigger={celebrate} intensity={celebrationIntensity} />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Progress header */}
        <ProgressHeader
          totalSaved={stats.totalSaved}
          targetAmount={goal.target_amount}
          percentComplete={stats.percentComplete}
          daysChecked={stats.daysChecked}
          totalDays={stats.totalDays}
        />

        {/* Stats card */}
        <div className="mt-6">
          <StatsCard
            quickWinsLeft={stats.quickWinsLeft}
            highestChecked={stats.highestChecked}
            totalTiles={stats.totalTiles}
            checkedCount={stats.checkedCount}
            grid={goal.grid}
            checkedTiles={checkedTiles}
          />
        </div>

        {/* Savings grid */}
        <div className="mt-6">
          <SavingsGrid
            grid={goal.grid}
            checkedTiles={checkedTiles}
            onTileToggle={handleTileToggle}
          />
        </div>
      </div>

      {/* Confirm-uncheck modal */}
      {uncheckIndex !== null && (
        <ConfirmModal
          title="Uncheck this tile?"
          description={`This will remove Rs. ${goal.grid[uncheckIndex].toLocaleString('en-LK')} from your saved total. Are you sure?`}
          confirmLabel="Yes, uncheck"
          variant="warning"
          onConfirm={confirmUncheck}
          onCancel={() => setUncheckIndex(null)}
        />
      )}
    </div>
  );
}
