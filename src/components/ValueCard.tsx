import { motion } from 'framer-motion';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { Value } from '../data/values';

interface ValueCardProps {
  value: Value;
  isPlayer?: boolean;
  isSelected?: boolean;
  isTop2?: boolean;
  isDimmed?: boolean;
  isFaceDown?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  index?: number;
  showShake?: boolean;
  showCheckmark?: boolean;
}

const ValueCard = ({
  value,
  isPlayer = true,
  isSelected,
  isTop2,
  isDimmed,
  isFaceDown,
  onClick,
  size = 'md',
  index = 0,
  showShake,
  showCheckmark,
}: ValueCardProps) => {
  const [flipped, setFlipped] = useState(false);

  const sizeClasses = {
    sm: 'w-28 h-28 p-2.5 text-xs sm:w-32 sm:h-32',
    md: 'w-32 h-32 p-3 text-sm sm:w-36 sm:h-36',
    lg: 'w-36 h-36 p-3.5 text-base sm:w-40 sm:h-40',
  };

  const titleSize = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  };

  if (isFaceDown) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={`${sizeClasses[size]} rounded-xl bg-muted border border-border flex items-center justify-center`}
      >
        <span className="text-xl opacity-30">?</span>
      </motion.div>
    );
  }

  const dimmed = isDimmed;

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlipped((f) => !f);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`relative ${sizeClasses[size]} [perspective:1000px] ${showShake ? 'animate-shake' : ''}`}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full"
      >
        {/* FRONT */}
        <div
          onClick={dimmed ? undefined : onClick}
          className={`
            absolute inset-0 [backface-visibility:hidden]
            flex flex-col items-center justify-center rounded-xl select-none p-2
            ${isPlayer ? 'bg-card-player text-card-foreground' : 'bg-card-npc text-card-foreground'}
            ${isSelected ? 'ring-2 ring-primary brightness-110 glow-gold' : isTop2 ? 'ring-4 ring-primary/50 glow-gold' : 'card-shadow'}
            ${dimmed ? 'opacity-40 grayscale-[0.5] cursor-not-allowed' : ''}
            ${onClick && !dimmed ? 'cursor-pointer hover:brightness-110 transition' : ''}
          `}
        >
          {showCheckmark && (
            <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center shadow z-20">
              ✓
            </div>
          )}
          <h3 className={`font-serif font-bold leading-tight text-center ${titleSize[size]}`}>
            {value.name}
          </h3>
          <button
            onClick={handleFlip}
            aria-label="Show definition"
            className="absolute bottom-1 right-1 p-1 rounded-full hover:bg-black/10 transition-transform hover:scale-110"
          >
            <Info className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* BACK */}
        <div
          onClick={handleFlip}
          className={`
            absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]
            flex flex-col items-center justify-center rounded-xl cursor-pointer p-4
            overflow-hidden
            ${isPlayer ? 'bg-card-player text-card-foreground' : 'bg-card-npc text-card-foreground'}
            card-shadow
          `}
        >
          <p className="font-sans leading-snug text-center text-card-foreground/90 text-xs sm:text-sm max-h-full overflow-y-auto">
            {value.definition}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ValueCard;
