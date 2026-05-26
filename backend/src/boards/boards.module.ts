import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardsController } from './boards.controller';
import { BoardsMemberGuard } from './boards.member.guard';
import { BoardsService } from './boards.service';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [
    BoardsController,
    ColumnsController,
    CardsController,
    LabelsController,
  ],
  providers: [
    BoardsService,
    ColumnsService,
    CardsService,
    LabelsService,
    BoardsMemberGuard,
    PrismaService,
  ],
  exports: [BoardsMemberGuard],
})
export class BoardsModule {}
