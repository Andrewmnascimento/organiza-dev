import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateColumnDto, boardId: string) {
    const last = await this.prisma.columns.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = last ? last.order + 1 : 0;

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

  async update(columnId: string, dto: UpdateColumnDto, userId: string) {
    const column = await this.prisma.columns.findUniqueOrThrow({
      where: {
        id: columnId,
        board: {
          users: {
            some: { userId },
          },
        },
      },
    });

    if (!column) throw new ForbiddenException('Forbidden');

    return await this.prisma.columns.update({
      where: { id: columnId },
      data: { name: dto.name },
    });
  }

  async remove(columnId: string, userId: string) {
    const column = await this.prisma.columns.findFirstOrThrow({
      where: {
        id: columnId,
        board: {
          users: {
            some: { userId },
          },
        },
      },
    });

    if (!column) throw new ForbiddenException('Forbidden');

    return this.prisma.columns.delete({
      where: { id: columnId },
    });
  }
}
