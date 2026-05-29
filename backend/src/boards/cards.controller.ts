import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReorderCardsDto } from './dto/reorder-cards.dto';

@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get(':id')
  findOne(@Req() request: FastifyRequest, @Param('id') id: string) {
    return this.cardsService.findOne(id, request.user.id);
  }

  @Post(':columnId')
  async create(
    @Req() request: FastifyRequest,
    @Body() body: CreateCardDto,
    @Param('columnId') columnId: string,
  ) {
    return await this.cardsService.create(body, columnId, request.user.id);
  }

  @Patch('/reorder/:columnId')
  reorder(
    @Body() dto: ReorderCardsDto,
    @Req() request: FastifyRequest,
    @Param('columnId') columnId: string,
  ) {
    return this.cardsService.reorder(dto, columnId, request.user.id);
  }

  @Patch(':id')
  update(
    @Req() request: FastifyRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, dto, request.user.id);
  }

  @Delete(':id')
  remove(@Req() request: FastifyRequest, @Param('id') id: string) {
    return this.cardsService.remove(id, request.user.id);
  }
}
