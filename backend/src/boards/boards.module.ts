import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardsController } from './boards.controller';
import { BoardsMemberGuard } from './boards.member.guard';
import { BoardsService } from './boards.service';

@Module({
  imports: [AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardsMemberGuard],
  exports: [BoardsMemberGuard],
})
export class BoardsModule {}
