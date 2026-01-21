-- CreateEnum
CREATE TYPE "STATUS_EQUIPMENT" AS ENUM ('ACTIVE', 'MAINTENANCE', 'DEMOBILIZED');

-- CreateEnum
CREATE TYPE "STATUS_PRODUCTION" AS ENUM ('EXECUTED', 'PROGRAMMED', 'PROGRESS');

-- CreateEnum
CREATE TYPE "STATUS_EMPLOYEE" AS ENUM ('ACTIVE', 'AWAY');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "towers" (
    "id" UUID NOT NULL,
    "code" INTEGER NOT NULL,
    "tower_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "distance" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "embargo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "towers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foundations" (
    "id" UUID NOT NULL,
    "project" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "excavation_volume" DOUBLE PRECISION,
    "concrete_volume" DOUBLE PRECISION,
    "backfill_volume" DOUBLE PRECISION,
    "steel_volume" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foundations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "code" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" UUID NOT NULL,
    "registration" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "STATUS_EQUIPMENT" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team_id" UUID,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "registration" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "leadership" BOOLEAN NOT NULL,
    "status" "STATUS_EMPLOYEE" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team_id" UUID,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productions" (
    "id" UUID NOT NULL,
    "status" "STATUS_PRODUCTION" NOT NULL DEFAULT 'EXECUTED',
    "comments" TEXT,
    "start_time" TIMESTAMP(3),
    "final_time" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_id" UUID NOT NULL,

    CONSTRAINT "productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FoundationToTower" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_FoundationToTower_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductionToTower" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductionToTower_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductionToTeam" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductionToTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "foundations_description_key" ON "foundations"("description");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_license_plate_key" ON "equipments"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "employees_full_name_key" ON "employees"("full_name");

-- CreateIndex
CREATE UNIQUE INDEX "productions_task_id_key" ON "productions"("task_id");

-- CreateIndex
CREATE INDEX "_FoundationToTower_B_index" ON "_FoundationToTower"("B");

-- CreateIndex
CREATE INDEX "_ProductionToTower_B_index" ON "_ProductionToTower"("B");

-- CreateIndex
CREATE INDEX "_ProductionToTeam_B_index" ON "_ProductionToTeam"("B");

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FoundationToTower" ADD CONSTRAINT "_FoundationToTower_A_fkey" FOREIGN KEY ("A") REFERENCES "foundations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FoundationToTower" ADD CONSTRAINT "_FoundationToTower_B_fkey" FOREIGN KEY ("B") REFERENCES "towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionToTower" ADD CONSTRAINT "_ProductionToTower_A_fkey" FOREIGN KEY ("A") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionToTower" ADD CONSTRAINT "_ProductionToTower_B_fkey" FOREIGN KEY ("B") REFERENCES "towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionToTeam" ADD CONSTRAINT "_ProductionToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionToTeam" ADD CONSTRAINT "_ProductionToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
