import { useState } from 'react';
import { motion } from 'framer-motion';
import { Value, ALL_VALUES } from '../data/values';
import ValueCard from '../components/ValueCard';

interface WantProps {
  playerHand: Value[];
  playerTop2: string[];
  deckSize: 18 | 24;
  playerWants: Value[];
  setPlayerWants: (wants: Value[]) => void;
  playerWantReason: string;
  setPlayerWantReason: (reason: string) => void;
  onContinue: () => void;
}

const Want = ({ playerHand, playerTop2, deckSize, playerWants, setPlayerWants, playerWantReason, setPlayerWantReason, onContinue }: WantProps) => {
  const [error, setError] = useState("");
  const playerNames = playerHand.map(v => v.name);
  const pool = deckSize === 18 ? ALL_VALUES.slice(0, 18) : ALL_VALUES;
  const available = pool.filter(v => !playerNames.includes(v.name));

  const toggleWant = (value: Value) => {
    if (playerWants.find(w => w.name === value.name)) {
      setPlayerWants(playerWants.filter(w => w.name !== value.name));
    } else if (playerWants.length < 2) {
      setPlayerWants([...playerWants, value]);
    }
  };

  const handleContinue = () => {
    if (playerWants.length === 0) {
      setError("Pick at least one value you'd want to trade for.");
      return;
    }
    if (!playerWantReason.trim()) {
      setError("Tell us why you want this value — it's part of the exercise.");
      return;
    }
    setError("");
    onContinue();
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">What do you want?</h1>
      </motion.div>

      {/* Player hand */}
      <div className="mb-8 w-full max-w-3xl">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-sans">Your hand</h2>
        <div className="flex flex-wrap gap-3">
          {playerHand.map((v, i) => (
            <ValueCard key={v.name} value={v} size="sm" index={i} isTop2={playerTop2.includes(v.name)} />
          ))}
        </div>
      </div>

      {/* Available cards */}
      <div className="mb-6 w-full max-w-3xl">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-sans">Cards you weren't dealt</h2>
        <p className="text-muted-foreground text-sm mb-3 font-sans">Pick up to 2 values you'd want to trade for</p>
        <div className="flex flex-wrap gap-3">
          {available.map((v, i) => (
            <ValueCard
              key={v.name}
              value={v}
              size="sm"
              index={i}
              isDimmed={!playerWants.find(w => w.name === v.name)}
              isSelected={!!playerWants.find(w => w.name === v.name)}
              onClick={() => toggleWant(v)}
            />
          ))}
        </div>
      </div>

      {playerWants.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mb-8">
          <label className="block text-xs text-muted-foreground uppercase tracking-widest mb-2 font-sans">
            Why do you want {playerWants.map(w => w.name).join(" & ")}?
          </label>
          <textarea
            className="w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm font-sans focus:ring-2 ring-primary/50 outline-none transition-all resize-none"
            placeholder="What draws you to these ones?"
            rows={3}
            value={playerWantReason}
            onChange={(e) => setPlayerWantReason(e.target.value)}
          />
        </motion.div>
      )}

      {error && <p className="text-destructive text-sm mb-4 font-sans">{error}</p>}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContinue}
        className="px-8 py-4 bg-primary text-primary-foreground font-sans font-semibold rounded-xl transition-all"
      >
        See who you're trading with →
      </motion.button>
    </div>
  );
};

export default Want;
