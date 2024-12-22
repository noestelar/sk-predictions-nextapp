-- Drop existing tables if they exist
DROP TABLE IF EXISTS "results" CASCADE;
DROP TABLE IF EXISTS "predictions" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Participant" CASCADE;
DROP TABLE IF EXISTS "cutoff_time" CASCADE;

-- Create tables
CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT UNIQUE,
  "email" TEXT UNIQUE,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT
);

CREATE TABLE "Account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP(3) NOT NULL,
  UNIQUE("identifier", "token")
);

CREATE TABLE "Participant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "profilePic" TEXT NOT NULL
);

CREATE TABLE "predictions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "participantIdGifter" TEXT NOT NULL,
  "participantIdGiftee" TEXT NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE TABLE "results" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "gifterId" TEXT NOT NULL,
  "gifteeId" TEXT NOT NULL,
  FOREIGN KEY ("gifterId") REFERENCES "Participant"("id"),
  FOREIGN KEY ("gifteeId") REFERENCES "Participant"("id")
);

CREATE TABLE "cutoff_time" (
  "id" SERIAL PRIMARY KEY,
  "datetime" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Insert participants
INSERT INTO "Participant" ("id", "name", "profilePic") VALUES
  ('p1', 'Noé', '/avatars/noe.jpg'),
  ('p2', 'Miriam', '/avatars/miriam.jpg'),
  ('p3', 'Martín', '/avatars/martin.jpg'),
  ('p4', 'Iris', '/avatars/iris.jpg'),
  ('p5', 'Ilse', '/avatars/ilse.jpg'),
  ('p6', 'Alex', '/avatars/alex.jpg'),
  ('p7', 'Esteban Cesar', '/avatars/esteban.jpg'),
  ('p8', 'Brenda', '/avatars/brenda.jpg'),
  ('p9', 'Queso', '/avatars/queso.jpg')
ON CONFLICT (name) DO UPDATE SET
  "profilePic" = EXCLUDED."profilePic";

-- Set initial cutoff time (one week from now)
INSERT INTO "cutoff_time" ("datetime", "updatedAt")
VALUES (CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING; 