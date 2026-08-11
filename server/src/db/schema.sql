CREATE EXTENSION IF NOT EXISTS citext;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  email         CITEXT       NOT NULL,
  password_hash TEXT         NOT NULL,
  address       VARCHAR(400) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'NORMAL_USER',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_name_length CHECK (char_length(name) BETWEEN 20 AND 60),
  CONSTRAINT users_address_length CHECK (char_length(address) <= 400),
  CONSTRAINT users_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')
);

CREATE TABLE IF NOT EXISTS stores (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      CITEXT       NOT NULL,
  address    VARCHAR(400) NOT NULL,
  owner_id   BIGINT       NULL REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT stores_email_unique UNIQUE (email),
  CONSTRAINT stores_name_length CHECK (char_length(name) BETWEEN 20 AND 60),
  CONSTRAINT stores_address_length CHECK (char_length(address) <= 400),
  CONSTRAINT stores_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')
);

CREATE TABLE IF NOT EXISTS ratings (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  store_id   BIGINT      NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
  score      SMALLINT    NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ratings_score_range CHECK (score BETWEEN 1 AND 5),
  CONSTRAINT ratings_user_store_unique UNIQUE (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_name_idx ON users (lower(name));
CREATE INDEX IF NOT EXISTS stores_owner_idx ON stores (owner_id);
CREATE INDEX IF NOT EXISTS stores_name_idx ON stores (lower(name));
CREATE INDEX IF NOT EXISTS ratings_store_idx ON ratings (store_id);
CREATE INDEX IF NOT EXISTS ratings_user_idx ON ratings (user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS stores_set_updated_at ON stores;
CREATE TRIGGER stores_set_updated_at
BEFORE UPDATE ON stores
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS ratings_set_updated_at ON ratings;
CREATE TRIGGER ratings_set_updated_at
BEFORE UPDATE ON ratings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE VIEW store_rating_summary AS
SELECT
  s.id                                        AS store_id,
  COALESCE(ROUND(AVG(r.score)::numeric, 2), 0) AS average_rating,
  COUNT(r.id)                                  AS rating_count
FROM stores s
LEFT JOIN ratings r ON r.store_id = s.id
GROUP BY s.id;
