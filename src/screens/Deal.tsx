import { motion } from 'framer-motion';
import { Value } from '../data/values';
import ValueCard from '../components/ValueCard';

interface DealProps {
  playerHand: Value[];
  onContinue: () => void;
}

const Deal = ({ playerHand, onContinue }: DealProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
          Your Hand
        </h1>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-2xl">
        {playerHand.map((value, i) => (
          <ValueCard key={value.name} value={value} size="md" index={i} />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: playerHand.length * 0.08 + 0.3 }}
        className="text-muted-foreground text-center max-w-md mb-8 font-sans"
      >
        These values have been randomly dealt to you. Take a moment to look over them.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: playerHand.length * 0.08 + 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="px-8 py-4 bg-primary text-primary-foreground font-sans font-semibold rounded-xl"
      >
        Continue →
      </motion.button>
    </div>
  );
};

export default Deal;
