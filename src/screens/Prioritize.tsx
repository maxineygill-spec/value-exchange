import { useState } from 'react';
import { motion } from 'framer-motion';
import { Value } from '../data/values';
import ValueCard from '../components/ValueCard';

interface PrioritizeProps {
  playerHand: Value[];
  playerTop2: string[];
  setPlayerTop2: (top2: string[]) => void;
  playerTop2Reason: string;
  setPlayerTop2Reason: (reason: string) => void;
  onContinue: () => void;
}

const Prioritize = ({ playerHand, playerTop2, setPlayerTop2, playerTop2Reason, setPlayerTop2Reason, onContinue }: PrioritizeProps) => {
  const [shakeCard, setShakeCard] = useState<string | null>(null);

  const toggleCard = (name: string) => {
    if (playerTop2.includes(name)) {
      setPlayerTop2(playerTop2.filter(n => n !== name));
    } else if (playerTop2.length < 2) {
      setPlayerTop2([...playerTop2, name]);
    } else {
      setShakeCard(name);
      setTimeout(() => setShakeCard(null), 400);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
          Which matter most to you?
        </h1>
        <p className="text-muted-foreground font-sans">Select your top 2</p>
      </motion.div>

      <div className="mb-4">
        <span className={`px-4 py-1.5 rounded-full text-sm font-sans tabular-nums ${
          playerTop2.length === 2 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {playerTop2.length}/2 selected
        </span>
      </div>

      {playerTop2.length >= 2 && shakeCard && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-destructive text-sm mb-4 font-sans"
        >
          You can only pick 2 — deselect one first
        </motion.p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-2xl">
        {playerHand.map((value, i) => (
          <ValueCard
            key={value.name}
            value={value}
            size="md"
            index={i}
            isTop2={playerTop2.includes(value.name)}
            isSelected={playerTop2.includes(value.name)}
            onClick={() => toggleCard(value.name)}
            showShake={shakeCard === value.name}
          />
        ))}
      </div>

      <div className="w-full max-w-md mb-8">
        <label className="block text-xs text-muted-foreground uppercase tracking-widest mb-2 font-sans">
          Why these two? (optional)
        </label>
        <textarea
          className="w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm font-sans focus:ring-2 ring-primary/50 outline-none transition-all resize-none"
          placeholder="What makes these feel most like you?"
          rows={2}
          value={playerTop2Reason}
          onChange={(e) => setPlayerTop2Reason(e.target.value)}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={playerTop2.length < 2}
        onClick={onContinue}
        className="px-8 py-4 bg-primary text-primary-foreground font-sans font-semibold rounded-xl disabled:opacity-30 transition-all"
      >
        Lock in my top 2 →
      </motion.button>
    </div>
  );
};

export default Prioritize;
