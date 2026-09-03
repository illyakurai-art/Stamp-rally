-- Reset database: keep admin user, artists, prizes
-- Deletes all stamps, redeems, notifications, and non-admin profiles

-- 1. Delete all stamps
DELETE FROM stamps;

-- 2. Delete all redeems
DELETE FROM redeems;

-- 3. Delete all notifications
DELETE FROM notifications;

-- 4. Delete all profiles except admin (U0007)
DELETE FROM profiles WHERE display_id != 'U0007';

-- 5. Verify: artists and prizes are untouched
-- SELECT count(*) FROM artists;   -- should be 51
-- SELECT count(*) FROM prizes;    -- should be 10
