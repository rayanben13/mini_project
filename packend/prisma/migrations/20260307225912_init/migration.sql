-- CreateTable
CREATE TABLE "daily_reminders" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER,
    "id_file" INTEGER,
    "reminder_time" TIME(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_reports" (
    "id_report" SERIAL NOT NULL,
    "id_user" INTEGER,
    "id_file" INTEGER,
    "reason" TEXT NOT NULL,
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
    "file_hash" VARCHAR NOT NULL,
    "type" VARCHAR NOT NULL,
    "status" VARCHAR DEFAULT 'pending',
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
CREATE TABLE "interaction" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER,
    "id_file" INTEGER,
    "id_stulist" INTEGER,
    "type" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" SERIAL NOT NULL,
    "id_user" INTEGER,
    "message" TEXT NOT NULL,
    "related_id" INTEGER,
    "related_type" VARCHAR,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "study_list_files" (
    "id_stulist" INTEGER NOT NULL,
    "id_file" INTEGER NOT NULL,

    CONSTRAINT "study_list_files_pkey" PRIMARY KEY ("id_stulist","id_file")
);

-- CreateTable
CREATE TABLE "study_lists" (
    "id_stulist" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "privacy" VARCHAR DEFAULT 'public',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_lists_pkey" PRIMARY KEY ("id_stulist")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id_subject" SERIAL NOT NULL,
    "id_university" INTEGER,
    "academic_year" VARCHAR NOT NULL,
    "major" VARCHAR NOT NULL,
    "specialization" VARCHAR,
    "course" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id_subject")
);

-- CreateTable
CREATE TABLE "universities" (
    "id_university" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "web_site" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id_university")
);

-- CreateTable
CREATE TABLE "university_majors" (
    "id_m" SERIAL NOT NULL,
    "major" VARCHAR,
    "specialization" VARCHAR,
    "course" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_majors_pkey" PRIMARY KEY ("id_m")
);

-- CreateTable
CREATE TABLE "user_information" (
    "id_user" INTEGER NOT NULL,
    "id_university" INTEGER NOT NULL,
    "academic_year" VARCHAR NOT NULL,
    "major" VARCHAR NOT NULL,
    "specialization" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

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
    "role" VARCHAR DEFAULT 'guest',
    "level" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE INDEX "idx_files_subject" ON "files"("id_subject");

-- CreateIndex
CREATE INDEX "idx_files_user" ON "files"("id_user");

-- CreateIndex
CREATE INDEX "idx_following" ON "follows"("follower_id");

-- CreateIndex
CREATE INDEX "idx_interaction_file" ON "interaction"("id_file");

-- CreateIndex
CREATE UNIQUE INDEX "interaction_id_user_id_file_key" ON "interaction"("id_user", "id_file");

-- CreateIndex
CREATE UNIQUE INDEX "interaction_id_user_id_stulist_key" ON "interaction"("id_user", "id_stulist");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_id_university_academic_year_major_specialization_c_key" ON "subjects"("id_university", "academic_year", "major", "specialization", "course");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "daily_reminders" ADD CONSTRAINT "daily_reminders_id_file_fkey" FOREIGN KEY ("id_file") REFERENCES "files"("id_file") ON DELETE CASCADE ON UPDATE NO ACTION;

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
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_id_file_fkey" FOREIGN KEY ("id_file") REFERENCES "files"("id_file") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_id_stulist_fkey" FOREIGN KEY ("id_stulist") REFERENCES "study_lists"("id_stulist") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_list_files" ADD CONSTRAINT "study_list_files_id_file_fkey" FOREIGN KEY ("id_file") REFERENCES "files"("id_file") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_list_files" ADD CONSTRAINT "study_list_files_id_stulist_fkey" FOREIGN KEY ("id_stulist") REFERENCES "study_lists"("id_stulist") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_lists" ADD CONSTRAINT "study_lists_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_id_university_fkey" FOREIGN KEY ("id_university") REFERENCES "universities"("id_university") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_information" ADD CONSTRAINT "user_information_id_university_fkey" FOREIGN KEY ("id_university") REFERENCES "universities"("id_university") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_information" ADD CONSTRAINT "user_information_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;
