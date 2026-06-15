import { motion } from 'framer-motion';
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
}: ValueCardProps) => {
  const sizeClasses = {
    sm: "w-28 h-36 p-3 sm:w-32 sm:h-44",
    md: "w-36 h-48 p-4 sm:w-44 sm:h-56",
    lg: "w-44 h-56 p-5 sm:w-48 sm:h-64",
  };

  if (isFaceDown) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`${sizeClasses[size]} rounded-2xl bg-muted border border-border flex items-center justify-center`}
      >
        <span className="text-2xl opacity-30">?</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={onClick ? { y: -5, transition: { duration: 0.2 } } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        relative flex flex-col justify-between rounded-2xl transition-shadow duration-300 select-none
        ${sizeClasses[size]}
        ${isPlayer ? 'bg-card-player text-card-foreground' : 'bg-card-npc text-card-foreground'}
        ${isTop2
          ? 'ring-4 ring-primary/50 glow-gold scale-105 z-10'
          : isSelected
            ? 'ring-2 ring-primary card-shadow-hover'
            : 'card-shadow'}
        ${isDimmed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${showShake ? 'animate-shake' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-serif font-bold leading-tight ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'}`}>
          {value.name}
        </h3>
        {isTop2 && <span className="text-primary text-lg">★</span>}
      </div>
      <p className={`font-sans leading-relaxed ${isPlayer ? 'text-card-foreground/60' : 'text-card-foreground/60'} ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
        {value.definition}
      </p>
      {/* Paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] rounded-2xl bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]" />
    </motion.div>
  );
};

export default ValueCard;
