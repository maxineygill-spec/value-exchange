import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Value } from '../data/values';
import { NPCType } from '../data/npcs';
import { NegotiationRound } from '../hooks/useGameState';
import ValueCard from '../components/ValueCard';
import NpcSpeechBubble from '../components/NpcSpeechBubble';

interface NegotiateProps {
  playerHand: Value[];
  playerTop2: string[];
  playerWants: Value[];
  npcProfile: NPCType;
  npcHand: Value[];
  npcTop2: string[];
  npcWants: Value[];
  evaluateOffer: (offeredCard: string, wantedCard: string, round: number) => {
    response: "accept" | "decline" | "counter" | "refuse";
    dialogue: string;
    counterCard?: string;
  };
  addNegotiationRound: (round: NegotiationRound) => void;
  resolveTradeSuccess: (playerGives: string, playerGets: string) => void;
  resolveTradePartial: (playerGives: string, counterCard: string) => void;
  resolveTradeFailed: () => void;
  onContinue: () => void;
}

const Negotiate = ({
  playerHand, playerTop2, playerWants,
  npcProfile, npcHand, npcTop2, npcWants,
  evaluateOffer, addNegotiationRound,
  resolveTradeSuccess, resolveTradePartial, resolveTradeFailed,
  onContinue,
}: NegotiateProps) => {
  const [round, setRound] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState<Value | null>(null);
  const [argument, setArgument] = useState("");
  const [currentDialogue, setCurrentDialogue] = useState(
    `You want ${playerWants[0]?.name}? Tell me — what are you offering, and why should I part with it?`
  );
  const [lastResponse, setLastResponse] = useState<"accept" | "decline" | "counter" | "refuse" | null>(null);
  const [lastCounterCard, setLastCounterCard] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [shakeOffer, setShakeOffer] = useState(false);
  const [error, setError] = useState("");

  const wantedCard = playerWants[0]?.name || "";

  const handleMakeOffer = useCallback(() => {
    if (!selectedOffer || !argument.trim()) {
      setError("Select a card to offer and explain your reasoning.");
      return;
    }
    setError("");

    const result = evaluateOffer(selectedOffer.name, wantedCard, round);

    const roundData: NegotiationRound = {
      round,
      playerOffered: selectedOffer.name,
      playerArgument: argument,
      npcResponse: result.response,
      npcDialogue: result.dialogue,
      counterCard: result.counterCard,
    };
    addNegotiationRound(roundData);

    setCurrentDialogue(result.dialogue);
    setLastResponse(result.response);

    if (result.response === "accept") {
      resolveTradeSuccess(selectedOffer.name, wantedCard);
      setIsResolved(true);
    } else if (result.response === "refuse" || result.response === "decline") {
      setShakeOffer(true);
      setTimeout(() => setShakeOffer(false), 400);

      if (round >= 3) {
        resolveTradeFailed();
        setIsResolved(true);
      } else {
        setRound(r => r + 1);
        setSelectedOffer(null);
        setArgument("");
      }
    } else if (result.response === "counter") {
      setLastCounterCard(result.counterCard || null);
    }
  }, [selectedOffer, argument, round, wantedCard, evaluateOffer, addNegotiationRound, resolveTradeSuccess, resolveTradeFailed]);

  const handleAcceptCounter = useCallback(() => {
    if (selectedOffer && lastCounterCard) {
      resolveTradePartial(selectedOffer.name, lastCounterCard);
      setIsResolved(true);
    }
  }, [selectedOffer, lastCounterCard, resolveTradePartial]);

  const handleRejectCounter = useCallback(() => {
    if (round >= 3) {
      resolveTradeFailed();
      setIsResolved(true);
    } else {
      setRound(r => r + 1);
      setSelectedOffer(null);
      setArgument("");
      setLastResponse(null);
      setLastCounterCard(null);
      setCurrentDialogue(`Alright, let's try again. What else do you have for me?`);
    }
  }, [round, resolveTradeFailed]);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Round indicator */}
        <div className="text-center mb-6">
          <span className="px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-sans tabular-nums">
            Round {round} of 3
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Player Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-sans">Your Hand</span>
              <h2 className="text-xl font-serif text-foreground">What you hold</h2>
              <p className="text-sm text-primary mt-1 font-sans">You want: {wantedCard}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {playerHand.map((v, i) => (
                <ValueCard
                  key={v.name}
                  value={v}
                  size="sm"
                  index={i}
                  isTop2={playerTop2.includes(v.name)}
                  isSelected={selectedOffer?.name === v.name}
                  onClick={!isResolved ? () => setSelectedOffer(v) : undefined}
                  showShake={shakeOffer && selectedOffer?.name === v.name}
                />
              ))}
            </div>
          </div>

          {/* Interaction Zone */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* NPC Speech */}
            <NpcSpeechBubble
              avatar={npcProfile.avatar}
              name={npcProfile.name}
              dialogue={currentDialogue}
              isRefusal={lastResponse === "refuse"}
            />

            {/* Outcome */}
            {isResolved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center p-6 rounded-2xl border ${
                  lastResponse === "accept"
                    ? 'bg-primary/10 border-primary/30'
                    : lastResponse === "counter" && lastCounterCard
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-destructive/10 border-destructive/30'
                }`}
              >
                <div className="text-3xl mb-2">
                  {lastResponse === "accept" ? "✅" : lastCounterCard ? "🤝" : "❌"}
                </div>
                <p className="text-foreground font-serif font-bold">
                  {lastResponse === "accept"
                    ? "Deal reached"
                    : lastCounterCard
                      ? "Partial deal"
                      : "No deal reached"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onContinue}
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-sans font-semibold rounded-xl"
                >
                  See the result →
                </motion.button>
              </motion.div>
            )}

            {/* Counter offer UI */}
            {!isResolved && lastResponse === "counter" && lastCounterCard && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-sm text-muted-foreground font-sans text-center">
                  {npcProfile.name} offered <span className="text-accent font-semibold">{lastCounterCard}</span> instead. Accept?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleAcceptCounter}
                    className="px-6 py-3 bg-primary text-primary-foreground font-sans font-semibold rounded-xl"
                  >
                    Accept counter
                  </button>
                  <button
                    onClick={handleRejectCounter}
                    className="px-6 py-3 bg-muted text-foreground font-sans rounded-xl"
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            )}

            {/* Player Input */}
            {!isResolved && lastResponse !== "counter" && (
              <div className="space-y-3">
                {selectedOffer && (
                  <p className="text-sm text-muted-foreground font-sans">
                    Offering: <span className="text-primary font-semibold">{selectedOffer.name}</span>
                  </p>
                )}
                <label className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Your Argument</label>
                <textarea
                  className="w-full bg-muted border border-border rounded-xl p-4 text-foreground text-sm font-sans focus:ring-2 ring-primary/50 outline-none transition-all resize-none"
                  placeholder="Why should they trade with you?"
                  rows={3}
                  value={argument}
                  onChange={(e) => setArgument(e.target.value)}
                />
                {error && <p className="text-destructive text-xs font-sans">{error}</p>}
                <button
                  disabled={!selectedOffer || !argument.trim()}
                  onClick={handleMakeOffer}
                  className="w-full py-4 bg-primary text-primary-foreground font-sans font-bold rounded-xl disabled:opacity-30 transition-all"
                >
                  Propose Trade
                </button>
              </div>
            )}
          </div>

          {/* NPC Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="lg:text-right">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-sans">{npcProfile.name}'s Hand</span>
              <h2 className="text-xl font-serif text-foreground">{npcProfile.description}</h2>
              {npcWants.length > 0 && (
                <p className="text-sm text-accent mt-1 font-sans">
                  They want: {npcWants.map(w => w.name).join(", ")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {npcHand.map((v, i) => (
                <ValueCard
                  key={v.name}
                  value={v}
                  size="sm"
                  index={i}
                  isPlayer={false}
                  isTop2={npcTop2.includes(v.name)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Negotiate;
