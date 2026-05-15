import { Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BoardsColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateColumnDto, boardId: string) {
    const last = await this.prisma.columns.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
    });

    const order = last ? last.order++ : 0;

    return this.prisma.columns.create({
      data: {
        name: data.name,
        boardId: boardId,
        order,
      },
    });
  }

  findAll(boardId: string) {
    return this.prisma.boards.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }
}
