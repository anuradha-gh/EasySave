import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/* ================================================================== */
/*  AuthPage Component                                                 */
/* ================================================================== */
export default function AuthPage() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();

  /* ---- local state ---- */
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---- helpers ---- */
  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
  };

  const validate = (): string | null => {
    if (mode === 'signup' && !displayName.trim()) return 'Display name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (mode === 'signup' && password !== confirmPassword)
      return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---- shared input styles ---- */
  const inputWrapperClasses =
    'flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all duration-300';

  const inputClasses =
    'flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm sm:text-base';

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif]">
      {/* ========================================================== */}
      {/*  LEFT DECORATIVE PANEL (hidden on mobile)                   */}
      {/* ========================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 items-center justify-center">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-3xl" />

        {/* Branding content */}
        <div className="relative z-10 max-w-md text-center px-10">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8">
            <Sparkles className="w-10 h-10 text-emerald-300" />
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            EasySave
          </h1>
          <p className="text-emerald-100/80 text-lg leading-relaxed">
            The magic grid that turns small daily savings into big dreams.
            Start your journey today.
          </p>

          {/* Decorative grid preview */}
          <div className="mt-12 grid grid-cols-5 gap-2 max-w-[220px] mx-auto">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg ${
                  [0, 3, 7, 11, 14].includes(i)
                    ? 'bg-emerald-400/40 border border-emerald-400/60'
                    : 'bg-white/10 border border-white/10'
                } transition-colors duration-300`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/*  RIGHT FORM PANEL                                           */}
      {/* ========================================================== */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile-only branding */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <span className="text-2xl font-extrabold text-white tracking-tight">
                EasySave
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {mode === 'signup'
                ? 'Start your savings journey today'
                : 'Log in to continue saving'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name (signup only) */}
            {mode === 'signup' && (
              <div className={inputWrapperClasses}>
                <User className="w-5 h-5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Display Name"
                  className={inputClasses}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div className={inputWrapperClasses}>
              <Mail className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                type="email"
                placeholder="Email address"
                className={inputClasses}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className={inputWrapperClasses}>
              <Lock className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className={inputClasses}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div className={inputWrapperClasses}>
                <Lock className="w-5 h-5 text-slate-500 shrink-0" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className={inputClasses}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label={
                    showConfirm ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base shadow-lg shadow-emerald-600/25 transition-all duration-300 cursor-pointer hover:shadow-emerald-500/40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Please wait…</span>
                </>
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-8 text-center text-slate-500 text-sm">
            {mode === 'signup'
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
            >
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
