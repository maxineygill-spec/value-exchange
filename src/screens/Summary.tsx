import { motion } from 'framer-motion';
import { Value } from '../data/values';
import { PartnerDisplay } from '../hooks/useGameState';
import { DebriefAnswers, TradeRecord } from '../hooks/useGameState';

interface SummaryProps {
  dealtPlayerHand: Value[];
  finalPlayerHand: Value[];
  finalTop: string[];
  topN: number;
  partnerProfiles: PartnerDisplay[];
  trades: TradeRecord[];
  debriefAnswers: DebriefAnswers;
  onExport: () => void;
  onPlayAgain: () => void;
}

const Summary = ({
  dealtPlayerHand, finalPlayerHand, finalTop, topN,
  partnerProfiles, trades, debriefAnswers, onExport, onPlayAgain,
}: SummaryProps) => {
  const successful = trades.filter((t) => t.accepted);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <div className="bg-muted border border-border rounded-2xl p-6 sm:p-8 mb-10">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Your Values Session</h1>

          <div className="space-y-4 text-sm font-sans">
            <div>
              <span className="text-muted-foreground">Started with:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {dealtPlayerHand.map((v) => (
                  <span key={v.name} className="px-2 py-1 rounded text-xs bg-background text-foreground">{v.name}</span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Ended with{topN ? ` (top ${topN} starred)` : ""}:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {finalPlayerHand.map((v) => (
                  <span key={v.name} className={`px-2 py-1 rounded text-xs ${
                    finalTop.includes(v.name) ? 'bg-primary/20 text-primary font-semibold' : 'bg-background text-foreground'
                  }`}>{v.name}{finalTop.includes(v.name) ? ' ★' : ''}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">Trades:</span>
              <span>{successful.length} completed across {trades.length} offers</span>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground">Partners: </span>
              <span>
                {partnerProfiles.map((p) => `${p.avatar} ${p.name}`).join("  ·  ")}
              </span>
            </div>
          </div>
        </div>

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
              <p className="text-muted-foreground">Learned about partners:</p>
              <p className="text-foreground">{debriefAnswers.learnedAboutPartner}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Hidden common ground:</p>
              <p className="text-foreground">{debriefAnswers.hiddenCommonGround}</p>
            </div>
          </div>
        </div>

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
