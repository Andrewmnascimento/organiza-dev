import { Injectable, NotFoundException } from '@nestjs/common';
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
    const column = await this.prisma.columns.findFirst({
      where: {
        id: columnId,
        board: { users: { some: { userId } } },
      },
    });
    if (!column) throw new NotFoundException('Not Found');

    const order = await this.getNextOrder(columnId);
    const title = data.title;

    const created = await this.prisma.cards.create({
      data: { title, order, columnId },
      include: { column: true },
    });
    this.eventEmitter.emit('card.created', {
      boardId: created.column.boardId,
      card: created,
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
    const card = await this.prisma.cards.findFirst({
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

    if (!card) throw new NotFoundException('Not Found');

    return card;
  }

  // GET /cards/:id - returns card with its column
  async findOne(cardId: string, userId: string) {
    const card = await this.findCardAndAssert(cardId, userId);
    // return with full column included
    return card;
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
      const targetColumn = await this.prisma.columns.findUnique({
        where: {
          id: dto.columnId,
          boardId: card.column.boardId,
          board: { users: { some: { userId } } },
        },
        select: { id: true },
      });

      if (!targetColumn) throw new NotFoundException('Not Found');

      data.columnId = dto.columnId;
      data.order = await this.getNextOrder(dto.columnId);
    }

    if (Object.keys(data).length === 0) {
      // nothing to update — return current record
      return this.prisma.cards.findUnique({ where: { id: cardId } });
    }

    const updated = await this.prisma.cards.update({
      where: { id: cardId },
      data,
    });

    this.eventEmitter.emit('card.updated', {
      boardId: card.column.boardId,
      card: updated,
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
    });
    return deleted;
  }
}
