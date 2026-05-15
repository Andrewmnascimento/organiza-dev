import { Body, Controller, Param, UseGuards, Get, Post } from '@nestjs/common';
import { BoardsMemberGuard } from './boards.member.guard';
import { AuthGuard } from '../auth/auth.guard';
import { CreateColumnDto } from './dto/create-column.dto';
import { BoardsColumnsService } from './boards.columns.service';

@UseGuards(AuthGuard, BoardsMemberGuard)
@Controller('/boards/:boardId/columns')
export class BoardsColumnsController {
  constructor(private service: BoardsColumnsService) {}

  @Post()
  create(@Body() body: CreateColumnDto, @Param('boardId') boardId: string) {
    return this.service.create(body, boardId);
  }

  @Get()
  findAll(@Param('boardId') boardId: string) {
    return this.service.findAll(boardId);
  }
}
