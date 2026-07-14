-- Fix 1: Remove SECURITY DEFINER function from authenticated-executable surface by
-- inlining the researcher check into the RLS policy (using user_roles directly),
-- then revoking EXECUTE on has_role from public/authenticated.

DROP POLICY IF EXISTS "Researchers can read sessions" ON public.sessions;

CREATE POLICY "Researchers can read sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'researcher'::public.app_role
  )
);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

-- Fix 2: Replace the always-true INSERT policy on sessions with a minimum
-- validity check so the RLS policy is not permissive-by-default.

DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.sessions;

CREATE POLICY "Anyone can insert sessions"
ON public.sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  condition IS NOT NULL
  AND length(condition) > 0
  AND length(condition) <= 64
);