import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}
  async create(data: CreateCardDto, columnId: string, userId: string) {
    await this.prisma.columns.findFirstOrThrow({
      where: {
        id: columnId,
        board: { users: { some: { userId } } },
      },
    });

    const order = await this.getNextOrder(columnId);

    const created = await this.prisma.cards.create({
      data: { title: data.title, order, columnId },
      include: { column: true },
    });
    this.eventEmitter.emit('card.created', {
      boardId: created.column.boardId,
      card: created,
      userId,
    });
    return created;
  }

  private async getNextOrder(columnId: string) {
    const last = await this.prisma.cards.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
    });
    const order = last ? last.order + 1 : 0;
    return order;
  }

  private async findCardAndAssert(cardId: string, userId: string) {
    return await this.prisma.cards.findFirstOrThrow({
      where: {
        id: cardId,
        column: {
          board: {
            users: {
              some: { userId },
            },
          },
        },
      },
      include: { column: true },
    });
  }

  // GET /cards/:id - returns card with its column
  async findOne(cardId: string, userId: string) {
    return await this.findCardAndAssert(cardId, userId);
  }

  // PATCH /cards/:id - partial updates and optional movement
  async update(cardId: string, dto: UpdateCardDto, userId: string) {
    const card = await this.findCardAndAssert(cardId, userId);

    const data: Record<string, any> = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;

    // Movement logic: if columnId provided and different, validate and move.
    if (
      dto.columnId !== undefined &&
      dto.columnId !== null &&
      dto.columnId !== card.column.id
    ) {
      await this.prisma.columns.findUniqueOrThrow({
        where: {
          id: dto.columnId,
          boardId: card.column.boardId,
          board: { users: { some: { userId } } },
        },
        select: { id: true },
      });

      data.columnId = dto.columnId;
      data.order = await this.getNextOrder(dto.columnId);
    }

    if (Object.keys(data).length === 0) {
      // nothing to update — return current record
      return this.prisma.cards.findUniqueOrThrow({ where: { id: cardId } });
    }

    const updated = await this.prisma.cards.update({
      where: { id: cardId },
      data,
    });

    this.eventEmitter.emit('card.updated', {
      boardId: card.column.boardId,
      card: updated,
      userId,
    });
    return updated;
  }

  // DELETE /cards/:id - permanent removal
  async remove(cardId: string, userId: string) {
    const card = await this.findCardAndAssert(cardId, userId);
    const deleted = await this.prisma.cards.delete({ where: { id: cardId } });
    this.eventEmitter.emit('card.deleted', {
      boardId: card.column.boardId,
      card: deleted,
      userId,
    });
    return deleted;
  }
}
