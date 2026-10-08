# Supabase Edge Functions

Edge functions keep privileged operations and secrets on the server.

## Delete staff user

`delete-staff-user` permanently removes a user from Supabase Auth. The linked
`public.profiles` row is removed by its `ON DELETE CASCADE` foreign key.

The function requires the caller to have a valid session and an active
administrator profile. It rejects self-deletion and users assigned to enquiries,
follow-ups, field visits, or attendance. It uses `SUPABASE_SERVICE_ROLE_KEY`
only inside the Edge Function and writes an activity log after deletion.

### Windows deployment

The quickest option is to run the CLI through `npx` without installing Scoop
or a global `supabase` command. The Supabase CLI requires Node.js 20 or later
when run through npm:

```powershell
node --version
npx supabase@latest --version
npx supabase@latest login
npx supabase@latest link --project-ref <your-project-ref>
npx supabase@latest db push
npx supabase@latest functions deploy delete-staff-user
```

Replace `<your-project-ref>` with the reference shown in the Supabase project
URL/dashboard. For this app, it appears to be `ocyphrcgktochijuozwe`; confirm
that is the intended project before linking. The CLI may prompt for the
database password during `db push`.

If you prefer a globally installed CLI, first install Scoop from
[scoop.sh](https://scoop.sh), reopen PowerShell, and then run:

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

The project must have `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` configured as Edge Function secrets. Supabase
provides these standard values in hosted projects.

Apply the database migration that protects field visit and attendance history:

```sh
supabase db push
```

If `db push` starts replaying the original `20260912...` migrations and fails
because a policy or table already exists, stop rather than retrying. This means
the remote database schema exists but its `supabase_migrations.schema_migrations`
history is missing or out of sync. Check the state first:

```powershell
npx supabase@latest migration list
```

Only after confirming that a migration's changes already exist in the remote
database should you mark that specific version applied. For each confirmed
version, run:

```powershell
npx supabase@latest migration repair --status applied <version>
```

Do not mark all migrations applied without checking the remote schema. Then
list migrations again and push only the remaining unapplied versions. Migration
versions in this repository must be unique.
