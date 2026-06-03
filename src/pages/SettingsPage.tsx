import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Target,
  Calendar,
  Trash2,
  RefreshCw,
  Save,
  AlertTriangle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getActiveGoal,
  deleteGoal,
  deleteUserData,
  updateDisplayName,
} from '../lib/db';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';

/** Format a number as "Rs. 1,234" */
function formatLKR(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK')}`;
}

/** Format a date nicely */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── State ──────────────────────────────────────────────── */
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name ?? user?.email ?? '',
  );
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [goalTarget, setGoalTarget] = useState<number | null>(null);
  const [goalDays, setGoalDays] = useState<number | null>(null);
  const [goalCreated, setGoalCreated] = useState<string | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Load goal info ─────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      setLoadingGoal(true);
      const activeGoal = await getActiveGoal(user!.id);
      if (cancelled) return;

      if (activeGoal) {
        setGoalTarget(activeGoal.target_amount);
        setGoalDays(activeGoal.total_days);
        setGoalCreated(activeGoal.created_at);
        setGoalId(activeGoal.id);
      }
      setLoadingGoal(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  /* ── Handlers ───────────────────────────────────────────── */
  const handleSaveName = useCallback(async () => {
    if (!user || !displayName.trim()) return;
    setSavingName(true);
    setNameSaved(false);
    try {
      await updateDisplayName(user.id, displayName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } finally {
      setSavingName(false);
    }
  }, [user, displayName]);

  const handleResetGrid = useCallback(async () => {
    if (!goalId) return;
    setResetting(true);
    try {
      await deleteGoal(goalId);
      navigate('/setup', { replace: true });
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  }, [goalId, navigate]);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUserData(user.id);
      await supabase.auth.signOut();
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }, [user]);

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Page title */}
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Settings
        </h1>

        {/* ── Profile Section ─────────────────────────── */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20">
              <User className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
              <p className="text-xs text-slate-500">
                Manage your display name
              </p>
            </div>
          </div>

          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Display Name
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              type="button"
              onClick={handleSaveName}
              disabled={savingName || !displayName.trim()}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
            >
              {savingName ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
          {nameSaved && (
            <p className="mt-2 text-xs font-medium text-emerald-400">
              ✓ Name updated successfully
            </p>
          )}
        </section>

        {/* ── Goal Info Section ───────────────────────── */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20">
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Current Goal
              </h2>
              <p className="text-xs text-slate-500">
                Your active savings goal details
              </p>
            </div>
          </div>

          {loadingGoal ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading goal info…
            </div>
          ) : goalTarget !== null ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Target */}
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Target className="h-3 w-3" />
                  Target
                </div>
                <p className="text-lg font-bold text-white">
                  {formatLKR(goalTarget)}
                </p>
              </div>

              {/* Days */}
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  Duration
                </div>
                <p className="text-lg font-bold text-white">
                  {goalDays} days
                </p>
              </div>

              {/* Created */}
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  Created
                </div>
                <p className="text-lg font-bold text-white">
                  {goalCreated ? formatDate(goalCreated) : '—'}
                </p>
              </div>
            </div>
          ) : (
            <p className="py-4 text-sm text-slate-500">
              No active goal found.{' '}
              <button
                type="button"
                onClick={() => navigate('/setup')}
                className="text-emerald-400 underline underline-offset-2 transition hover:text-emerald-300"
              >
                Create one now
              </button>
            </p>
          )}
        </section>

        {/* ── Danger Zone ─────────────────────────────── */}
        <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-300">
                Danger Zone
              </h2>
              <p className="text-xs text-red-400/60">
                These actions are irreversible
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Reset Grid */}
            <div className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-amber-300">
                  Reset Grid
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Delete your current goal and grid. You can create a new one
                  afterwards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                disabled={!goalId}
                className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-40"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Grid
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-300">
                  Delete Account
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Permanently delete all your data and sign out. This cannot be
                  undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Modals ────────────────────────────────────────── */}
      {showResetModal && (
        <ConfirmModal
          title="Reset your grid?"
          description="This will permanently delete your current savings goal and all progress. You'll be taken to create a new grid."
          confirmLabel={resetting ? 'Resetting…' : 'Yes, reset everything'}
          variant="warning"
          onConfirm={handleResetGrid}
          onCancel={() => setShowResetModal(false)}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete your account?"
          description="This will permanently delete all your data including goals, progress, and profile. You will be signed out immediately."
          confirmLabel={deleting ? 'Deleting…' : 'Yes, delete everything'}
          variant="danger"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
