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
          A negotiation game about what matters
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-lg w-full">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="bg-card-player text-card-foreground rounded-2xl p-6 card-shadow text-left transition-shadow hover:card-shadow-hover"
        >
          <div className="text-2xl mb-2">🃏</div>
          <h2 className="font-serif font-bold text-xl mb-2">Solo</h2>
          <p className="text-card-foreground/60 text-sm font-sans">
            Play against an NPC partner
          </p>
          <p className="text-card-foreground/40 text-xs font-sans mt-2">
            Good for: exploring your values alone
          </p>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="bg-muted rounded-2xl p-6 text-left opacity-50 cursor-not-allowed"
        >
          <div className="text-2xl mb-2">👥</div>
          <h2 className="font-serif font-bold text-xl mb-2 text-foreground">With Someone</h2>
          <p className="text-muted-foreground text-sm font-sans">
            Share a code with a real person
          </p>
          <p className="text-muted-foreground/60 text-xs font-sans mt-2">
            Multiplayer — coming soon
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex items-center gap-6"
      >
        <span className="text-muted-foreground text-sm font-sans">Deck size:</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDeckSize(18)}
            className={`px-4 py-2 rounded-lg text-sm font-sans transition-colors ${
              deckSize === 18
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            18 cards
          </button>
          <button
            onClick={() => setDeckSize(24)}
            className={`px-4 py-2 rounded-lg text-sm font-sans transition-colors ${
              deckSize === 24
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            24 cards
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ModeSelect;
