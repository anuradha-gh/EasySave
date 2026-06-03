import { useState } from 'react';
import { Check, Star } from 'lucide-react';

interface TileProps {
  amount: number;
  index: number;
  isChecked: boolean;
  isHighValue: boolean;
  onToggle: (index: number) => void;
}

export default function Tile({
  amount,
  index,
  isChecked,
  isHighValue,
  onToggle,
}: TileProps) {
  const [clicking, setClicking] = useState(false);

  const handleClick = () => {
    setClicking(true);
    onToggle(index);
    setTimeout(() => setClicking(false), 150);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative min-h-[80px] rounded-xl border-2 cursor-pointer
        flex flex-col items-center justify-center gap-1 p-3
        transition-all duration-200 ease-out select-none
        ${clicking ? 'scale-95' : 'hover:scale-105 hover:shadow-lg'}
        ${
          isChecked
            ? 'bg-emerald-500 border-emerald-600 shadow-emerald-500/20 shadow-md'
            : isHighValue
              ? 'bg-white border-amber-400 hover:border-amber-500 hover:shadow-amber-200/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-slate-200/30'
        }
      `}
      aria-label={`Tile #${index + 1}: Rs. ${amount.toLocaleString()} — ${isChecked ? 'checked' : 'unchecked'}`}
    >
      {/* Tile Number */}
      <span
        className={`absolute top-1.5 left-2.5 text-[10px] font-semibold ${
          isChecked ? 'text-emerald-100/70' : 'text-slate-400'
        }`}
      >
        #{index + 1}
      </span>

      {/* High Value Badge */}
      {isHighValue && !isChecked && (
        <span className="absolute top-1.5 right-2 text-amber-500">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
        </span>
      )}

      {/* Checkmark Overlay */}
      {isChecked && (
        <div className="absolute top-1.5 right-2">
          <Check className="w-4 h-4 text-white/80" strokeWidth={3} />
        </div>
      )}

      {/* Amount */}
      <span
        className={`text-sm sm:text-base font-bold leading-tight ${
          isChecked
            ? 'text-white line-through decoration-white/50 decoration-2'
            : 'text-slate-800'
        }`}
      >
        Rs. {amount.toLocaleString()}
      </span>

      {/* Subtle label */}
      {isChecked && (
        <span className="text-[10px] text-emerald-100/60 font-medium">
          Saved!
        </span>
      )}
    </button>
  );
}
