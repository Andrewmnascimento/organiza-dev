-- DropIndex
DROP INDEX "Cards_id_columnId_idx";

-- DropIndex
DROP INDEX "Columns_id_boardId_idx";

-- DropIndex
DROP INDEX "Comments_id_cardId_userId_idx";

-- DropIndex
DROP INDEX "UserOnBoards_userId_boardId_idx";

-- AlterTable
ALTER TABLE "Columns" ALTER COLUMN "order" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Cards_columnId_idx" ON "Cards"("columnId");

-- CreateIndex
CREATE INDEX "Columns_boardId_idx" ON "Columns"("boardId");

-- CreateIndex
CREATE INDEX "Comments_cardId_userId_idx" ON "Comments"("cardId", "userId");
