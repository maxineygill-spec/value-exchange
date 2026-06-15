import { useState, useCallback, useMemo } from 'react';
import { Value, ALL_VALUES } from '../data/values';
import { NPCType, NPC_TYPES } from '../data/npcs';
import {
  PartnerState,
  TradeConfig,
  DEFAULT_TRADE_CONFIG,
  dealThreeHands,
  makePartner,
  validateOffer,
  decideOffer,
  applyAcceptedTrade,
  applyRejectedTrade,
  canFinishTrading as engineCanFinish,
  shuffle,
} from '../lib/tradeEngine';

export type GamePhase =
  | "mode-select"
  | "glossary"
  | "deal"
  | "meet-partners"
  | "trade"
  | "sort"
  | "debrief"
  | "summary";

export interface TradeRecord {
  order: number;
  partnerId: string;
  partnerType: string;
  gave: string;
  received: string | null;
  accepted: boolean;
  acceptProbability: number;
}

export interface DebriefAnswers {
  hardestToGiveUp: string;
  whyHardest: string;
  didMindChange: boolean;
  whatShifted: string;
  learnedAboutPartner: string;
  hiddenCommonGround: string;
}

export interface OfferOutcome {
  ok: boolean;
  reason?: string;
  accepted?: boolean;
  dialogue?: string;
}

const PHASE_ORDER: GamePhase[] = [
  "mode-select", "glossary", "deal", "meet-partners",
  "trade", "sort", "debrief", "summary",
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const useGameState = (config: TradeConfig = DEFAULT_TRADE_CONFIG) => {
  const [phase, setPhase] = useState<GamePhase>("mode-select");
  const [deckSize, setDeckSize] = useState<18 | 24>(18);

  // dealtPlayerHand is the original snapshot; playerHand mutates as trades happen.
  const [dealtPlayerHand, setDealtPlayerHand] = useState<Value[]>([]);
  const [playerHand, setPlayerHand] = useState<Value[]>([]);
  const [partners, setPartners] = useState<PartnerState[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<NPCType[]>([]);
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  const [finalTop, setFinalTop] = useState<string[]>([]);
  const [finalTopReason, setFinalTopReason] = useState("");

  const [debriefAnswers, setDebriefAnswers] = useState<DebriefAnswers>({
    hardestToGiveUp: "",
    whyHardest: "",
    didMindChange: false,
    whatShifted: "",
    learnedAboutPartner: "",
    hiddenCommonGround: "",
  });

  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const totalPhases = PHASE_ORDER.length - 1; // exclude mode-select

  // Spec: in an 18-card deck (hand of 6) pick top 2; in 24 (hand of 8) pick top 3.
  // (Condition 2 prose says "top 3" — to make this a flat 3, set topN = 3.)
  const topN = deckSize === 18 ? 2 : 3;

  const dealCards = useCallback(() => {
    const pool = deckSize === 18 ? ALL_VALUES.slice(0, 18) : [...ALL_VALUES];
    const [pHand, hA, hB] = dealThreeHands(pool);

    // Two DISTINCT partner archetypes for flavor.
    const profiles = shuffle(NPC_TYPES).slice(0, 2);

    setDealtPlayerHand(pHand);
    setPlayerHand(pHand);
    setPartnerProfiles(profiles);
    setPartners([makePartner("A", hA), makePartner("B", hB)]);
    setTrades([]);
    setPhase("deal");
  }, [deckSize]);

  const profileFor = useCallback(
    (partnerId: string): NPCType | undefined => {
      const idx = partners.findIndex((p) => p.id === partnerId);
      return idx === -1 ? undefined : partnerProfiles[idx];
    },
    [partners, partnerProfiles]
  );

  const makeOffer = useCallback(
    (partnerId: string, giveName: string, getName: string): OfferOutcome => {
      const idx = partners.findIndex((p) => p.id === partnerId);
      if (idx === -1) return { ok: false, reason: "Unknown partner." };

      const partner = partners[idx];
      const profile = partnerProfiles[idx];

      const validation = validateOffer(playerHand, partner, giveName, getName, config);
      if (!validation.ok) {
        const reason = "reason" in validation ? validation.reason : undefined;
        return { ok: false, reason };
      }

      const { accepted, probability } = decideOffer(partner, config, Math.random());

      let dialogue: string;
      if (accepted) {
        const res = applyAcceptedTrade(playerHand, partner, giveName, getName);
        setPlayerHand(res.playerHand);
        setPartners((prev) => prev.map((p, i) => (i === idx ? res.partner : p)));
        dialogue = pick(profile.responses.acceptLow)
          .replace(/\{offeredCard\}/g, giveName)
          .replace(/\{wantedCard\}/g, getName);
      } else {
        const updated = applyRejectedTrade(partner, config);
        setPartners((prev) => prev.map((p, i) => (i === idx ? updated : p)));
        dialogue = pick(profile.responses.declineHigh)
          .replace(/\{offeredCard\}/g, giveName)
          .replace(/\{wantedCard\}/g, getName);
      }

      setTrades((prev) => [
        ...prev,
        {
          order: prev.length + 1,
          partnerId,
          partnerType: profile.id,
          gave: giveName,
          received: accepted ? getName : null,
          accepted,
          acceptProbability: Number(probability.toFixed(2)),
        },
      ]);

      return { ok: true, accepted, dialogue };
    },
    [partners, partnerProfiles, playerHand, config]
  );

  const canFinishTrading = useMemo(
    () => partners.length > 0 && engineCanFinish(partners, config),
    [partners, config]
  );

  const toggleTop = useCallback(
    (name: string) => {
      setFinalTop((prev) => {
        if (prev.includes(name)) return prev.filter((n) => n !== name);
        if (prev.length < topN) return [...prev, name];
        return prev;
      });
    },
    [topN]
  );

  const resetGame = useCallback(() => {
    setPhase("mode-select");
    setDealtPlayerHand([]);
    setPlayerHand([]);
    setPartners([]);
    setPartnerProfiles([]);
    setTrades([]);
    setFinalTop([]);
    setFinalTopReason("");
    setDebriefAnswers({
      hardestToGiveUp: "",
      whyHardest: "",
      didMindChange: false,
      whatShifted: "",
      learnedAboutPartner: "",
      hiddenCommonGround: "",
    });
  }, []);

  const exportData = useCallback(() => {
    const data = {
      sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      condition: "2-trade-and-sort",
      deckVersion: String(deckSize),
      partners: partnerProfiles.map((p, i) => ({
        id: partners[i]?.id,
        type: p.id,
      })),
      dealtHand: dealtPlayerHand.map((v) => v.name),
      trades,
      finalHand: playerHand.map((v) => v.name),
      topSelection: { n: topN, values: finalTop, reason: finalTopReason },
      debrief: {
        hardestToGiveUp: debriefAnswers.hardestToGiveUp,
        whyHardest: debriefAnswers.whyHardest,
        mindChanged: debriefAnswers.didMindChange,
        whatShifted: debriefAnswers.whatShifted,
        learnedAboutPartner: debriefAnswers.learnedAboutPartner,
        hiddenCommonGround: debriefAnswers.hiddenCommonGround,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `value-cards-session-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [deckSize, partners, partnerProfiles, dealtPlayerHand, trades, playerHand, topN, finalTop, finalTopReason, debriefAnswers]);

  return {
    phase, setPhase, phaseIndex, totalPhases,
    deckSize, setDeckSize,
    dealtPlayerHand, playerHand,
    partners, partnerProfiles, profileFor,
    trades,
    topN, finalTop, toggleTop, finalTopReason, setFinalTopReason,
    debriefAnswers, setDebriefAnswers,
    dealCards, makeOffer, canFinishTrading,
    resetGame, exportData,
  };
};
