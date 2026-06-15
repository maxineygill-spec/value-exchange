import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Value } from '../data/values';
import { NPCType } from '../data/npcs';
import { PartnerState } from '../lib/tradeEngine';
import { OfferOutcome } from '../hooks/useGameState';
import ValueCard from '../components/ValueCard';
import NpcSpeechBubble from '../components/NpcSpeechBubble';

interface TradeProps {
  playerHand: Value[];
  partners: PartnerState[];
  partnerProfiles: NPCType[];
  makeOffer: (partnerId: string, give: string, get: string) => OfferOutcome;
  canFinishTrading: boolean;
  onContinue: () => void;
}

const Trade = ({
  playerHand, partners, partnerProfiles, makeOffer, canFinishTrading, onContinue,
}: TradeProps) => {
  const [activeId, setActiveId] = useState(partners[0]?.id ?? "A");
  const [give, setGive] = useState<string | null>(null);
  const [get, setGet] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ accepted: boolean; dialogue: string; name: string } | null>(null);

  const activeIdx = partners.findIndex((p) => p.id === activeId);
  const partner = partners[activeIdx];
  const profile = partnerProfiles[activeIdx];

  // If a trade changed the hands, drop any now-invalid selection.
  useEffect(() => {
    if (give && !playerHand.some((v) => v.name === give)) setGive(null);
  }, [playerHand, give]);
  useEffect(() => {
    if (get && partner && !partner.hand.some((v) => v.name === get)) setGet(null);
  }, [partner, get]);

  const switchPartner = (id: string) => {
    setActiveId(id);
    setGet(null);
    setResult(null);
    setError("");
  };

  const lockedHere = partner?.lockedCards ?? [];
  const partnerDone = !partner || partner.exhausted;

  const handleOffer = () => {
    if (!give || !get) {
      setError("Pick one of your cards to offer and one of theirs to request.");
      return;
    }
    setError("");
    const outcome = makeOffer(activeId, give, get);
    if (!outcome.ok) {
      setError(outcome.reason ?? "That trade isn't allowed.");
      return;
    }
    setResult({ accepted: !!outcome.accepted, dialogue: outcome.dialogue ?? "", name: profile.name });
    setGet(null);
    if (outcome.accepted) setGive(null);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header + per-partner progress */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">Trade</h1>
          <p className="text-muted-foreground font-sans text-sm mb-4">
            Make trades until you've completed at least one with <em>each</em> partner. You can keep going after that.
          </p>
          <div className="flex items-center justify-center gap-3">
            {partners.map((p, i) => (
              <button
                key={p.id}
                onClick={() => switchPartner(p.id)}
                className={`px-4 py-2 rounded-full text-sm font-sans transition-colors border ${
                  activeId === p.id
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {partnerProfiles[i]?.avatar} {partnerProfiles[i]?.name}{" "}
                {p.successes > 0 ? "✓" : "○"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Your hand — pick what to GIVE */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-sans">
              Your hand — offer one
            </span>
            <div className="grid grid-cols-2 gap-3">
              {playerHand.map((v, i) => {
                const locked = lockedHere.includes(v.name);
                return (
                  <ValueCard
                    key={v.name}
                    value={v}
                    size="sm"
                    index={i}
                    isSelected={give === v.name}
                    isDimmed={locked}
                    onClick={!locked && !partnerDone ? () => setGive(v.name) : undefined}
                  />
                );
              })}
            </div>
          </div>

          {/* Center — the offer + response */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {result && (
              <NpcSpeechBubble
                avatar={profile.avatar}
                name={result.name}
                dialogue={result.dialogue}
                isRefusal={!result.accepted}
              />
            )}

            <div className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans text-center">
                Your offer to {profile?.name}
              </p>
              <div className="flex items-center justify-center gap-3 text-sm font-sans">
                <span className={give ? "text-primary font-semibold" : "text-muted-foreground"}>
                  {give ?? "— give —"}
                </span>
                <span className="text-muted-foreground">⇄</span>
                <span className={get ? "text-accent font-semibold" : "text-muted-foreground"}>
                  {get ?? "— get —"}
                </span>
              </div>
              {error && <p className="text-destructive text-xs font-sans text-center">{error}</p>}
              {partnerDone ? (
                <p className="text-muted-foreground text-xs font-sans text-center">
                  {profile?.name} isn't trading anymore.
                </p>
              ) : (
                <button
                  onClick={handleOffer}
                  disabled={!give || !get}
                  className="w-full py-3 bg-primary text-primary-foreground font-sans font-bold rounded-xl disabled:opacity-30 transition-all"
                >
                  Offer trade
                </button>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={onContinue}
                disabled={!canFinishTrading}
                className="px-6 py-3 bg-foreground text-background font-sans font-semibold rounded-xl disabled:opacity-25 transition-all"
              >
                Finish trading →
              </button>
              {!canFinishTrading && (
                <p className="text-muted-foreground text-xs font-sans mt-2">
                  Complete one trade with each partner to continue.
                </p>
              )}
            </div>
          </div>

          {/* Partner's hand — pick what to REQUEST */}
          <div className="lg:col-span-4 space-y-3">
            <div className="lg:text-right">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-sans">
                {profile?.name}'s hand — request one
              </span>
              <p className="text-xs text-muted-foreground font-sans mt-1">{profile?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {partner?.hand.map((v, i) => {
                const locked = lockedHere.includes(v.name);
                return (
                  <ValueCard
                    key={v.name}
                    value={v}
                    size="sm"
                    index={i}
                    isPlayer={false}
                    isSelected={get === v.name}
                    isDimmed={locked}
                    onClick={!locked && !partnerDone ? () => setGet(v.name) : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
