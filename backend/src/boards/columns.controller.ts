import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnsService } from './columns.service';

@UseGuards(AuthGuard)
@Controller('columns/:id')
export class ColumnsController {
  constructor(private service: ColumnsService) {}

  @Patch()
  update(
    @Param('id') id: string,
    @Body() body: UpdateColumnDto,
    @Req() request: FastifyRequest,
  ) {
    return this.service.update(id, body, request.user.id);
  }

  @Delete()
  remove(@Param('id') id: string, @Req() request: FastifyRequest) {
    return this.service.remove(id, request.user.id);
  }
}
