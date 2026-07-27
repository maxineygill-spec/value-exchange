
CREATE OR REPLACE FUNCTION public.grant_researcher_for_allowlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) IN (
       'maxinegill@g.harvard.edu',
       'tperry@fas.harvard.edu',
       'tperry@g.harvard.edu',
       'david_kidd@gse.harvard.edu',
       'ksiegelstechler@fas.harvard.edu',
       'arushisaxena@fas.harvard.edu',
       'arushisaxena@g.harvard.edu',
       'mlopes@fas.harvard.edu',
       'jminer@fas.harvard.edu',
       'palmiter@g.harvard.edu',
       'brian_palmiter@fas.harvard.edu',
       'amelia.bertaska@gmail.com'
     ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'researcher')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_researcher ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_researcher
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_researcher_for_allowlist();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_researcher ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_researcher
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_researcher_for_allowlist();
