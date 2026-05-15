import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnsService } from './columns.service';
import { BoardsMemberGuard } from './boards.member.guard';

@UseGuards(AuthGuard)
@Controller()
export class ColumnsController {
  constructor(private service: ColumnsService) {}

  @UseGuards(BoardsMemberGuard)
  @Post('/boards/:boardId/columns')
  create(@Body() body: CreateColumnDto, @Param('boardId') boardId: string) {
    return this.service.create(body, boardId);
  }

  @UseGuards(BoardsMemberGuard)
  @Get('/boards/:boardId/columns')
  findAll(@Param('boardId') boardId: string) {
    return this.service.findAll(boardId);
  }

  @Patch('columns/:id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateColumnDto,
    @Req() request: FastifyRequest,
  ) {
    return this.service.update(id, body, request.user.id);
  }

  @Delete('columns/:id')
  remove(@Param('id') id: string, @Req() request: FastifyRequest) {
    return this.service.remove(id, request.user.id);
  }
}
