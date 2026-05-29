import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItem } from './order.item.dto';

export class ReorderCardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  cards: OrderItem[];
}
