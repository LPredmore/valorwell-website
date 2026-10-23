-- Retry failed and pending first-step clinician qualification invitations every minute.
-- No backfill. Does not touch or activate CRM's separate Invitation to Interview campaign.
do $block$
begin
  if not exists(select 1 from cron.job where jobname='therapist-application-invite-retry') then
    perform cron.schedule('therapist-application-invite-retry','* * * * *',$job$
      select net.http_post(
        url := 'https://ahqauomkgflopxgnlndd.supabase.co/functions/v1/therapist-application',
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'X-Cron-Secret',(select decrypted_secret from vault.decrypted_secrets where name='cron_secret' limit 1)
        ),
        body := '{"action":"send_pending_invites"}'::jsonb,
        timeout_milliseconds := 20000
      );
    $job$);
  end if;
end $block$;
