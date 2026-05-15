import { Controller, Post, Param, Body } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';

@Controller('/cards/:columnId')
export class CardsColumnsController {
  constructor(private service: CardsService) {}

  @Post()
  async create(
    @Body() body: CreateCardDto,
    @Param('columnId') columnId: string,
  ) {
    return await this.service.create(body, columnId);
  }
}
