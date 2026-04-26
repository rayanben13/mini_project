-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'ignored');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('TD', 'TP', 'COURS', 'EF', 'CC', 'RESUME', 'OTHER');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "FileLikeType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "RelatedType" AS ENUM ('user', 'file', 'study_list');

-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "AcademicYear" AS ENUM ('L1', 'L2', 'L3', 'M1', 'M2');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('user', 'admin', 'guest');

-- CreateTable
CREATE TABLE "daily_reminders" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER,
    "id_stuList" INTEGER,
    "reminder_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_reports" (
    "id_report" SERIAL NOT NULL,
    "id_user" INTEGER,
    "id_file" INTEGER,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "handled_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_reports_pkey" PRIMARY KEY ("id_report")
);

-- CreateTable
CREATE TABLE "files" (
    "id_file" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_subject" INTEGER NOT NULL,
    "title" VARCHAR NOT NULL,
    "creation_year" VARCHAR NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_hash" VARCHAR,
    "type" "FileType" NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id_file")
);

-- CreateTable
CREATE TABLE "follows" (
    "follower_id" INTEGER NOT NULL,
    "following_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- CreateTable
CREATE TABLE "files_likes" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_file" INTEGER NOT NULL,
    "type" "FileLikeType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studyList_likes" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_stuList" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "studyList_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" SERIAL NOT NULL,
    "id_user" INTEGER,
    "message" TEXT NOT NULL,
    "related_id" INTEGER,
    "related_type" "RelatedType" NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "study_list_files" (
    "id_stuList" INTEGER NOT NULL,
    "id_file" INTEGER NOT NULL,

    CONSTRAINT "study_list_files_pkey" PRIMARY KEY ("id_stuList","id_file")
);

-- CreateTable
CREATE TABLE "study_lists" (
    "id_stuList" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_subject" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,
    "privacy" "Privacy" NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_lists_pkey" PRIMARY KEY ("id_stuList")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id_subject" SERIAL NOT NULL,
    "university" VARCHAR(255),
    "academic_year" "AcademicYear" NOT NULL,
    "major" VARCHAR NOT NULL,
    "specialization" VARCHAR,
    "course" VARCHAR NOT NULL,
    "course_description" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id_subject")
);

-- CreateTable
CREATE TABLE "university_majors" (
    "id_M" SERIAL NOT NULL,
    "course" VARCHAR,
    "course_description" VARCHAR,
    "major" VARCHAR,
    "academic_year" "AcademicYear" NOT NULL,
    "specialization" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_majors_pkey" PRIMARY KEY ("id_M")
);

-- CreateTable
CREATE TABLE "user_information" (
    "id_user" INTEGER NOT NULL,
    "major" VARCHAR NOT NULL,
    "academic_year" "AcademicYear" NOT NULL,
    "specialization" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "university" VARCHAR(255),

    CONSTRAINT "user_information_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "fullname" VARCHAR NOT NULL,
    "img_user" TEXT,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "is_active" BOOLEAN DEFAULT false,
    "role" "Roles" NOT NULL DEFAULT 'guest',
    "level" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "saved_study_lists" (
    "id_user" INTEGER NOT NULL,
    "id_stuList" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_study_lists_pkey" PRIMARY KEY ("id_user","id_stuList")
);

-- CreateIndex
CREATE INDEX "idx_reminders_list" ON "daily_reminders"("id_stuList");

-- CreateIndex
CREATE INDEX "idx_reminders_time" ON "daily_reminders"("reminder_time");

-- CreateIndex
CREATE INDEX "idx_reminders_user" ON "daily_reminders"("id_user");

-- CreateIndex
CREATE INDEX "idx_reports_file" ON "file_reports"("id_file");

-- CreateIndex
CREATE INDEX "idx_reports_status" ON "file_reports"("status");

-- CreateIndex
CREATE INDEX "idx_reports_user" ON "file_reports"("id_user");

-- CreateIndex
CREATE INDEX "idx_files_subject" ON "files"("id_subject");

-- CreateIndex
CREATE INDEX "idx_files_user" ON "files"("id_user");

-- CreateIndex
CREATE INDEX "idx_files_creation_year" ON "files"("creation_year");

-- CreateIndex
CREATE INDEX "idx_files_hash" ON "files"("file_hash");

-- CreateIndex
CREATE INDEX "idx_files_status" ON "files"("status");

-- CreateIndex
CREATE INDEX "idx_files_type" ON "files"("type");

-- CreateIndex
CREATE INDEX "idx_follows_follower" ON "follows"("follower_id");

-- CreateIndex
CREATE INDEX "idx_follows_following" ON "follows"("following_id");

-- CreateIndex
CREATE INDEX "files_likes_id_file_idx" ON "files_likes"("id_file");

-- CreateIndex
CREATE INDEX "files_likes_id_user_idx" ON "files_likes"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "files_likes_id_user_id_file_key" ON "files_likes"("id_user", "id_file");

-- CreateIndex
CREATE INDEX "studyList_likes_id_user_idx" ON "studyList_likes"("id_user");

-- CreateIndex
CREATE INDEX "studyList_likes_id_stuList_idx" ON "studyList_likes"("id_stuList");

-- CreateIndex
CREATE UNIQUE INDEX "studyList_likes_id_user_id_stuList_key" ON "studyList_likes"("id_user", "id_stuList");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("id_user");

-- CreateIndex
CREATE INDEX "idx_notifications_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_type" ON "notifications"("related_type");

-- CreateIndex
CREATE INDEX "idx_sl_files_file" ON "study_list_files"("id_file");

-- CreateIndex
CREATE INDEX "idx_sl_files_list" ON "study_list_files"("id_stuList");

-- CreateIndex
CREATE INDEX "idx_study_lists_privacy" ON "study_lists"("privacy");

-- CreateIndex
CREATE INDEX "idx_study_lists_subject" ON "study_lists"("id_subject");

-- CreateIndex
CREATE INDEX "idx_study_lists_user" ON "study_lists"("id_user");

-- CreateIndex
CREATE INDEX "idx_subjects_course" ON "subjects"("course");

-- CreateIndex
CREATE INDEX "idx_subjects_major" ON "subjects"("major");

-- CreateIndex
CREATE INDEX "idx_subjects_year" ON "subjects"("academic_year");

-- CreateIndex
CREATE INDEX "idx_user_information_major" ON "user_information"("major");

-- CreateIndex
CREATE INDEX "idx_user_information_year" ON "user_information"("academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_username" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_saved_list" ON "saved_study_lists"("id_stuList");

-- CreateIndex
CREATE INDEX "idx_saved_user" ON "saved_study_lists"("id_user");

-- AddForeignKey
ALTER TABLE "daily_reminders" ADD CONSTRAINT "daily_reminders_id_stuList_fkey" FOREIGN KEY ("id_stuList") REFERENCES "study_lists"("id_stuList") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_reminders" ADD CONSTRAINT "daily_reminders_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_reports" ADD CONSTRAINT "file_reports_id_file_fkey" FOREIGN KEY ("id_file") REFERENCES "files"("id_file") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "file_reports" ADD CONSTRAINT "file_reports_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_id_subject_fkey" FOREIGN KEY ("id_subject") REFERENCES "subjects"("id_subject") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "files_likes" ADD CONSTRAINT "files_likes_id_file_fkey" FOREIGN KEY ("id_file") REFERENCES "files"("id_file") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files_likes" ADD CONSTRAINT "files_likes_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studyList_likes" ADD CONSTRAINT "studyList_likes_id_stuList_fkey" FOREIGN KEY ("id_stuList") REFERENCES "study_lists"("id_stuList") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studyList_likes" ADD CONSTRAINT "studyList_likes_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_list_files" ADD CONSTRAINT "study_list_files_id_file_fkey" FOREIGN KEY ("id_file") REFERENCES "files"("id_file") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_list_files" ADD CONSTRAINT "study_list_files_id_stuList_fkey" FOREIGN KEY ("id_stuList") REFERENCES "study_lists"("id_stuList") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_lists" ADD CONSTRAINT "study_lists_id_subject_fkey" FOREIGN KEY ("id_subject") REFERENCES "subjects"("id_subject") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_lists" ADD CONSTRAINT "study_lists_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_information" ADD CONSTRAINT "user_information_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saved_study_lists" ADD CONSTRAINT "saved_study_lists_id_stuList_fkey" FOREIGN KEY ("id_stuList") REFERENCES "study_lists"("id_stuList") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saved_study_lists" ADD CONSTRAINT "saved_study_lists_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

