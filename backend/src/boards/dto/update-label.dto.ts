import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLabelDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  name?: string;

  @IsString()
  color?: string;
}
