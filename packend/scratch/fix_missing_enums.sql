-- Create missing enums safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FileType') THEN
        CREATE TYPE "FileType" AS ENUM ('TD', 'TP', 'COURS', 'EF', 'CC', 'RESUME', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FileLikeType') THEN
        CREATE TYPE "FileLikeType" AS ENUM ('LIKE', 'DISLIKE');
    END IF;
END $$;

-- Alter columns safely to use the new enums
-- files.type
ALTER TABLE "files" ALTER COLUMN "type" TYPE "FileType" USING "type"::"FileType";

-- files_likes.type
ALTER TABLE "files_likes" ALTER COLUMN "type" TYPE "FileLikeType" USING "type"::"FileLikeType";

-- Add missing indexes
CREATE INDEX IF NOT EXISTS "idx_files_type" ON "files"("type");
CREATE INDEX IF NOT EXISTS "idx_files_likes_type" ON "files_likes"("type");
