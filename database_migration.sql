-- Database Migration for Project Progress Tracking
-- Run this SQL script in your PostgreSQL database


-- Add new columns to Projects table
ALTER TABLE "Projects" 
ADD COLUMN IF NOT EXISTS "assignedFreelancerId" UUID,
ADD COLUMN IF NOT EXISTS "progressPercentage" INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "progressNotes" TEXT,
ADD COLUMN IF NOT EXISTS "lastProgressUpdate" TIMESTAMP;

-- Add constraint for progress percentage (0-100)
ALTER TABLE "Projects"
DROP CONSTRAINT IF EXISTS "Projects_progressPercentage_check";

ALTER TABLE "Projects"
ADD CONSTRAINT "Projects_progressPercentage_check" 
CHECK ("progressPercentage" >= 0 AND "progressPercentage" <= 100);

-- Add foreign key constraint for assignedFreelancerId
ALTER TABLE "Projects"
DROP CONSTRAINT IF EXISTS "Projects_assignedFreelancerId_fkey";

ALTER TABLE "Projects"
ADD CONSTRAINT "Projects_assignedFreelancerId_fkey"
FOREIGN KEY ("assignedFreelancerId")
REFERENCES "Users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Projects'
AND column_name IN ('assignedFreelancerId', 'progressPercentage', 'progressNotes', 'lastProgressUpdate');

-- Success message
SELECT 'Database migration completed successfully!' AS status;

