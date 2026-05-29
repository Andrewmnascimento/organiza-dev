import { IsString, IsInt } from 'class-validator';

export class OrderItem {
  @IsString()
  id: string;

  @IsInt()
  order: number;
}
