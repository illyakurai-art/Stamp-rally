-- Add tier 50 (Full Collection) to prizes table
INSERT INTO prizes (tier_threshold, gacha_included, extra_choice, is_full_collection)
VALUES (50, 0, 0, true)
ON CONFLICT (tier_threshold) DO UPDATE
SET gacha_included = 0,
    extra_choice = 0,
    is_full_collection = true;
