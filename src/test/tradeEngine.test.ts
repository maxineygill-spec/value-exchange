import { describe, it, expect } from "vitest";
import { ALL_VALUES, Value } from "../data/values";
import {
  DEFAULT_TRADE_CONFIG,
  dealThreeHands,
  buildRanking,
  buildSolvableRanking,
  makePartner,
  validateOffer,
  decideOffer,
  applyAcceptedTrade,
  applyRejectedTrade,
  hasAcceptableTrade,
  canFinishTrading,
  PartnerState,
} from "../lib/tradeEngine";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const byName = (names: string[]): Value[] =>
  names.map((n) => ALL_VALUES.find((v) => v.name === n)!);

describe("dealThreeHands", () => {
  it("uses the whole deck with equal, non-overlapping hands", () => {
    for (const deck of [ALL_VALUES.slice(0, 18), ALL_VALUES]) {
      const [a, b, c] = dealThreeHands(deck, mulberry32(1));
      const size = deck.length / 3;
      expect(a).toHaveLength(size);
      expect(b).toHaveLength(size);
      expect(c).toHaveLength(size);
      expect(new Set([...a, ...b, ...c].map((v) => v.name)).size).toBe(deck.length);
    }
  });
});

describe("deterministic acceptance (the spec rule)", () => {
  it("accepts iff the offered card outranks the requested card", () => {
    // Partner values Freedom (4th) above Happiness (5th), Order (6th) below it.
    const ranking: Record<string, number> = {
      Freedom: 4, Happiness: 5, Order: 6,
    };
    const partner: PartnerState = {
      id: "A", hand: byName(["Happiness"]), ranking,
      offersMade: 0, successes: 0, lockedPairs: [],

    };
    // Offer Freedom (4) for Happiness (5): 4 < 5 -> accept.
    expect(decideOffer(partner, "Freedom", "Happiness")).toBe(true);
    // Offer Order (6) for Happiness (5): 6 < 5 is false -> reject.
    expect(decideOffer(partner, "Order", "Happiness")).toBe(false);
  });

  it("is adamant: a rejected offer stays rejected no matter how many times it's tried", () => {
    let partner: PartnerState = {
      id: "A", hand: byName(["Happiness"]), ranking: { Order: 6, Happiness: 5 },
      offersMade: 0, successes: 0, lockedPairs: [],
    };
    for (let i = 0; i < 25; i++) {
      const accepted = decideOffer(partner, "Order", "Happiness");
      expect(accepted).toBe(false); // never "wears down"
      partner = applyRejectedTrade(partner);
    }
  });
});

describe("buildSolvableRanking", () => {
  it("always leaves at least one acceptable trade against the player's hand", () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const rng = mulberry32(seed);
      const pool = ALL_VALUES.slice(0, 18);
      const [pHand, hand] = dealThreeHands(pool, rng);
      const ranking = buildSolvableRanking(pool, pHand, hand, rng);
      const partner = makePartner("A", hand, ranking);
      expect(hasAcceptableTrade(pHand, partner)).toBe(true);
    }
  });
});

// A greedy player: whenever a partner needs a trade and one exists, take it.
function simulate(deckSize: 18 | 24, seed: number) {
  const rng = mulberry32(seed);
  const pool = deckSize === 18 ? ALL_VALUES.slice(0, 18) : ALL_VALUES;
  const [pHand, hA, hB] = dealThreeHands(pool, rng);
  let playerHand = pHand;
  let partners: PartnerState[] = [
    makePartner("A", hA, buildSolvableRanking(pool, pHand, hA, rng)),
    makePartner("B", hB, buildSolvableRanking(pool, pHand, hB, rng)),
  ];
  const config = DEFAULT_TRADE_CONFIG;
  const handSize = pool.length / 3;

  let guard = 0;
  while (!canFinishTrading(playerHand, partners, config)) {
    if (++guard > 500) throw new Error("did not converge");

    const pIdx = partners.findIndex(
      (p) => p.successes < config.requiredSuccessesPerPartner && hasAcceptableTrade(playerHand, p)
    );
    // If no partner needs AND can trade, the gate must already be satisfiable.
    if (pIdx === -1) break;
    const partner = partners[pIdx];

    // Find an acceptable, legal trade.
    let made = false;
    for (const g of playerHand) {
      if (partner.lockedCards.includes(g.name)) continue;
      for (const r of partner.hand) {
        if (partner.lockedCards.includes(r.name)) continue;
        if (decideOffer(partner, g.name, r.name)) {
          expect(validateOffer(playerHand, partner, g.name, r.name).ok).toBe(true);
          const res = applyAcceptedTrade(playerHand, partner, g.name, r.name);
          playerHand = res.playerHand;
          partners = partners.map((p, i) => (i === pIdx ? res.partner : p));
          made = true;
          break;
        }
      }
      if (made) break;
    }
    expect(made).toBe(true);
    expect(playerHand).toHaveLength(handSize);
  }
  return { playerHand, partners, handSize };
}

describe("trade simulation", () => {
  it("every deal is completable — no hard locks across many seeds", () => {
    for (let seed = 1; seed <= 500; seed++) {
      const { playerHand, partners } = simulate(18, seed);
      expect(canFinishTrading(playerHand, partners, DEFAULT_TRADE_CONFIG)).toBe(true);
      // Each partner is either traded with, or genuinely has nothing acceptable left.
      for (const p of partners) {
        const done = p.successes >= 1 || !hasAcceptableTrade(playerHand, p);
        expect(done).toBe(true);
      }
    }
  });

  it("preserves hand size and never double-locks a card", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const { partners, handSize, playerHand } = simulate(24, seed);
      expect(playerHand).toHaveLength(handSize);
      for (const p of partners) {
        expect(new Set(p.lockedCards).size).toBe(p.lockedCards.length);
      }
      expect(canFinishTrading(playerHand, partners, DEFAULT_TRADE_CONFIG)).toBe(true);
    }
  });
});
