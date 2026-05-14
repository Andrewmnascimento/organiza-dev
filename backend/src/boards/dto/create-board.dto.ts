import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
