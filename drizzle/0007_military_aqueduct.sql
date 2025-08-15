UPDATE "campaign" SET "expiry_date" = NULL WHERE "expiry_date" = '';

ALTER TABLE "campaign" ALTER COLUMN "expiry_date" SET DATA TYPE timestamp USING "expiry_date"::timestamp;