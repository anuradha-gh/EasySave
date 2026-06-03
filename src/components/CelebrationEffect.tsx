import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationEffectProps {
  trigger: boolean;
  intensity: 'low' | 'medium' | 'high';
}

export default function CelebrationEffect({
  trigger,
  intensity,
}: CelebrationEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    const colors = ['#10b981', '#f59e0b', '#14b8a6', '#ffffff'];

    if (intensity === 'low') {
      confetti({
        particleCount: 50,
        spread: 60,
        colors,
        origin: { y: 0.7 },
      });
    } else if (intensity === 'medium') {
      confetti({
        particleCount: 150,
        spread: 100,
        colors,
        origin: { y: 0.6 },
      });
    } else {
      // Multiple bursts for high intensity
      confetti({
        particleCount: 150,
        angle: 60,
        spread: 80,
        colors,
        origin: { x: 0, y: 0.65 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 120,
          spread: 80,
          colors,
          origin: { x: 1, y: 0.65 },
        });
      }, 250);
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 120,
          colors,
          origin: { y: 0.5 },
        });
      }, 400);
    }
  }, [trigger, intensity]);

  return null;
}
