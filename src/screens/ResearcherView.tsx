import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Value } from '../data/values';
import { PartnerState, Ranking } from '../lib/tradeEngine';
import { GamePhase, PartnerDisplay, TradeRecord, Condition } from '../hooks/useGameState';

interface ResearcherViewProps {
  phase: GamePhase;
  phaseTiming: Record<string, number>;
  phaseStartTime: number;
  condition: Condition;
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

interface SessionRow {
  id: string;
  created_at: string;
  condition: string;
  top_selection: string[] | null;
  successful_trades: number | null;
  total_offers: number | null;
  timing: Record<string, number> | null;
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()}, ${hh}:${mm}`;
};

const AllSessionsTab = () => {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setErr(error.message);
    else setRows((data ?? []) as unknown as SessionRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const total = rows.length;
  const valuesN = rows.filter(r => r.condition === 'values').length;
  const issuesN = rows.filter(r => r.condition === 'issues').length;
  const pct = (n: number) => total ? `${Math.round((n/total)*100)}%` : '0%';
  const avgSucc = total
    ? (rows.reduce((s, r) => s + (r.successful_trades ?? 0), 0) / total).toFixed(1)
    : '0';
  const avgTradeSec = total
    ? (rows.reduce((s, r) => s + ((r.timing?.trade ?? 0) / 1000), 0) / total).toFixed(1)
    : '0';

  const exportCsv = () => {
    const header = ['date','condition','top_selection','successful_trades','total_offers','trade_time_s','sort_time_s'];
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header, ...rows.map(s => [
      s.created_at,
      s.condition,
      (s.top_selection || []).join(' | '),
      s.successful_trades ?? '',
      s.total_offers ?? '',
      s.timing?.trade ? (s.timing.trade / 1000).toFixed(1) : '',
      s.timing?.sort ? (s.timing.sort / 1000).toFixed(1) : '',
    ])].map(row => row.map(escape).join(',')).join('\n');

    const blob = new Blob([lines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-[10px] uppercase text-slate-500">Total</div>
          <div className="font-mono font-semibold">{total}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-[10px] uppercase text-slate-500">Values</div>
          <div className="font-mono font-semibold">{valuesN} <span className="text-slate-400">({pct(valuesN)})</span></div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-[10px] uppercase text-slate-500">Issues</div>
          <div className="font-mono font-semibold">{issuesN} <span className="text-slate-400">({pct(issuesN)})</span></div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-[10px] uppercase text-slate-500">Avg trades/session</div>
          <div className="font-mono font-semibold">{avgSucc}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-[10px] uppercase text-slate-500">Avg trade time</div>
          <div className="font-mono font-semibold">{avgTradeSec}s</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={fetchSessions}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded px-3 py-1.5 font-medium"
        >Refresh</button>
        <button
          onClick={exportCsv}
          disabled={total === 0}
          className="text-xs bg-primary text-primary-foreground rounded px-3 py-1.5 font-medium disabled:opacity-50"
        >Export CSV</button>
        {loading && <span className="text-xs text-slate-500 self-center">Loading…</span>}
        {err && <span className="text-xs text-rose-600 self-center">{err}</span>}
      </div>

      <div className="max-h-[420px] overflow-y-auto border border-slate-200 rounded">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] sticky top-0">
            <tr>
              <th className="text-left px-3 py-1.5">Date</th>
              <th className="text-left px-3 py-1.5">Cond.</th>
              <th className="text-left px-3 py-1.5">Top 3</th>
              <th className="text-left px-3 py-1.5">Trades</th>
              <th className="text-right px-3 py-1.5">Trade s</th>
              <th className="text-right px-3 py-1.5">Sort s</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-slate-200">
                <td className="px-3 py-1.5 font-mono whitespace-nowrap">{fmtDate(r.created_at)}</td>
                <td className="px-3 py-1.5">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    r.condition === 'values'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>{r.condition}</span>
                </td>
                <td className="px-3 py-1.5">{(r.top_selection || []).join(', ') || '—'}</td>
                <td className="px-3 py-1.5 font-mono">{r.successful_trades ?? 0}/{r.total_offers ?? 0}</td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                  {r.timing?.trade ? (r.timing.trade / 1000).toFixed(1) : '—'}
                </td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                  {r.timing?.sort ? (r.timing.sort / 1000).toFixed(1) : '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400 italic">No sessions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ResearcherView = ({
  phase, phaseTiming, phaseStartTime, condition,
  partners, partnerProfiles, playerHand, dealtPlayerHand, trades, onClose,
}: ResearcherViewProps) => {
  const [now, setNow] = useState(Date.now());
  const [tab, setTab] = useState<'current' | 'all'>('current');
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const currentElapsed = now - phaseStartTime;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-xl shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-600">
            Researcher View
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-lg leading-none"
            aria-label="Close"
          >×</button>
        </div>

        <div className="px-6 pt-4 border-b border-slate-200 flex gap-1">
          {(['current', 'all'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-medium px-3 py-2 rounded-t-md border-b-2 ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >{t === 'current' ? 'Current Session' : 'All Sessions'}</button>
          ))}
        </div>

        <div className="px-6 py-6 space-y-8 text-sm">
          {tab === 'all' ? <AllSessionsTab /> : (
          <>
          {/* Section 1 */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Live session state</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-500">Current phase</div>
                <div className="font-mono font-semibold text-primary">{phase}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] uppercase text-slate-500">Condition</div>
                <div className="font-mono font-semibold">{condition}</div>
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
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearcherView;
