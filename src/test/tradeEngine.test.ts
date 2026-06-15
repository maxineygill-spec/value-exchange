import { describe, it, expect } from "vitest";
import { ALL_VALUES } from "../data/values";
import {
  DEFAULT_TRADE_CONFIG,
  dealThreeHands,
  makePartner,
  validateOffer,
  decideOffer,
  applyAcceptedTrade,
  applyRejectedTrade,
  canFinishTrading,
  PartnerState,
} from "../lib/tradeEngine";

// Small seeded RNG so the simulation is deterministic and reproducible.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("dealThreeHands", () => {
  it("uses the whole deck with equal, non-overlapping hands", () => {
    for (const deck of [ALL_VALUES.slice(0, 18), ALL_VALUES]) {
      const [a, b, c] = dealThreeHands(deck, mulberry32(1));
      const size = deck.length / 3;
      expect(a).toHaveLength(size);
      expect(b).toHaveLength(size);
      expect(c).toHaveLength(size);
      const all = [...a, ...b, ...c].map((v) => v.name);
      expect(new Set(all).size).toBe(deck.length); // no dupes, no discards
    }
  });
});

/**
 * Simulate a participant who plays randomly: pick a partner, pick a random
 * legal give/get, make the offer, repeat until the gate is met. This is the
 * worst case for "getting stuck" — if a random player always finishes, a
 * deliberate one certainly will.
 */
function simulate(deckSize: 18 | 24, seed: number) {
  const rng = mulberry32(seed);
  const pool = deckSize === 18 ? ALL_VALUES.slice(0, 18) : ALL_VALUES;
  const [pHand, hA, hB] = dealThreeHands(pool, rng);
  let playerHand = pHand;
  let partners: PartnerState[] = [makePartner("A", hA), makePartner("B", hB)];
  const config = DEFAULT_TRADE_CONFIG;
  const handSize = pool.length / 3;

  let guard = 0;
  while (!canFinishTrading(partners, config)) {
    guard++;
    if (guard > 1000) throw new Error("did not converge — possible soft-lock");

    // Choose a partner that still needs a successful trade and isn't exhausted.
    const pIdx = partners.findIndex(
      (p) => p.successes < config.requiredSuccessesPerPartner && !p.exhausted
    );
    if (pIdx === -1) break; // would indicate an unreachable gate
    const partner = partners[pIdx];

    const giveOptions = playerHand.filter(
      (v) => !partner.lockedCards.includes(v.name)
    );
    const getOptions = partner.hand.filter(
      (v) => !partner.lockedCards.includes(v.name)
    );
    if (!giveOptions.length || !getOptions.length) {
      throw new Error("ran out of legal cards before completing a trade");
    }
    const give = giveOptions[Math.floor(rng() * giveOptions.length)].name;
    const get = getOptions[Math.floor(rng() * getOptions.length)].name;

    const v = validateOffer(playerHand, partner, give, get, config);
    expect(v.ok).toBe(true);

    const { accepted } = decideOffer(partner, config, rng());
    if (accepted) {
      const res = applyAcceptedTrade(playerHand, partner, give, get);
      playerHand = res.playerHand;
      partners = partners.map((p, i) => (i === pIdx ? res.partner : p));
    } else {
      partners = partners.map((p, i) =>
        i === pIdx ? applyRejectedTrade(p, config) : p
      );
    }

    // Invariant: hand size never changes (trades are strictly 1-for-1).
    expect(playerHand).toHaveLength(handSize);
  }

  return { playerHand, partners, handSize };
}

describe("trade simulation", () => {
  it("a random player always reaches the gate (no soft-locks) across many seeds", () => {
    for (let seed = 1; seed <= 500; seed++) {
      const { partners } = simulate(18, seed);
      expect(canFinishTrading(partners, DEFAULT_TRADE_CONFIG)).toBe(true);
      expect(partners[0].successes).toBeGreaterThanOrEqual(1);
      expect(partners[1].successes).toBeGreaterThanOrEqual(1);
    }
    for (let seed = 1; seed <= 500; seed++) {
      const { partners } = simulate(24, seed);
      expect(canFinishTrading(partners, DEFAULT_TRADE_CONFIG)).toBe(true);
    }
  });

  it("never lets a locked card trade twice with the same partner", () => {
    const { partners } = simulate(24, 42);
    for (const p of partners) {
      // Locked list has no duplicates → each card locked at most once.
      expect(new Set(p.lockedCards).size).toBe(p.lockedCards.length);
    }
  });
});
