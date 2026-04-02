-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('topic', 'subtopic', 'step');

-- AlterTable  
ALTER TABLE "roadmap_progress" DROP COLUMN "nodeType";
ALTER TABLE "roadmap_progress" ADD COLUMN "nodeType" "NodeType" NOT NULL DEFAULT 'subtopic';
