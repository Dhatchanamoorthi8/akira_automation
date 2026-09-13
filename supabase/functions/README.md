# Supabase Edge Functions (Future Phase)

This directory is reserved for server-side edge functions, including:
1. `send-enquiry-email`: Triggered on `enquiries` table insert to dispatch transactional notifications to engineering.
2. `cleanup-orphaned-images`: Scheduled cron job to purge unreferenced Storage objects.
