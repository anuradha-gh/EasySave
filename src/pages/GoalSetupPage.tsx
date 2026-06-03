import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Calendar,
  Coins,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateGrid } from '../lib/gridEngine';
import { saveGoal } from '../lib/db';

/** Format a number as "Rs. 1,234" */
function formatLKR(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK')}`;
}

export default function GoalSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── Form state ─────────────────────────────────────────── */
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [totalDays, setTotalDays] = useState<string>('');
  const [minBase, setMinBase] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Derived numbers ────────────────────────────────────── */
  const target = Number(targetAmount) || 0;
  const days = Number(totalDays) || 0;
  const base = Number(minBase) || 0;

  /* ── Validation ─────────────────────────────────────────── */
  const validation = useMemo(() => {
    const issues: string[] = [];
    if (target > 0 && target < 1000)
      issues.push('Target amount must be at least Rs. 1,000');
    if (days > 0 && (days < 7 || days > 365))
      issues.push('Timeframe must be between 7 and 365 days');
    if (base > 0 && base < 1)
      issues.push('Minimum base must be at least Rs. 1');
    if (target > 0 && days > 0 && base > 0 && target < days * base)
      issues.push(
        `Target too low — ${days} days × Rs. ${base} minimum = Rs. ${(
          days * base
        ).toLocaleString('en-LK')}. Increase target or lower base.`,
      );
    return issues;
  }, [target, days, base]);

  const isValid =
    target >= 1000 &&
    days >= 7 &&
    days <= 365 &&
    base >= 1 &&
    target >= days * base &&
    validation.length === 0;

  /* ── Live preview ───────────────────────────────────────── */
  const preview = useMemo(() => {
    if (!isValid) return null;
    const avg = Math.round(target / days);
    const estimatedMax = Math.round(base * 15);
    return { avg, min: base, max: estimatedMax };
  }, [isValid, target, days, base]);

  /* ── Submit ─────────────────────────────────────────────── */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !user) return;

    setSubmitting(true);
    setError(null);

    try {
      const grid = generateGrid({ targetAmount: target, totalDays: days, minBase: base });
      const goal = await saveGoal(user.id, target, days, base, grid);
      if (!goal) throw new Error('Could not save your goal. Please try again.');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[100px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl sm:p-10"
        >
          {/* ── Header ──────────────────────────────────── */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Create Your Magic Grid
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Set a savings target and we'll generate a unique grid of daily
              amounts — some tiny, some thrilling — that add up to{' '}
              <span className="text-emerald-400">exactly</span> your goal.
            </p>
          </div>

          {/* ── Fields ──────────────────────────────────── */}
          <div className="space-y-6">
            {/* Target Amount */}
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Target className="h-4 w-4 text-emerald-400" />
                Target Amount (LKR)
              </label>
              <p className="mb-2 text-xs text-slate-500">
                The total amount you want to save
              </p>
              <input
                type="number"
                min={1000}
                placeholder="100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              />
              {target >= 1000 && (
                <p className="mt-1.5 text-xs font-medium text-emerald-400">
                  {formatLKR(target)}
                </p>
              )}
            </div>

            {/* Timeframe */}
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Calendar className="h-4 w-4 text-emerald-400" />
                Timeframe (Days)
              </label>
              <p className="mb-2 text-xs text-slate-500">
                How many days to spread your savings across (7–365)
              </p>
              <input
                type="number"
                min={7}
                max={365}
                placeholder="100"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Minimum Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Minimum tile Amount (LKR)
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="number"
                  min="1"
                  required
                  value={minBase}
                  onChange={(e) => setMinBase(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-3 pl-11 pr-4 text-white outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                The smallest possible daily savings amount
              </p>
            </div>
          </div>

          {/* ── Validation warnings ─────────────────────── */}
          {validation.length > 0 && (
            <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              {validation.map((msg) => (
                <p
                  key={msg}
                  className="flex items-start gap-2 text-xs text-amber-300"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {msg}
                </p>
              ))}
            </div>
          )}

          {/* ── Live Preview ────────────────────────────── */}
          {preview && (
            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Live Preview
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Your grid will have</span>
                  <span className="font-semibold text-white">{days} tiles</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Average daily saving</span>
                  <span className="font-semibold text-white">
                    {formatLKR(preview.avg)}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Minimum tile</span>
                  <span className="font-semibold text-emerald-400">
                    ~{formatLKR(preview.min)}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Maximum tile</span>
                  <span className="font-semibold text-amber-400">
                    ~{formatLKR(preview.max)}
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* ── Error ───────────────────────────────────── */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            </div>
          )}

          {/* ── Submit ──────────────────────────────────── */}
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                ✨ Generate My Magic Grid
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
