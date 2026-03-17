import { useState, useCallback } from 'react';
import { Value, ALL_VALUES } from '../data/values';
import { NPCType, NPC_TYPES } from '../data/npcs';

export type GamePhase =
  | "mode-select"
  | "glossary"
  | "deal"
  | "prioritize"
  | "want"
  | "meet-partner"
  | "negotiate"
  | "resolution"
  | "debrief"
  | "summary";

export interface NegotiationRound {
  round: number;
  playerOffered: string;
  playerArgument: string;
  npcResponse: "accept" | "decline" | "counter" | "refuse";
  npcDialogue: string;
  counterCard?: string;
}

export interface DebriefAnswers {
  hardestToGiveUp: string;
  whyHardest: string;
  didMindChange: boolean;
  whatShifted: string;
  learnedAboutPartner: string;
  hiddenCommonGround: string;
}

export interface GameState {
  phase: GamePhase;
  deckSize: 18 | 24;
  playerHand: Value[];
  playerTop2: string[];
  playerTop2Reason: string;
  playerWants: Value[];
  playerWantReason: string;
  npcProfile: NPCType;
  npcHand: Value[];
  npcTop2: string[];
  npcWants: Value[];
  negotiationRounds: NegotiationRound[];
  tradeOutcome: "success" | "partial" | "failed" | null;
  cardsLost: string[];
  cardsGained: string[];
  finalPlayerHand: Value[];
  finalNpcHand: Value[];
  debriefAnswers: DebriefAnswers;
}

const PHASE_ORDER: GamePhase[] = [
  "mode-select", "glossary", "deal", "prioritize", "want",
  "meet-partner", "negotiate", "resolution", "debrief", "summary"
];

export const useGameState = () => {
  const [phase, setPhase] = useState<GamePhase>("mode-select");
  const [deckSize, setDeckSize] = useState<18 | 24>(18);
  const [playerHand, setPlayerHand] = useState<Value[]>([]);
  const [playerTop2, setPlayerTop2] = useState<string[]>([]);
  const [playerTop2Reason, setPlayerTop2Reason] = useState("");
  const [playerWants, setPlayerWants] = useState<Value[]>([]);
  const [playerWantReason, setPlayerWantReason] = useState("");
  const [npcProfile, setNpcProfile] = useState<NPCType>(NPC_TYPES[0]);
  const [npcHand, setNpcHand] = useState<Value[]>([]);
  const [npcTop2, setNpcTop2] = useState<string[]>([]);
  const [npcWants, setNpcWants] = useState<Value[]>([]);
  const [negotiationRounds, setNegotiationRounds] = useState<NegotiationRound[]>([]);
  const [tradeOutcome, setTradeOutcome] = useState<"success" | "partial" | "failed" | null>(null);
  const [cardsLost, setCardsLost] = useState<string[]>([]);
  const [cardsGained, setCardsGained] = useState<string[]>([]);
  const [finalPlayerHand, setFinalPlayerHand] = useState<Value[]>([]);
  const [finalNpcHand, setFinalNpcHand] = useState<Value[]>([]);
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

  const dealCards = useCallback(() => {
    const pool = deckSize === 18 ? [...ALL_VALUES].slice(0, 18) : [...ALL_VALUES];
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const count = deckSize === 18 ? 6 : 8;
    const pHand = shuffled.slice(0, count);
    const nHand = shuffled.slice(count, count * 2);

    const npc = NPC_TYPES[Math.floor(Math.random() * NPC_TYPES.length)];
    setNpcProfile(npc);
    setPlayerHand(pHand);
    setNpcHand(nHand);

    // NPC picks top 2 from their core values in hand, or first 2
    const nTop2 = nHand
      .filter(v => npc.coreValues.includes(v.name))
      .slice(0, 2)
      .map(v => v.name);
    if (nTop2.length < 2) {
      const remaining = nHand.filter(v => !nTop2.includes(v.name));
      while (nTop2.length < 2 && remaining.length > 0) {
        nTop2.push(remaining.shift()!.name);
      }
    }
    setNpcTop2(nTop2);

    // NPC wants cards from player's hand that match their flex values
    const nWants = pHand
      .filter(v => npc.flexValues.includes(v.name) || npc.coreValues.includes(v.name))
      .slice(0, 2);
    setNpcWants(nWants.length > 0 ? nWants : [pHand[0]]);

    setPhase("deal");
  }, [deckSize]);

  const evaluateOffer = useCallback((offeredCardName: string, wantedCardName: string, round: number): {
    response: "accept" | "decline" | "counter" | "refuse";
    dialogue: string;
    counterCard?: string;
  } => {
    const npc = npcProfile;
    let responseType: "accept" | "decline" | "counter" | "refuse";

    // Check if player is asking for NPC's core value (NPC won't give it up)
    if (npc.coreValues.includes(wantedCardName) && npcTop2.includes(wantedCardName)) {
      responseType = "refuse";
    } else if (npc.flexValues.includes(offeredCardName) || npc.coreValues.includes(offeredCardName)) {
      // NPC wants what the player is offering — accept!
      responseType = "accept";
    } else if (round >= 2) {
      responseType = "counter";
    } else {
      responseType = "decline";
    }

    // Pick a random dialogue
    let dialogueTemplates: string[];
    let counterCardName: string | undefined;

    switch (responseType) {
      case "accept":
        dialogueTemplates = npc.responses.acceptLow;
        break;
      case "decline":
        dialogueTemplates = npc.responses.declineHigh;
        break;
      case "counter":
        dialogueTemplates = npc.responses.counterOffer;
        // Pick a flex value from NPC's hand to counter with
        const counterOptions = npcHand.filter(
          v => npc.flexValues.includes(v.name) && !npcTop2.includes(v.name)
        );
        counterCardName = counterOptions.length > 0
          ? counterOptions[Math.floor(Math.random() * counterOptions.length)].name
          : npcHand.find(v => !npcTop2.includes(v.name))?.name;
        break;
      case "refuse":
        dialogueTemplates = npc.responses.refuseCore;
        break;
    }

    const template = dialogueTemplates![Math.floor(Math.random() * dialogueTemplates!.length)];
    const dialogue = template
      .replace(/\{offeredCard\}/g, offeredCardName)
      .replace(/\{wantedCard\}/g, wantedCardName)
      .replace(/\{counterCard\}/g, counterCardName || "");

    return { response: responseType, dialogue, counterCard: counterCardName };
  }, [npcProfile, npcHand, npcTop2]);

  const addNegotiationRound = useCallback((round: NegotiationRound) => {
    setNegotiationRounds(prev => [...prev, round]);
  }, []);

  const resolveTradeSuccess = useCallback((playerGives: string, playerGets: string) => {
    const givenCard = playerHand.find(v => v.name === playerGives)!;
    const gotCard = npcHand.find(v => v.name === playerGets)!;

    if (!givenCard || !gotCard) return;

    const newPlayerHand = playerHand.filter(v => v.name !== playerGives).concat(gotCard);
    const newNpcHand = npcHand.filter(v => v.name !== playerGets).concat(givenCard);

    setFinalPlayerHand(newPlayerHand);
    setFinalNpcHand(newNpcHand);
    setCardsLost([playerGives]);
    setCardsGained([playerGets]);
    setTradeOutcome("success");
  }, [playerHand, npcHand]);

  const resolveTradePartial = useCallback((playerGives: string, counterCard: string) => {
    const givenCard = playerHand.find(v => v.name === playerGives)!;
    const gotCard = npcHand.find(v => v.name === counterCard)!;

    if (!givenCard || !gotCard) return;

    const newPlayerHand = playerHand.filter(v => v.name !== playerGives).concat(gotCard);
    const newNpcHand = npcHand.filter(v => v.name !== counterCard).concat(givenCard);

    setFinalPlayerHand(newPlayerHand);
    setFinalNpcHand(newNpcHand);
    setCardsLost([playerGives]);
    setCardsGained([counterCard]);
    setTradeOutcome("partial");
  }, [playerHand, npcHand]);

  const resolveTradeFailed = useCallback(() => {
    setFinalPlayerHand([...playerHand]);
    setFinalNpcHand([...npcHand]);
    setCardsLost([]);
    setCardsGained([]);
    setTradeOutcome("failed");
  }, [playerHand, npcHand]);

  const resetGame = useCallback(() => {
    setPhase("mode-select");
    setPlayerHand([]);
    setPlayerTop2([]);
    setPlayerTop2Reason("");
    setPlayerWants([]);
    setPlayerWantReason("");
    setNpcHand([]);
    setNpcTop2([]);
    setNpcWants([]);
    setNegotiationRounds([]);
    setTradeOutcome(null);
    setCardsLost([]);
    setCardsGained([]);
    setFinalPlayerHand([]);
    setFinalNpcHand([]);
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
      deckVersion: String(deckSize),
      mode: "solo-npc",
      npcType: npcProfile.id,
      phase1_deal: {
        cardsDealt: playerHand.map(v => v.name),
      },
      phase2_prioritize: {
        top2Selected: playerTop2,
        optionalReason: playerTop2Reason,
      },
      phase3_want: {
        cardsWanted: playerWants.map(v => v.name),
        justification: playerWantReason,
      },
      phase4_negotiate: {
        rounds: negotiationRounds,
        outcome: tradeOutcome,
      },
      phase5_resolution: {
        finalPlayerHand: (finalPlayerHand.length ? finalPlayerHand : playerHand).map(v => v.name),
        cardsLost,
        cardsGained,
      },
      phase6_debrief: {
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
  }, [deckSize, npcProfile, playerHand, playerTop2, playerTop2Reason, playerWants, playerWantReason, negotiationRounds, tradeOutcome, finalPlayerHand, cardsLost, cardsGained, debriefAnswers]);

  return {
    phase, setPhase, phaseIndex, totalPhases,
    deckSize, setDeckSize,
    playerHand, setPlayerHand,
    playerTop2, setPlayerTop2,
    playerTop2Reason, setPlayerTop2Reason,
    playerWants, setPlayerWants,
    playerWantReason, setPlayerWantReason,
    npcProfile, npcHand, npcTop2, npcWants,
    negotiationRounds, addNegotiationRound,
    tradeOutcome, cardsLost, cardsGained,
    finalPlayerHand, finalNpcHand,
    debriefAnswers, setDebriefAnswers,
    dealCards, evaluateOffer,
    resolveTradeSuccess, resolveTradePartial, resolveTradeFailed,
    resetGame, exportData,
  };
};
