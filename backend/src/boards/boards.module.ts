import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardsController } from './boards.controller';
import { BoardsMemberGuard } from './boards.member.guard';
import { BoardsService } from './boards.service';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

@Module({
  imports: [AuthModule],
  controllers: [BoardsController, ColumnsController],
  providers: [BoardsService, ColumnsService],
  exports: [BoardsMemberGuard],
})
export class BoardsModule {}
