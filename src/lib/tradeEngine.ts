import { Value } from "../data/values";

/**
 * Pure trade-engine logic for Condition 2 (simulated trading before sorting).
 *
 * DETERMINISTIC MODEL: at deal time, each partner is given a private random
 * ranking over ALL values in play (1 = most valued). A partner accepts an offer
 * if and only if it values the card being OFFERED to it more highly than the
 * card being REQUESTED from it — i.e. rank(offered) < rank(requested). Partners
 * are adamant: the same offer always gets the same answer, so re-offering a
 * rejected trade can't "wear them down". There is no probability and no streak.
 *
 * Side-effect free and deterministic, so it can be unit-tested.
 */
export interface TradeConfig {
  /** Successful trades required with EACH partner before sorting. Spec: 1. */
  requiredSuccessesPerPartner: number;
}

export const DEFAULT_TRADE_CONFIG: TradeConfig = {
  requiredSuccessesPerPartner: 1,
};

/** name -> rank, where 1 is the partner's MOST valued value. */
export type Ranking = Record<string, number>;

export interface PartnerState {
  id: string;
  /** Cards this partner currently holds. */
  hand: Value[];
  /** Private full preference ordering over all values in play. */
  ranking: Ranking;
  offersMade: number;
  successes: number;
  /**
   * Pairs (give, get) from past accepted trades with this partner. Prevents
   * only the exact reverse trade — e.g. after trading Creativity→Purity, you
   * cannot immediately trade Purity→Creativity back to the same partner. All
   * other trades involving those cards remain available.
   */
  lockedPairs: Array<{ give: string; get: string }>;

}

export type OfferValidation = { ok: true } | { ok: false; reason: string };

/** Fisher–Yates shuffle (uniform). */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Split the full deck into three equal hands (player + two partners). */
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

/** A random total ranking over the given values (1 = most valued). */
export function buildRanking(values: Value[], rng: () => number = Math.random): Ranking {
  const order = shuffle(values, rng);
  const ranking: Ranking = {};
  order.forEach((v, i) => {
    ranking[v.name] = i + 1;
  });
  return ranking;
}

/** Does any acceptable (unlocked) trade exist between this hand and partner? */
export function hasAcceptableTrade(
  playerHand: Value[],
  partner: PartnerState
): boolean {
  for (const g of playerHand) {
    if (partner.lockedCards.includes(g.name)) continue;
    for (const r of partner.hand) {
      if (partner.lockedCards.includes(r.name)) continue;
      if (partner.ranking[g.name] < partner.ranking[r.name]) return true;
    }
  }
  return false;
}

/**
 * Build a ranking that is GUARANTEED to leave at least one acceptable trade
 * against the given player hand, so the "trade with each partner" gate is always
 * reachable at the start. Falls back to a single rank-swap if a random ranking
 * happens to be unsolvable (~0.1% of deals).
 */
export function buildSolvableRanking(
  allValues: Value[],
  playerHand: Value[],
  partnerHand: Value[],
  rng: () => number = Math.random
): Ranking {
  const ranking = buildRanking(allValues, rng);
  const probe: PartnerState = {
    id: "probe", hand: partnerHand, ranking, offersMade: 0, successes: 0, lockedCards: [],
  };
  if (hasAcceptableTrade(playerHand, probe)) return ranking;

  // Unsolvable: make the player's best-ranked card outrank the partner's worst.
  const gStar = [...playerHand].sort((a, b) => ranking[a.name] - ranking[b.name])[0];
  const rStar = [...partnerHand].sort((a, b) => ranking[b.name] - ranking[a.name])[0];
  if (gStar && rStar) {
    const tmp = ranking[gStar.name];
    ranking[gStar.name] = ranking[rStar.name];
    ranking[rStar.name] = tmp;
  }
  return ranking;
}

export function makePartner(id: string, hand: Value[], ranking: Ranking): PartnerState {
  return { id, hand, ranking, offersMade: 0, successes: 0, lockedCards: [] };
}

/** Can this specific offer legally be made? (Legality, not acceptance.) */
export function validateOffer(
  playerHand: Value[],
  partner: PartnerState,
  giveName: string,
  getName: string
): OfferValidation {
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

/**
 * The deterministic decision: accept iff the partner values the offered card
 * more than the requested card. Pure, stable, un-hackable.
 */
export function decideOffer(
  partner: PartnerState,
  giveName: string,
  getName: string
): boolean {
  return partner.ranking[giveName] < partner.ranking[getName];
}

/** Apply an accepted trade. Returns new player hand + new partner state. */
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
      lockedCards: [...partner.lockedCards, giveName, getName],
    },
  };
}

/** Apply a rejected trade (nothing moves; partner is unmoved). */
export function applyRejectedTrade(partner: PartnerState): PartnerState {
  return { ...partner, offersMade: partner.offersMade + 1 };
}

/**
 * Gate: each partner is either traded with the required number of times, OR has
 * no acceptable trade left against the current hand (genuinely maxed out).
 */
export function canFinishTrading(
  playerHand: Value[],
  partners: PartnerState[],
  config: TradeConfig
): boolean {
  return partners.every(
    (p) =>
      p.successes >= config.requiredSuccessesPerPartner ||
      !hasAcceptableTrade(playerHand, p)
  );
}
