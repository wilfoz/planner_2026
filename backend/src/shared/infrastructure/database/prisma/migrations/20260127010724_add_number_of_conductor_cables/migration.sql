/*
  Warnings:

  - Added the required column `work_id` to the `productions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_id` to the `towers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "productions" ADD COLUMN     "work_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "towers" ADD COLUMN     "color" TEXT,
ADD COLUMN     "deflection" DOUBLE PRECISION,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "structureType" TEXT,
ADD COLUMN     "work_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "works" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contractor" TEXT,
    "tension" DOUBLE PRECISION,
    "extension" DOUBLE PRECISION,
    "phases" DOUBLE PRECISION,
    "circuits" DOUBLE PRECISION,
    "lightning_rod" INTEGER,
    "number_of_conductor_cables" INTEGER,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "states" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "towers" ADD CONSTRAINT "towers_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
