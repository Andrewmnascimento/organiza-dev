import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import { BoardsMemberGuard } from './boards.member.guard';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@UseGuards(AuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@Req() request: FastifyRequest, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(request.user.id, dto);
  }

  @Get()
  findAll(@Req() request: FastifyRequest) {
    return this.boardsService.findAllByUser(request.user.id);
  }

  @UseGuards(BoardsMemberGuard)
  @Get(':boardId')
  findOne(@Param('boardId') boardId: string) {
    return this.boardsService.findOne(boardId);
  }

  @UseGuards(BoardsMemberGuard)
  @Patch(':boardId')
  update(@Param('boardId') boardId: string, @Body() dto: UpdateBoardDto) {
    return this.boardsService.update(boardId, dto);
  }

  @UseGuards(BoardsMemberGuard)
  @Delete(':boardId')
  remove(@Param('boardId') boardId: string) {
    return this.boardsService.remove(boardId);
  }
}
