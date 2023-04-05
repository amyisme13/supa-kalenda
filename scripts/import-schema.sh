#!/usr/bin/env bash

# Pass these variables when executing the script
# Example:
# DB_URL=db.old_project_ref.supabase.co DB_PASS=secret_password_here ./import-schema.sh

psql postgres://postgres:"$DB_PASS"@"$DB_URL":6543/postgres --file dump.sql
