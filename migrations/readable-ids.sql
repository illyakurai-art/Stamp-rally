-- Migration: ID leggibili per profiles, artists, stamps
-- Esegui questo SQL nel Supabase SQL Editor (completamente idempotente)

-- 1. Sequenze
CREATE SEQUENCE IF NOT EXISTS user_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS artist_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS stamps_id_seq START 1;

-- 2. Profiles: aggiungi display_id (U0001, U0002, ...)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_id text;

UPDATE profiles
SET display_id = 'U' || lpad(nextval('user_id_seq')::text, 4, '0')
WHERE display_id IS NULL;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_display_id_unique;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_display_id_unique;
ALTER TABLE profiles ADD CONSTRAINT profiles_display_id_unique UNIQUE (display_id);

-- 3. Artists: aggiungi display_id (A0001, A0002, ...)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS display_id text;

UPDATE artists
SET display_id = 'A' || lpad(nextval('artist_id_seq')::text, 4, '0')
WHERE display_id IS NULL;

ALTER TABLE artists DROP CONSTRAINT IF EXISTS artists_display_id_unique;
ALTER TABLE artists ADD CONSTRAINT artists_display_id_unique UNIQUE (display_id);

-- 4. Stamps: migrazione colonne id, user_id, artist_id (se non già effettuata)
DO $$
BEGIN
  -- Se esiste la colonna temporanea new_id, completa lo switch
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stamps' AND column_name = 'new_id'
  ) THEN
    ALTER TABLE stamps DROP CONSTRAINT IF EXISTS stamps_pkey;
    ALTER TABLE stamps DROP COLUMN IF EXISTS id CASCADE;
    ALTER TABLE stamps RENAME COLUMN new_id TO id;
    ALTER TABLE stamps ADD PRIMARY KEY (id);
  END IF;

  -- Se esiste la colonna temporanea new_user_id, completa lo switch
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stamps' AND column_name = 'new_user_id'
  ) THEN
    ALTER TABLE stamps DROP CONSTRAINT IF EXISTS stamps_user_id_fkey;
    ALTER TABLE stamps DROP COLUMN IF EXISTS user_id CASCADE;
    ALTER TABLE stamps RENAME COLUMN new_user_id TO user_id;
  END IF;

  -- Se esiste la colonna temporanea new_artist_id, completa lo switch
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stamps' AND column_name = 'new_artist_id'
  ) THEN
    ALTER TABLE stamps DROP CONSTRAINT IF EXISTS stamps_artist_id_fkey;
    ALTER TABLE stamps DROP COLUMN IF EXISTS artist_id CASCADE;
    ALTER TABLE stamps RENAME COLUMN new_artist_id TO artist_id;
  END IF;
END $$;

-- 5. Trigger: auto-genera stamps.id su insert
CREATE OR REPLACE FUNCTION generate_stamp_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := lpad(nextval('stamps_id_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamps_id_trigger ON stamps;
CREATE TRIGGER stamps_id_trigger
  BEFORE INSERT ON stamps
  FOR EACH ROW
  EXECUTE FUNCTION generate_stamp_id();

-- 6. RPC: aggiorna add_stamp
DROP FUNCTION IF EXISTS add_stamp(text);
CREATE OR REPLACE FUNCTION add_stamp(p_artist_qr_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_display_id text;
  v_artist_display_id text;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utente non autenticato';
  END IF;

  -- Recupera display_id dell'utente
  SELECT display_id INTO v_user_display_id
  FROM profiles WHERE id = v_user_id;

  -- Se il profilo non ha un display_id, generalo/recuperalo automaticamente
  IF v_user_display_id IS NULL THEN
    INSERT INTO profiles (id, nickname, display_id)
    VALUES (
      v_user_id,
      'Utente',
      'U' || lpad(nextval('user_id_seq')::text, 4, '0')
    )
    ON CONFLICT (id) DO UPDATE
    SET display_id = COALESCE(profiles.display_id, EXCLUDED.display_id)
    RETURNING display_id INTO v_user_display_id;
  END IF;

  -- Recupera display_id dell'artista tramite qr_token
  SELECT display_id INTO v_artist_display_id
  FROM artists WHERE qr_token = p_artist_qr_token AND active = true;

  IF v_artist_display_id IS NULL THEN
    RAISE EXCEPTION 'QR token non valido o artista non attivo';
  END IF;

  -- Inserisci il timbro (evitando duplicati)
  INSERT INTO stamps (user_id, artist_id)
  VALUES (v_user_display_id, v_artist_display_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- 7. Trigger: crea profilo con display_id alla registrazione
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, nickname, display_id)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1)),
    'U' || lpad(nextval('user_id_seq')::text, 4, '0')
  )
  ON CONFLICT (id) DO UPDATE
  SET display_id = COALESCE(profiles.display_id, EXCLUDED.display_id);
  RETURN new;
END;
$$;
