import { useNavigate } from 'react-router-dom';
import {
  Target,
  Grid3x3,
  PartyPopper,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Floating decorative element data                                   */
/* ------------------------------------------------------------------ */
const floatingItems = [
  { emoji: '💰', size: 40, top: '12%', left: '8%', delay: 0, duration: 6 },
  { emoji: '✨', size: 28, top: '22%', left: '85%', delay: 1.2, duration: 5 },
  { emoji: '🪙', size: 36, top: '60%', left: '5%', delay: 2.4, duration: 7 },
  { emoji: '💎', size: 32, top: '70%', left: '90%', delay: 0.8, duration: 5.5 },
  { emoji: '⭐', size: 24, top: '35%', left: '92%', delay: 3, duration: 6.5 },
  { emoji: '🌟', size: 30, top: '80%', left: '15%', delay: 1.8, duration: 5.8 },
  { emoji: '💰', size: 26, top: '45%', left: '3%', delay: 3.5, duration: 6.2 },
  { emoji: '✨', size: 22, top: '15%', left: '75%', delay: 0.5, duration: 7.2 },
];

/* ------------------------------------------------------------------ */
/*  Steps data                                                         */
/* ------------------------------------------------------------------ */
const steps = [
  {
    icon: Target,
    title: 'Set Your Goal',
    description: 'Choose your savings target and timeframe',
    step: 1,
  },
  {
    icon: Grid3x3,
    title: 'Get Your Magic Grid',
    description:
      'We generate a unique grid of daily amounts that sum exactly to your goal',
    step: 2,
  },
  {
    icon: PartyPopper,
    title: 'Save & Celebrate',
    description:
      'Pick tiles you can afford, check them off, and watch the magic happen',
    step: 3,
  },
];

/* ------------------------------------------------------------------ */
/*  Features data                                                      */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Zap,
    title: 'Flexible Savings',
    description: 'Save any amount, any day. No fixed schedule.',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Visual progress bar and stats keep you motivated.',
  },
  {
    icon: Shield,
    title: 'Quick Wins',
    description: 'Find low-amount tiles on tough days.',
  },
  {
    icon: Sparkles,
    title: 'Celebrate Wins',
    description: 'Confetti and animations when you hit milestones.',
  },
];

/* ================================================================== */
/*  LandingPage Component                                              */
/* ================================================================== */
export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-[Inter,sans-serif]">
      {/* ---------------------------------------------------------- */}
      {/*  Keyframe animations (injected once)                       */}
      {/* ---------------------------------------------------------- */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50%      { transform: translateY(-30px) rotate(12deg); opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
      `}</style>

      {/* ========================================================== */}
      {/*  HERO SECTION                                               */}
      {/* ========================================================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900" />

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
            animation: 'pulse-slow 4s ease-in-out infinite',
          }}
        />

        {/* Floating decorative items */}
        {floatingItems.map((item, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none"
            style={{
              top: item.top,
              left: item.left,
              fontSize: item.size,
              animation: `float ${item.duration}s ease-in-out ${item.delay}s infinite`,
            }}
            aria-hidden="true"
          >
            {item.emoji}
          </span>
        ))}

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Smart Micro-Savings</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Turn Small Savings
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Into Big Dreams
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
            The magic grid that makes saving effortless. Pick any amount, any
            day — watch your goal come alive.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg shadow-lg shadow-emerald-600/25 transition-all duration-300 cursor-pointer hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={scrollToFeatures}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/20 hover:border-emerald-400/60 text-white font-semibold text-lg transition-all duration-300 cursor-pointer hover:bg-white/5 hover:-translate-y-0.5"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* ========================================================== */}
      {/*  HOW IT WORKS                                               */}
      {/* ========================================================== */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Three simple steps to start your savings journey
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div
                key={s.step}
                className="group relative rounded-2xl p-8 text-center bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20"
              >
                {/* Step number */}
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  {s.step}
                </span>

                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-600/15 flex items-center justify-center mb-6 group-hover:bg-emerald-600/25 transition-colors duration-300">
                  <s.icon className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/*  FEATURES                                                   */}
      {/* ========================================================== */}
      <section id="features" className="relative py-24 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Powerful features to keep your savings on track
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl p-8 bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/10"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600/15 flex items-center justify-center mb-5 group-hover:bg-emerald-600/25 transition-colors duration-300">
                  <f.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/*  FOOTER                                                     */}
      {/* ========================================================== */}
      <footer className="py-10 text-center border-t border-slate-800">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()}{' '}
          <span className="text-emerald-400 font-semibold">EasySave</span>. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
