import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateCardDto, columnId: string) {
    const last = await this.prisma.cards.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
    });
    const order = last ? last.order++ : 0;
    const title = data.title;

    return this.prisma.cards.create({ data: { title, order, columnId } });
  }

  private async findCardAndAssert(cardId: string, userId: string) {
    const card = await this.prisma.cards.findUnique({
      where: { id: cardId },
      include: { column: true }, // eager load column to access boardId
    });

    if (!card) throw new NotFoundException('card not found');

    const membership = await this.prisma.userOnBoards.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId: card.column.boardId,
        },
      },
      select: { userId: true },
    });

    if (!membership) throw new ForbiddenException('Unauthorized');

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
        where: { id: dto.columnId },
        select: { id: true },
      });

      if (!targetColumn) throw new NotFoundException('column not found');

      const last = await this.prisma.cards.findFirst({
        where: { columnId: dto.columnId },
        orderBy: { order: 'desc' },
      });

      data.columnId = dto.columnId;
      data.order = last ? last.order + 1 : 0;
    }

    if (Object.keys(data).length === 0) {
      // nothing to update — return current record
      return this.prisma.cards.findUnique({ where: { id: cardId } });
    }

    return this.prisma.cards.update({
      where: { id: cardId },
      data,
    });
  }

  // DELETE /cards/:id - permanent removal
  async remove(cardId: string, userId: string) {
    await this.findCardAndAssert(cardId, userId);
    return this.prisma.cards.delete({ where: { id: cardId } });
  }
}
