-- Invoke isolated therapist-next-step email outbox every minute.
-- Schedules ONLY new first-step qualification invites, not the paused interview campaign.
do $cron$
begin
  if not exists (select 1 from cron.job where jobname='therapist-application-email-worker') then
    perform cron.schedule(
      'therapist-application-email-worker',
      '* * * * *',
      $job$
      select net.http_post(
        url := 'https://ahqauomkgflopxgnlndd.supabase.co/functions/v1/therapist-application',
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'X-Cron-Secret',
          (select decrypted_secret from vault.decrypted_secrets
             where name='cron_secret' limit 1)
        ),
        body := '{"action":"drain"}'::jsonb,
        timeout_milliseconds := 20000
      );
      $job$
    );
  end if;
end $cron$;
