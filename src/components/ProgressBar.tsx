import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentPhase: number;
  totalPhases: number;
  phaseLabel: string;
}

const ProgressBar = ({ currentPhase, totalPhases, phaseLabel }: ProgressBarProps) => {
  const progress = ((currentPhase) / totalPhases) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-sans text-muted-foreground uppercase tracking-widest">
          {phaseLabel}
        </span>
        <span className="text-xs font-sans text-muted-foreground tabular-nums">
          {currentPhase} of {totalPhases}
        </span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
