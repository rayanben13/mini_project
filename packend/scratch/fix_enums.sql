-- Create missing enums safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReportStatus') THEN
        CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'ignored');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FileStatus') THEN
        CREATE TYPE "FileStatus" AS ENUM ('pending', 'accepted', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RelatedType') THEN
        CREATE TYPE "RelatedType" AS ENUM ('user', 'file', 'study_list');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Privacy') THEN
        CREATE TYPE "Privacy" AS ENUM ('public', 'private');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AcademicYear') THEN
        CREATE TYPE "AcademicYear" AS ENUM ('L1', 'L2', 'L3', 'M1', 'M2');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Roles') THEN
        CREATE TYPE "Roles" AS ENUM ('user', 'admin', 'guest');
    END IF;
END $$;

-- Alter columns safely to use the new enums
-- Handle columns with defaults by dropping and re-adding them

-- file_reports.status
ALTER TABLE "file_reports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "file_reports" ALTER COLUMN "status" TYPE "ReportStatus" USING "status"::"ReportStatus";
ALTER TABLE "file_reports" ALTER COLUMN "status" SET DEFAULT 'pending';

-- files.status
ALTER TABLE "files" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "files" ALTER COLUMN "status" TYPE "FileStatus" USING "status"::"FileStatus";
ALTER TABLE "files" ALTER COLUMN "status" SET DEFAULT 'pending';

-- notifications.related_type
ALTER TABLE "notifications" ALTER COLUMN "related_type" TYPE "RelatedType" USING "related_type"::"RelatedType";

-- study_lists.privacy
ALTER TABLE "study_lists" ALTER COLUMN "privacy" DROP DEFAULT;
ALTER TABLE "study_lists" ALTER COLUMN "privacy" TYPE "Privacy" USING "privacy"::"Privacy";
ALTER TABLE "study_lists" ALTER COLUMN "privacy" SET DEFAULT 'public';

-- subjects.academic_year
ALTER TABLE "subjects" ALTER COLUMN "academic_year" TYPE "AcademicYear" USING "academic_year"::"AcademicYear";

-- university_majors.academic_year
ALTER TABLE "university_majors" ALTER COLUMN "academic_year" TYPE "AcademicYear" USING "academic_year"::"AcademicYear";

-- user_information.academic_year
ALTER TABLE "user_information" ALTER COLUMN "academic_year" TYPE "AcademicYear" USING "academic_year"::"AcademicYear";

-- users.role
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Roles" USING "role"::"Roles";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'guest';

-- Add missing indexes
CREATE INDEX IF NOT EXISTS "idx_reports_status" ON "file_reports"("status");
CREATE INDEX IF NOT EXISTS "idx_files_status" ON "files"("status");
CREATE INDEX IF NOT EXISTS "idx_notifications_type" ON "notifications"("related_type");
CREATE INDEX IF NOT EXISTS "idx_study_lists_privacy" ON "study_lists"("privacy");
CREATE INDEX IF NOT EXISTS "idx_subjects_year" ON "subjects"("academic_year");
CREATE INDEX IF NOT EXISTS "idx_user_information_year" ON "user_information"("academic_year");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");
