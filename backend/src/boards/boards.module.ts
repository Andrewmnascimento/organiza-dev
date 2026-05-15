import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardsController } from './boards.controller';
import { BoardsMemberGuard } from './boards.member.guard';
import { BoardsService } from './boards.service';
import { BoardsColumnsController } from './boards.columns.controller';
import { CardsColumnsController } from './cards.column.controller';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

@Module({
  imports: [AuthModule],
  controllers: [
    BoardsController,
    BoardsColumnsController,
    CardsColumnsController,
    ColumnsController,
  ],
  providers: [
    BoardsService,
    BoardsMemberGuard,
    CardsColumnsController,
    ColumnsService,
  ],
  exports: [BoardsMemberGuard],
})
export class BoardsModule {}
