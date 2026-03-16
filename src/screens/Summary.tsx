import { motion } from 'framer-motion';
import { Value } from '../data/values';
import { NPCType } from '../data/npcs';
import { DebriefAnswers } from '../hooks/useGameState';

interface SummaryProps {
  playerHand: Value[];
  playerTop2: string[];
  playerWants: Value[];
  finalPlayerHand: Value[];
  npcProfile: NPCType;
  npcTop2: string[];
  tradeOutcome: "success" | "partial" | "failed" | null;
  debriefAnswers: DebriefAnswers;
  onExport: () => void;
  onPlayAgain: () => void;
}

const Summary = ({
  playerHand, playerTop2, playerWants, finalPlayerHand,
  npcProfile, npcTop2, tradeOutcome, debriefAnswers,
  onExport, onPlayAgain,
}: SummaryProps) => {
  const outcomeIcon = tradeOutcome === "success" ? "✅" : tradeOutcome === "partial" ? "🤝" : "❌";
  const outcomeLabel = tradeOutcome === "success" ? "Deal reached" : tradeOutcome === "partial" ? "Partial deal" : "No deal";

  // Find common ground
  const playerValueNames = finalPlayerHand.map(v => v.name);
  const commonGround = playerValueNames.filter(n => npcProfile.coreValues.includes(n) || npcTop2.includes(n));

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        {/* Summary Card */}
        <div className="bg-muted border border-border rounded-2xl p-6 sm:p-8 mb-8">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Your Values Session</h1>

          <div className="space-y-4 text-sm font-sans">
            <div>
              <span className="text-muted-foreground">Started with:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {playerHand.map(v => (
                  <span key={v.name} className={`px-2 py-1 rounded text-xs ${
                    playerTop2.includes(v.name) ? 'bg-primary/20 text-primary font-semibold' : 'bg-background text-foreground'
                  }`}>{v.name}{playerTop2.includes(v.name) ? ' ★' : ''}</span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Wanted:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {playerWants.map(v => (
                  <span key={v.name} className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">{v.name}</span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Final hand:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {finalPlayerHand.map(v => (
                  <span key={v.name} className="px-2 py-1 rounded text-xs bg-background text-foreground">{v.name}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">Trade outcome:</span>
              <span>{outcomeIcon} {outcomeLabel}</span>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground">Partner: </span>
              <span>{npcProfile.avatar} {npcProfile.name} — {npcProfile.description}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {npcProfile.coreValues.map(v => (
                  <span key={v} className="px-2 py-1 rounded text-xs bg-accent/10 text-accent">{v}</span>
                ))}
              </div>
            </div>

            {commonGround.length > 0 && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground">Common ground:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {commonGround.map(v => (
                    <span key={v} className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">{v}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Debrief answers */}
        <div className="mb-8">
          <h2 className="text-lg font-serif font-bold text-foreground mb-4">What you reflected on</h2>
          <div className="space-y-3 text-sm font-sans">
            <div>
              <p className="text-muted-foreground">Hardest to give up:</p>
              <p className="text-foreground">{debriefAnswers.hardestToGiveUp} — {debriefAnswers.whyHardest}</p>
            </div>
            {debriefAnswers.didMindChange && debriefAnswers.whatShifted && (
              <div>
                <p className="text-muted-foreground">What shifted:</p>
                <p className="text-foreground">{debriefAnswers.whatShifted}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Learned about partner:</p>
              <p className="text-foreground">{debriefAnswers.learnedAboutPartner}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Hidden common ground:</p>
              <p className="text-foreground">{debriefAnswers.hiddenCommonGround}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExport}
            className="flex-1 py-4 bg-primary text-primary-foreground font-sans font-bold rounded-xl"
          >
            Download my data
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="flex-1 py-4 bg-muted text-foreground font-sans font-bold rounded-xl border border-border"
          >
            Play again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Summary;
