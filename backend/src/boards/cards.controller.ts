import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import { CardsService } from './cards.service';
import { UpdateCardDto } from './dto/update-card.dto';

@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get(':id')
  findOne(@Req() request: FastifyRequest, @Param('id') id: string) {
    return this.cardsService.findOne(id, request.user.id);
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
