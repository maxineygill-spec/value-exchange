import { useState } from 'react';
import { motion } from 'framer-motion';
import { Value } from '../data/values';
import ValueCard from '../components/ValueCard';

interface SortProps {
  playerHand: Value[];
  topN: number;
  finalTop: string[];
  toggleTop: (name: string) => void;
  finalTopReason: string;
  setFinalTopReason: (reason: string) => void;
  onContinue: () => void;
}

const Sort = ({
  playerHand, topN, finalTop, toggleTop, finalTopReason, setFinalTopReason, onContinue,
}: SortProps) => {
  const [shakeCard, setShakeCard] = useState<string | null>(null);

  const handleToggle = (name: string) => {
    if (!finalTop.includes(name) && finalTop.length >= topN) {
      setShakeCard(name);
      setTimeout(() => setShakeCard(null), 400);
      return;
    }
    toggleTop(name);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
          Now, which matter most?
        </h1>
        <p className="text-muted-foreground font-sans">
          From the hand you ended up with after trading, choose your top {topN}.
        </p>
      </motion.div>

      <div className="mb-4">
        <span className={`px-4 py-1.5 rounded-full text-sm font-sans tabular-nums ${
          finalTop.length === topN ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {finalTop.length}/{topN} selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-2xl">
        {playerHand.map((value, i) => (
          <ValueCard
            key={value.name}
            value={value}
            size="md"
            index={i}
            isTop2={finalTop.includes(value.name)}
            isSelected={finalTop.includes(value.name)}
            onClick={() => handleToggle(value.name)}
            showShake={shakeCard === value.name}
          />
        ))}
      </div>

      <div className="w-full max-w-md mb-8">
        <label className="block text-xs text-muted-foreground uppercase tracking-widest mb-2 font-sans">
          Why these? (optional)
        </label>
        <textarea
          className="w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm font-sans focus:ring-2 ring-primary/50 outline-none transition-all resize-none"
          placeholder="What makes these the ones you'd keep?"
          rows={2}
          value={finalTopReason}
          onChange={(e) => setFinalTopReason(e.target.value)}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={finalTop.length < topN}
        onClick={onContinue}
        className="px-8 py-4 bg-primary text-primary-foreground font-sans font-semibold rounded-xl disabled:opacity-30 transition-all"
      >
        Lock in my top {topN} →
      </motion.button>
    </div>
  );
};

export default Sort;
