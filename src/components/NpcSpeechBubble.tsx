import { motion } from 'framer-motion';

interface NpcSpeechBubbleProps {
  avatar: string;
  name: string;
  dialogue: string;
  isRefusal?: boolean;
}

const NpcSpeechBubble = ({ avatar, name, dialogue, isRefusal }: NpcSpeechBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`relative rounded-2xl p-5 border ${
        isRefusal
          ? 'bg-destructive/10 border-destructive/30'
          : 'bg-accent/10 border-accent/20'
      }`}
    >
      <div className="absolute -top-3 left-5 text-2xl">{avatar}</div>
      <p className="text-xs text-muted-foreground mb-1 mt-1">{name}</p>
      <p className="text-foreground/90 italic font-serif leading-relaxed text-sm sm:text-base">
        "{dialogue}"
      </p>
    </motion.div>
  );
};

export default NpcSpeechBubble;
