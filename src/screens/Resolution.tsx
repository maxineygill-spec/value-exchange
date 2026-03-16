import { motion } from 'framer-motion';
import { Value } from '../data/values';
import { NPCType } from '../data/npcs';
import ValueCard from '../components/ValueCard';

interface ResolutionProps {
  playerHand: Value[];
  npcHand: Value[];
  finalPlayerHand: Value[];
  finalNpcHand: Value[];
  npcProfile: NPCType;
  tradeOutcome: "success" | "partial" | "failed" | null;
  cardsLost: string[];
  cardsGained: string[];
  onContinue: () => void;
}

const Resolution = ({
  playerHand, npcHand, finalPlayerHand, finalNpcHand,
  npcProfile, tradeOutcome, cardsLost, cardsGained, onContinue,
}: ResolutionProps) => {
  const closingRemarks: Record<string, string> = {
    success: "That was a meaningful exchange. I think we both walked away with something that matters.",
    partial: "Not exactly what either of us planned, but sometimes the best trades are the unexpected ones.",
    failed: "We couldn't find common ground this time. But knowing what you wouldn't trade is valuable too.",
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">The Trade</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-8">
        {/* Player side */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-sans">Your Hand</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-sans">Before:</p>
              <div className="flex flex-wrap gap-2">
                {playerHand.map(v => (
                  <span key={v.name} className={`px-3 py-1.5 rounded-lg text-xs font-sans ${
                    cardsLost.includes(v.name)
                      ? 'bg-destructive/20 text-destructive line-through'
                      : 'bg-card-player text-card-foreground'
                  }`}>{v.name}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-sans">After:</p>
              <div className="flex flex-wrap gap-2">
                {finalPlayerHand.map(v => (
                  <span key={v.name} className={`px-3 py-1.5 rounded-lg text-xs font-sans ${
                    cardsGained.includes(v.name)
                      ? 'bg-primary/20 text-primary font-semibold'
                      : 'bg-card-player text-card-foreground'
                  }`}>{v.name}</span>
                ))}
              </div>
            </div>
            {cardsLost.length > 0 && (
              <p className="text-sm text-muted-foreground font-sans">
                Lost: <span className="text-destructive">{cardsLost.join(", ")}</span> →→→
              </p>
            )}
            {cardsGained.length > 0 && (
              <p className="text-sm text-muted-foreground font-sans">
                Gained: ←←← <span className="text-primary">{cardsGained.join(", ")}</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* NPC side */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-sans">{npcProfile.name}'s Hand</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-sans">Before:</p>
              <div className="flex flex-wrap gap-2">
                {npcHand.map(v => (
                  <span key={v.name} className="px-3 py-1.5 rounded-lg text-xs font-sans bg-card-npc text-card-foreground">{v.name}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-sans">After:</p>
              <div className="flex flex-wrap gap-2">
                {finalNpcHand.map(v => (
                  <span key={v.name} className="px-3 py-1.5 rounded-lg text-xs font-sans bg-card-npc text-card-foreground">{v.name}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {tradeOutcome === "failed" && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-center font-sans mb-4">
          You kept your original hand. So did {npcProfile.name}.
        </motion.p>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="max-w-md text-center mb-8">
        <p className="text-muted-foreground italic font-serif">
          "{closingRemarks[tradeOutcome || "failed"]}"
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-sans">— {npcProfile.name}</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="px-8 py-4 bg-primary text-primary-foreground font-sans font-semibold rounded-xl"
      >
        Reflect on what happened →
      </motion.button>
    </div>
  );
};

export default Resolution;
