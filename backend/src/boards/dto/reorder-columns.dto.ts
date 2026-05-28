import { IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ColumnOrderItem {
  @IsString()
  id: string;

  @IsInt()
  order: number;
}

export class ReorderColumnsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOrderItem)
  columns: ColumnOrderItem[];
}