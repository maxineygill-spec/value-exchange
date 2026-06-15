import { Value } from "../data/values";

/**
 * Pure trade-engine logic for Condition 2 (simulated trading before sorting).
 *
 * Everything here is side-effect free and deterministic given an RNG, so it can
 * be unit-tested (see src/test/tradeEngine.test.ts). The React hook
 * (useGameState) wraps these functions with useState.
 *
 * ── TUNABLE STUDY PARAMETERS ───────────────────────────────────────────────
 * These are the knobs the spec talks about. Change them here, in one place.
 */
export interface TradeConfig {
  /** Baseline chance a virtual partner accepts an offer. Spec: start < 50%. */
  baseAcceptProb: number;
  /**
   * How much the accept chance climbs for each *consecutive* rejection by the
   * same partner (resets to 0 on a successful trade). This keeps early
   * rejections common while GUARANTEEING the participant can eventually land a
   * trade with each partner — so the "≥1 trade with each" gate is never
   * unreachable and nobody gets stuck.
   */
  rejectionBonus: number;
  /** Hard cutoff: a partner stops trading after this many offers. */
  maxOffersPerPartner: number;
  /** Successful trades required with EACH partner before sorting. Spec: 1. */
  requiredSuccessesPerPartner: number;
}

export const DEFAULT_TRADE_CONFIG: TradeConfig = {
  baseAcceptProb: 0.4, // 40% — below 50% per the endowment-effect rationale
  rejectionBonus: 0.2, // 3 consecutive rejections → guaranteed accept on the 4th
  maxOffersPerPartner: 12,
  requiredSuccessesPerPartner: 1,
};

export interface PartnerState {
  id: string;
  /** Cards this partner currently holds. */
  hand: Value[];
  offersMade: number;
  successes: number;
  rejectionStreak: number;
  /**
   * Card names that have already changed hands with this partner (in either
   * direction). Locked cards can't be traded with this partner again — this
   * enforces the spec's "don't trade back what you received" and "no trading
   * the same card back and forth" constraints.
   */
  lockedCards: string[];
  /** True once the cutoff is hit; partner declines all further offers. */
  exhausted: boolean;
}

export type OfferValidation = { ok: true } | { ok: false; reason: string };

/** Fisher–Yates shuffle (uniform, unlike `sort(() => Math.random() - 0.5)`). */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Split the full deck into three equal hands (player + two partners), using the
 * WHOLE deck so no cards are discarded. Spec: each player gets D/3 cards.
 */
export function dealThreeHands(
  pool: Value[],
  rng: () => number = Math.random
): [Value[], Value[], Value[]] {
  const shuffled = shuffle(pool, rng);
  const size = Math.floor(shuffled.length / 3);
  return [
    shuffled.slice(0, size),
    shuffled.slice(size, size * 2),
    shuffled.slice(size * 2, size * 3),
  ];
}

export function makePartner(id: string, hand: Value[]): PartnerState {
  return {
    id,
    hand,
    offersMade: 0,
    successes: 0,
    rejectionStreak: 0,
    lockedCards: [],
    exhausted: false,
  };
}

/** Can this specific offer legally be made? */
export function validateOffer(
  playerHand: Value[],
  partner: PartnerState,
  giveName: string,
  getName: string,
  config: TradeConfig
): OfferValidation {
  if (partner.exhausted || partner.offersMade >= config.maxOffersPerPartner)
    return { ok: false, reason: "This partner isn't trading anymore." };
  if (giveName === getName)
    return { ok: false, reason: "Offer and request must be different cards." };
  if (!playerHand.some((v) => v.name === giveName))
    return { ok: false, reason: "You no longer hold that card." };
  if (!partner.hand.some((v) => v.name === getName))
    return { ok: false, reason: "They no longer hold that card." };
  if (partner.lockedCards.includes(giveName) || partner.lockedCards.includes(getName))
    return { ok: false, reason: "That card has already been traded with this partner." };
  return { ok: true };
}

export function acceptanceProbability(
  partner: PartnerState,
  config: TradeConfig
): number {
  return Math.min(
    1,
    config.baseAcceptProb + config.rejectionBonus * partner.rejectionStreak
  );
}

export interface OfferDecision {
  accepted: boolean;
  probability: number;
}

/** Decide accept/reject given a random roll in [0, 1). Pure. */
export function decideOffer(
  partner: PartnerState,
  config: TradeConfig,
  roll: number
): OfferDecision {
  const probability = acceptanceProbability(partner, config);
  return { accepted: roll < probability, probability };
}

/** Apply an accepted trade. Returns the new player hand + new partner state. */
export function applyAcceptedTrade(
  playerHand: Value[],
  partner: PartnerState,
  giveName: string,
  getName: string
): { playerHand: Value[]; partner: PartnerState } {
  const giveCard = playerHand.find((v) => v.name === giveName)!;
  const getCard = partner.hand.find((v) => v.name === getName)!;
  return {
    playerHand: playerHand.filter((v) => v.name !== giveName).concat(getCard),
    partner: {
      ...partner,
      hand: partner.hand.filter((v) => v.name !== getName).concat(giveCard),
      offersMade: partner.offersMade + 1,
      successes: partner.successes + 1,
      rejectionStreak: 0,
      lockedCards: [...partner.lockedCards, giveName, getName],
      exhausted: false,
    },
  };
}

/** Apply a rejected trade (no cards move; streak + offer count climb). */
export function applyRejectedTrade(
  partner: PartnerState,
  config: TradeConfig
): PartnerState {
  const offersMade = partner.offersMade + 1;
  return {
    ...partner,
    offersMade,
    rejectionStreak: partner.rejectionStreak + 1,
    exhausted: offersMade >= config.maxOffersPerPartner,
  };
}

/** Has the participant met the "≥1 trade with each partner" gate? */
export function canFinishTrading(
  partners: PartnerState[],
  config: TradeConfig
): boolean {
  return partners.every(
    (p) => p.successes >= config.requiredSuccessesPerPartner
  );
}
