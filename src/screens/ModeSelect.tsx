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
          What matters most to you?
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mb-10 max-w-lg w-full"
      >
        <p className="text-muted-foreground text-sm font-sans mb-4 text-center">
          Choose your deck size
        </p>
        <div className="grid grid-cols-2 gap-6">
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDeckSize(18)}
            className={`rounded-2xl p-6 card-shadow text-left transition-all ${
              deckSize === 18
                ? 'bg-card-player text-card-foreground ring-2 ring-primary'
                : 'bg-card-player/70 text-card-foreground hover:card-shadow-hover'
            }`}
          >
            <div className="text-2xl mb-2">🃏</div>
            <h2 className="font-serif font-bold text-xl mb-2">18 cards</h2>
            <p className="text-card-foreground/60 text-sm font-sans">
              A shorter, more focused round.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDeckSize(24)}
            className={`rounded-2xl p-6 card-shadow text-left transition-all ${
              deckSize === 24
                ? 'bg-card-player text-card-foreground ring-2 ring-primary'
                : 'bg-card-player/70 text-card-foreground hover:card-shadow-hover'
            }`}
          >
            <div className="text-2xl mb-2">🎴</div>
            <h2 className="font-serif font-bold text-xl mb-2">24 cards</h2>
            <p className="text-card-foreground/60 text-sm font-sans">
              A wider range to explore.
            </p>
          </motion.button>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-sans font-medium"
      >
        Start
      </motion.button>
    </div>
  );
};

export default ModeSelect;
