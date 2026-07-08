CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  condition TEXT NOT NULL,
  deck_version TEXT,
  dealt_hand JSONB,
  final_hand JSONB,
  top_selection JSONB,
  total_offers INTEGER,
  successful_trades INTEGER,
  trades JSONB,
  timing JSONB,
  partner_rankings JSONB,
  raw JSONB
);
GRANT SELECT, INSERT ON public.sessions TO anon;
GRANT SELECT, INSERT ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert sessions" ON public.sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read sessions" ON public.sessions FOR SELECT TO anon, authenticated USING (true);