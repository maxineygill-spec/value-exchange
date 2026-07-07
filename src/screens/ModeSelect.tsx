import { motion } from 'framer-motion';

interface ModeSelectProps {
  deckSize: 18 | 24;
  setDeckSize: (size: 18 | 24) => void;
  onStart: () => void;
}

const ModeSelect = ({ deckSize, setDeckSize, onStart }: ModeSelectProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-3">
          Value Cards
        </h1>
        <p className="text-muted-foreground text-lg font-sans">
          Discover what matters to you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-lg w-full">
        {([18, 24] as const).map((size, i) => (
          <motion.button
            key={size}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDeckSize(size)}
            className={`bg-card-player text-card-foreground rounded-2xl p-6 card-shadow text-left transition-all hover:card-shadow-hover ${
              deckSize === size ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="text-2xl mb-2">🃏</div>
            <h2 className="font-serif font-bold text-xl mb-2">{size} cards</h2>
            <p className="text-card-foreground/60 text-sm font-sans">
              {size === 18 ? 'Shorter game, focused choices' : 'Longer game, wider exploration'}
            </p>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onClick={onStart}
        className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-sans text-sm hover:opacity-90 transition-opacity"
      >
        Start
      </motion.button>
    </div>
  );
};

export default ModeSelect;
