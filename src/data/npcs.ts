export interface NPCType {
  id: string;
  name: string;
  avatar: string;
  description: string;
  coreValues: string[];
  flexValues: string[];
  blindValues: string[];
  negotiationStyle: string;
  responses: {
    acceptLow: string[];
    declineHigh: string[];
    counterOffer: string[];
    refuseCore: string[];
  };
}

export const NPC_TYPES: NPCType[] = [
  {
    id: "idealist",
    name: "Alex",
    avatar: "⚖️",
    description: "Principled and idealistic",
    coreValues: ["Justice", "Honesty", "Integrity"],
    flexValues: ["Growth", "Curiosity", "Creativity"],
    blindValues: ["Power"],
    negotiationStyle: "principled",
    responses: {
      acceptLow: [
        "I can work with that. {offeredCard} matters to me too, and I think this trade makes sense.",
        "Interesting offer. {offeredCard} aligns with how I try to live. Deal.",
      ],
      declineHigh: [
        "I hear you, but {wantedCard} still means a lot to me. I'm not sure {offeredCard} is enough to let it go. Could you offer something else?",
        "{offeredCard} is nice, but {wantedCard} is really important to how I live. What else do you have?",
      ],
      counterOffer: [
        "What if instead I offered you {counterCard}? I think that gets at what you're really looking for.",
        "I can't part with {wantedCard}, but I could give you {counterCard}. Would that work?",
      ],
      refuseCore: [
        "{wantedCard} is non-negotiable for me. It's at the heart of everything I stand for.",
        "I hear you, but {wantedCard} isn't on the table. Some things aren't tradeable.",
      ],
    },
  },
  {
    id: "pragmatist",
    name: "Morgan",
    avatar: "🔧",
    description: "Results-oriented and flexible",
    coreValues: ["Order", "Growth", "Excellence"],
    flexValues: ["Tradition", "Humor", "Peace"],
    blindValues: ["Authenticity"],
    negotiationStyle: "pragmatic",
    responses: {
      acceptLow: [
        "That works. {offeredCard} is useful and I think we both come out ahead here.",
        "Practical choice. I'll take {offeredCard} — it fits what I'm trying to build.",
      ],
      declineHigh: [
        "{wantedCard} is doing a lot of work for me right now. {offeredCard} doesn't quite make up for it. What else could you offer?",
        "Not quite. {wantedCard} is too valuable to my goals. Think about what I need.",
      ],
      counterOffer: [
        "Let's be practical — {counterCard} gets you further than what you asked for anyway.",
        "Better deal: I give you {counterCard}. More useful, better fit. What do you say?",
      ],
      refuseCore: [
        "{wantedCard} drives everything I do. I can't function without it.",
        "{wantedCard} is a core asset for me. Not for trade at any price.",
      ],
    },
  },
  {
    id: "empath",
    name: "Jordan",
    avatar: "💛",
    description: "Warm and relationship-driven",
    coreValues: ["Kindness", "Love", "Compassion"],
    flexValues: ["Happiness", "Peace", "Humor"],
    blindValues: ["Independence"],
    negotiationStyle: "relational",
    responses: {
      acceptLow: [
        "I love that you value {offeredCard}. That tells me something about you. Deal.",
        "Honestly, knowing that {offeredCard} matters to you makes me feel good about this trade.",
      ],
      declineHigh: [
        "{wantedCard} is really tied to how I care for people around me. {offeredCard} is nice, but it's hard to let go of {wantedCard}. What else might work?",
        "I'd feel a real loss giving up {wantedCard}. Can we find another way?",
      ],
      counterOffer: [
        "What if I gave you {counterCard} instead? I think it might actually mean more to you when you think about it.",
        "How about {counterCard}? I feel like that's what you're really reaching for.",
      ],
      refuseCore: [
        "{wantedCard} is how I show up for people. I can't trade that away.",
        "{wantedCard} is too close to my heart. Some values are load-bearing.",
      ],
    },
  },
  {
    id: "skeptic",
    name: "Riley",
    avatar: "🔍",
    description: "Questioning and independent",
    coreValues: ["Curiosity", "Freedom", "Authenticity"],
    flexValues: ["Creativity", "Humor", "Independence"],
    blindValues: ["Order"],
    negotiationStyle: "questioning",
    responses: {
      acceptLow: [
        "Okay, I'll bite. {offeredCard} is interesting enough. But tell me — why are you so eager for {wantedCard}?",
        "Fine. {offeredCard} opens up possibilities I want to explore. Deal.",
      ],
      declineHigh: [
        "Why would I give up {wantedCard}? That's what keeps me thinking clearly. {offeredCard} isn't enough. Try again.",
        "Hmm. {wantedCard} is how I stay honest with myself. Not sure I can trade that for {offeredCard}.",
      ],
      counterOffer: [
        "I'll ask you something first: why do you really want {wantedCard}? Maybe {counterCard} is what you actually need.",
        "Counter-proposal: {counterCard}. I think you're solving the wrong problem with your ask.",
      ],
      refuseCore: [
        "Absolutely not. {wantedCard} is the whole point for me.",
        "{wantedCard} is what makes me, me. That's not up for debate.",
      ],
    },
  },
  {
    id: "guardian",
    name: "Sam",
    avatar: "🛡️",
    description: "Protective and values-preserving",
    coreValues: ["Tradition", "Purity", "Faith"],
    flexValues: ["Order", "Kindness", "Integrity"],
    blindValues: ["Freedom"],
    negotiationStyle: "protective",
    responses: {
      acceptLow: [
        "{offeredCard} has real worth. I can see why you'd value it and why I should too. Agreed.",
        "That's a fair exchange. {offeredCard} holds something important. I'll accept.",
      ],
      declineHigh: [
        "I've held {wantedCard} for a reason. It protects something I care about deeply. {offeredCard} isn't enough to let it go.",
        "{wantedCard} is not lightly given. What are you offering that's worth protecting in return?",
      ],
      counterOffer: [
        "I'd rather offer {counterCard}. It's valuable and I think it serves both of us better.",
        "What if we traded differently — {counterCard} from me, and you keep what you have?",
      ],
      refuseCore: [
        "{wantedCard} is sacred ground for me. I won't trade it.",
        "Some things you don't trade. {wantedCard} is one of them for me.",
      ],
    },
  },
];
