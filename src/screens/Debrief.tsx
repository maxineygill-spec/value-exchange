import { motion } from 'framer-motion';
import { DebriefAnswers } from '../hooks/useGameState';

interface DebriefProps {
  selectableCards: string[];
  debriefAnswers: DebriefAnswers;
  setDebriefAnswers: (answers: DebriefAnswers) => void;
  onContinue: () => void;
}

const Debrief = ({ selectableCards, debriefAnswers, setDebriefAnswers, onContinue }: DebriefProps) => {
  const update = (key: keyof DebriefAnswers, value: string | boolean) => {
    setDebriefAnswers({ ...debriefAnswers, [key]: value });
  };

  const inputClass = "w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm font-sans focus:ring-2 ring-primary/50 outline-none transition-all resize-none";
  const labelClass = "block text-foreground font-sans font-medium mb-1 text-sm";
  const optionalHint = <p className="text-xs text-muted-foreground mb-2 font-sans">(optional)</p>;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Reflect</h1>
        <p className="text-muted-foreground font-sans">The conversation matters as much as the cards.</p>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className={labelClass}>Which card was hardest to give up?</label>
          {optionalHint}
          <select
            value={debriefAnswers.hardestToGiveUp}
            onChange={(e) => update("hardestToGiveUp", e.target.value)}
            className={inputClass}
          >
            <option value="">Select a card...</option>
            {selectableCards.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className={labelClass}>Why was it hard to let go of?</label>
          {optionalHint}
          <textarea
            className={inputClass}
            rows={3}
            value={debriefAnswers.whyHardest}
            onChange={(e) => update("whyHardest", e.target.value)}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <label className={labelClass}>Did the trading change what you wanted or valued?</label>
          {optionalHint}
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

        {debriefAnswers.didMindChange && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <label className={labelClass}>What shifted for you?</label>
            {optionalHint}
            <textarea
              className={inputClass}
              rows={3}
              value={debriefAnswers.whatShifted}
              onChange={(e) => update("whatShifted", e.target.value)}
            />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <label className={labelClass}>What did you learn about your partners' values?</label>
          {optionalHint}
          <textarea
            className={inputClass}
            rows={3}
            value={debriefAnswers.learnedAboutPartner}
            onChange={(e) => update("learnedAboutPartner", e.target.value)}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <label className={labelClass}>Was there any hidden common ground you didn't expect?</label>
          {optionalHint}
          <textarea
            className={inputClass}
            rows={3}
            value={debriefAnswers.hiddenCommonGround}
            onChange={(e) => update("hiddenCommonGround", e.target.value)}
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onContinue()}
          className="w-full py-4 bg-primary text-primary-foreground font-sans font-bold rounded-xl"
        >
          See your summary →
        </motion.button>
      </div>
    </div>
  );
};

export default Debrief;
