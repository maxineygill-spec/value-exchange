import { useEffect, useState } from 'react';
import { Value } from '../data/values';
import { PartnerState, Ranking } from '../lib/tradeEngine';
import { GamePhase, PartnerDisplay, TradeRecord } from '../hooks/useGameState';

interface ResearcherViewProps {
  phase: GamePhase;
  phaseTiming: Record<string, number>;
  phaseStartTime: number;
  deckSize: 18 | 24;
  partners: PartnerState[];
  partnerProfiles: PartnerDisplay[];
  playerHand: Value[];
  dealtPlayerHand: Value[];
  trades: TradeRecord[];
  onClose: () => void;
}

const rankingToList = (r: Ranking) =>
  Object.entries(r).sort((a, b) => a[1] - b[1]).map(([name]) => name);

const fmtSec = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block bg-slate-100 text-slate-800 rounded-full px-2.5 py-0.5 text-xs mr-1.5 mb-1.5 font-mono">
    {children}
  </span>
);

const ResearcherView = ({
  phase, phaseTiming, phaseStartTime, deckSize,
  partners, partnerProfiles, playerHand, dealtPlayerHand, trades, onClose,
}: ResearcherViewProps) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const currentElapsed = now - phaseStartTime;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-xl shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-600">
            Researcher View
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-lg leading-none"
            aria-label="Close"
          >×</button>
        </div>

        <div className="px-6 py-6 space-y-8 text-sm">
          {/* Section 1 */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Live session state</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-500">Current phase</div>
                <div className="font-mono font-semibold text-primary">{phase}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-500">Deck size</div>
                <div className="font-mono font-semibold">{deckSize}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-500">Time in phase</div>
                <div className="font-mono font-semibold tabular-nums">{fmtSec(currentElapsed)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-500">Trades so far</div>
                <div className="font-mono font-semibold">{trades.length}</div>
              </div>
            </div>
            <table className="w-full text-xs border border-slate-200 rounded overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                <tr><th className="text-left px-3 py-1.5">Phase</th><th className="text-right px-3 py-1.5">Duration</th></tr>
              </thead>
              <tbody>
                {Object.entries(phaseTiming).map(([p, ms]) => (
                  <tr key={p} className="border-t border-slate-200">
                    <td className="px-3 py-1.5 font-mono">{p}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">{fmtSec(ms)}</td>
                  </tr>
                ))}
                {Object.keys(phaseTiming).length === 0 && (
                  <tr><td colSpan={2} className="px-3 py-3 text-center text-slate-400 italic">No completed phases yet.</td></tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Partner private rankings</h3>
            {partners.length === 0 ? (
              <p className="text-slate-400 italic">Not dealt yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partners.map((p, i) => (
                  <div key={p.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="font-semibold mb-2">
                      {partnerProfiles[i]?.avatar} {partnerProfiles[i]?.name}
                    </div>
                    <ol className="list-decimal list-inside space-y-0.5 text-xs font-mono">
                      {rankingToList(p.ranking).map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Trade log</h3>
            <table className="w-full text-xs border border-slate-200 rounded overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="text-left px-3 py-1.5">#</th>
                  <th className="text-left px-3 py-1.5">Partner</th>
                  <th className="text-left px-3 py-1.5">Offered</th>
                  <th className="text-left px-3 py-1.5">Requested</th>
                  <th className="text-center px-3 py-1.5">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.order} className="border-t border-slate-200">
                    <td className="px-3 py-1.5 font-mono">{t.order}</td>
                    <td className="px-3 py-1.5">{t.partnerId}</td>
                    <td className="px-3 py-1.5 font-mono">{t.gave}</td>
                    <td className="px-3 py-1.5 font-mono">{t.received ?? '—'}</td>
                    <td className={`px-3 py-1.5 text-center font-bold ${t.accepted ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.accepted ? '✓' : '✗'}
                    </td>
                  </tr>
                ))}
                {trades.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-3 text-center text-slate-400 italic">No offers yet.</td></tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Current hands</h3>
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-600 mb-1">Player</div>
              <div>{playerHand.map(v => <Chip key={v.name}>{v.name}</Chip>)}</div>
              {dealtPlayerHand.length > 0 && (
                <div className="text-[10px] text-slate-400 mt-1">
                  Dealt: {dealtPlayerHand.map(v => v.name).join(', ')}
                </div>
              )}
            </div>
            {partners.map((p, i) => (
              <div key={p.id} className="mb-3">
                <div className="text-xs font-semibold text-slate-600 mb-1">
                  {partnerProfiles[i]?.name} · offers: {p.offersMade} · accepted: {p.successes}
                </div>
                <div>{p.hand.map(v => <Chip key={v.name}>{v.name}</Chip>)}</div>
              </div>
            ))}
          </section>

          {/* Section 5 */}
          <section className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">DV + hypotheses (reference)</h3>
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p><strong>Primary DV:</strong> "What is an issue that is important to your community and why?" Code responses for values language (e.g. LIWC).</p>
              <p><strong>Hypothesis 1:</strong> Trading condition produces more value-laden language than no-priming condition.</p>
              <p><strong>Hypothesis 2:</strong> Trade-and-sort produces more thoughtful articulation than sort-only (higher meta-cognition).</p>
              <p><strong>Exploratory:</strong> Confidence expressing views; receptivity from outgroup perspective.</p>
              <p><strong>Engagement DV:</strong> Self-report interest/curiosity (post-activity).</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResearcherView;
