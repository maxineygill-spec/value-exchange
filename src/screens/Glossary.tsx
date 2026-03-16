import { motion } from 'framer-motion';
import { ALL_VALUES } from '../data/values';
import ValueCard from '../components/ValueCard';

interface GlossaryProps {
  deckSize: 18 | 24;
  onContinue: () => void;
}

const Glossary = ({ deckSize, onContinue }: GlossaryProps) => {
  const values = deckSize === 18 ? ALL_VALUES.slice(0, 18) : ALL_VALUES;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 max-w-lg"
      >
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
          The Values at Play
        </h1>
        <p className="text-muted-foreground font-sans">
          You'll be working with these {deckSize} values today.
          Take a moment to read through them.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10 max-w-5xl">
        {values.map((value, i) => (
          <ValueCard key={value.name} value={value} size="sm" index={i} />
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="px-8 py-4 bg-primary text-primary-foreground font-sans font-semibold rounded-xl transition-colors"
      >
        I'm ready →
      </motion.button>
    </div>
  );
};

export default Glossary;
