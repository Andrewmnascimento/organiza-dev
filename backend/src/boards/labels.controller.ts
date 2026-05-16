import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { BoardsMemberGuard as BoardMemberGuard } from './boards.member.guard';
import { LabelsService } from './labels.service';

@Controller()
export class LabelsController {
  constructor(
    @Inject(LabelsService)
    private readonly labelsService: LabelsService,
  ) {}

  @UseGuards(AuthGuard, BoardMemberGuard)
  @Post('/boards/:boardId/labels')
  create(@Param('boardId') boardId: string, @Body() body: CreateLabelDto) {
    return this.labelsService.create(boardId, body);
  }

  @UseGuards(AuthGuard)
  @Get('/labels/:labelId')
  findOne(@Param('labelId') labelId: string, @Req() request: FastifyRequest) {
    return this.labelsService.findOne(labelId, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('/labels/:labelId')
  update(
    @Param('labelId') labelId: string,
    @Body() dto: UpdateLabelDto,
    @Req() request: FastifyRequest,
  ) {
    return this.labelsService.update(labelId, dto, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('/labels/:labelId')
  remove(@Param('labelId') labelId: string, @Req() request: FastifyRequest) {
    return this.labelsService.remove(labelId, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('/cards/:cardId/labels/:labelId')
  linkToCard(
    @Param('cardId') cardId: string,
    @Param('labelId') labelId: string,
    @Req() request: FastifyRequest,
  ) {
    return this.labelsService.linkToCard(cardId, labelId, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('/cards/:cardId/labels/:labelId')
  unlinkFromCard(
    @Param('cardId') cardId: string,
    @Param('labelId') labelId: string,
    @Req() request: FastifyRequest,
  ) {
    return this.labelsService.unlinkFromCard(cardId, labelId, request.user.id);
  }
}
