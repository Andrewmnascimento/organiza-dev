import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ColumnsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(data: CreateColumnDto, boardId: string, userId: string) {
    const board = await this.prisma.boards.findFirstOrThrow({
      where: {
        id: boardId,
        users: { some: { userId } },
      },
      include: {
        columns: {
          orderBy: { order: 'desc' },
          take: 1,
          select: { order: true },
        },
      },
    });

    const order = board.columns[0] ? board.columns[0].order + 1 : 0;

    const created = await this.prisma.columns.create({
      data: {
        name: data.name,
        boardId: boardId,
        order,
      },
    });

    this.eventEmitter.emit('column.created', {
      boardId: created.boardId,
      column: created,
      userId,
    });
    return created;
  }

  findAll(boardId: string) {
    return this.prisma.boards.findUniqueOrThrow({
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

    const updated = await this.prisma.columns.update({
      where: { id: columnId },
      data: { name: dto.name },
    });

    this.eventEmitter.emit('column.updated', {
      boardId: column.boardId,
      column: updated,
      userId,
    });
    return updated;
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

    const deleted = await this.prisma.columns.delete({
      where: { id: columnId },
    });
    this.eventEmitter.emit('column.deleted', {
      boardId: column.boardId,
      column: deleted,
      userId,
    });
    return deleted;
  }
}
