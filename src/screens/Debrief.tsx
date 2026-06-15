import { useState } from 'react';
import { motion } from 'framer-motion';
import { Value } from '../data/values';
import { DebriefAnswers } from '../hooks/useGameState';

interface DebriefProps {
  dealtPlayerHand: Value[];
  debriefAnswers: DebriefAnswers;
  setDebriefAnswers: (answers: DebriefAnswers) => void;
  onContinue: () => void;
}

const Debrief = ({ dealtPlayerHand, debriefAnswers, setDebriefAnswers, onContinue }: DebriefProps) => {
  const [error, setError] = useState("");

  const update = (key: keyof DebriefAnswers, value: string | boolean) => {
    setDebriefAnswers({ ...debriefAnswers, [key]: value });
  };

  const handleSubmit = () => {
    const { hardestToGiveUp, whyHardest, learnedAboutPartner, hiddenCommonGround } = debriefAnswers;
    if (!hardestToGiveUp || !whyHardest.trim() || !learnedAboutPartner.trim() || !hiddenCommonGround.trim()) {
      setError("All questions are required. Take your time — this reflection matters.");
      return;
    }
    if (debriefAnswers.didMindChange && !debriefAnswers.whatShifted.trim()) {
      setError("Please share what shifted for you.");
      return;
    }
    setError("");
    onContinue();
  };

  const inputClass = "w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm font-sans focus:ring-2 ring-primary/50 outline-none transition-all resize-none";
  const labelClass = "block text-foreground font-sans font-medium mb-2 text-sm";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Reflect</h1>
        <p className="text-muted-foreground font-sans">The conversation matters as much as the cards.</p>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">
        {/* Q1 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className={labelClass}>Which card was hardest to give up?</label>
          <select
            value={debriefAnswers.hardestToGiveUp}
            onChange={(e) => update("hardestToGiveUp", e.target.value)}
            className={inputClass}
          >
            <option value="">Select a card...</option>
            {dealtPlayerHand.map(v => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
        </motion.div>

        {/* Q2 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className={labelClass}>Why was it hard to let go of?</label>
          <textarea
            className={inputClass}
            rows={3}
            value={debriefAnswers.whyHardest}
            onChange={(e) => update("whyHardest", e.target.value)}
          />
        </motion.div>

        {/* Q3 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <label className={labelClass}>Did the trading change what you wanted or valued?</label>
          <div className="flex gap-4">
            <button
              onClick={() => update("didMindChange", true)}
              className={`px-6 py-2 rounded-lg text-sm font-sans transition-colors ${
                debriefAnswers.didMindChange ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >Yes</button>
            <button
              onClick={() => update("didMindChange", false)}
              className={`px-6 py-2 rounded-lg text-sm font-sans transition-colors ${
                !debriefAnswers.didMindChange ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >No</button>
          </div>
        </motion.div>

        {/* Q4 conditional */}
        {debriefAnswers.didMindChange && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <label className={labelClass}>What shifted for you?</label>
            <textarea
              className={inputClass}
              rows={3}
              value={debriefAnswers.whatShifted}
              onChange={(e) => update("whatShifted", e.target.value)}
            />
          </motion.div>
        )}

        {/* Q5 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <label className={labelClass}>What did you learn about your partners' values?</label>
          <textarea
            className={inputClass}
            rows={3}
            value={debriefAnswers.learnedAboutPartner}
            onChange={(e) => update("learnedAboutPartner", e.target.value)}
          />
        </motion.div>

        {/* Q6 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <label className={labelClass}>Was there any hidden common ground you didn't expect?</label>
          <textarea
            className={inputClass}
            rows={3}
            value={debriefAnswers.hiddenCommonGround}
            onChange={(e) => update("hiddenCommonGround", e.target.value)}
          />
        </motion.div>

        {error && <p className="text-destructive text-sm font-sans">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full py-4 bg-primary text-primary-foreground font-sans font-bold rounded-xl"
        >
          See your summary →
        </motion.button>
      </div>
    </div>
  );
};

export default Debrief;
