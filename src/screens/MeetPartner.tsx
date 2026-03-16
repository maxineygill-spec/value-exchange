import { motion } from 'framer-motion';
import { NPCType } from '../data/npcs';
import { Value } from '../data/values';
import ValueCard from '../components/ValueCard';

interface MeetPartnerProps {
  npcProfile: NPCType;
  npcHand: Value[];
  onContinue: () => void;
}

const MeetPartner = ({ npcProfile, npcHand, onContinue }: MeetPartnerProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="text-center mb-10"
      >
        <div className="text-6xl mb-4">{npcProfile.avatar}</div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
          Meet {npcProfile.name}
        </h1>
        <p className="text-muted-foreground font-sans text-lg">
          {npcProfile.description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <p className="text-muted-foreground text-center font-sans mb-4">
          They've been dealt their own hand...
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {npcHand.map((v, i) => (
            <ValueCard key={v.name} value={v} size="sm" index={i} isFaceDown />
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-muted-foreground text-center font-sans mb-8 max-w-md"
      >
        They also have values they're holding onto — and some they want.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="px-8 py-4 bg-primary text-primary-foreground font-sans font-semibold rounded-xl"
      >
        Start negotiating →
      </motion.button>
    </div>
  );
};

export default MeetPartner;
