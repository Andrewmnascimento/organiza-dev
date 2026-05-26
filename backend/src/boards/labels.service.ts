import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LabelsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(boardId: string, dto: CreateLabelDto, userId: string) {
    await this.prisma.boards.findFirstOrThrow({
      where: {
        id: boardId,
        users: { some: { userId } },
      },
    });

    const { name, color } = dto;
    const created = await this.prisma.labels.create({
      data: { name, color, boardId },
    });
    this.eventEmitter.emit('label.created', {
      boardId,
      label: created,
      userId,
    });
    return created;
  }

  async findOne(labelId: string, userId: string) {
    return await this.prisma.labels.findUniqueOrThrow({
      where: { id: labelId, board: { users: { some: { userId } } } },
    });
  }

  async update(labelId: string, dto: UpdateLabelDto, userId: string) {
    const label = await this.prisma.labels.findUniqueOrThrow({
      where: { id: labelId, board: { users: { some: { userId } } } },
    });

    const data: Record<string, any> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.color !== undefined) data.color = dto.color;

    if (Object.keys(data).length === 0) {
      return this.prisma.labels.findUniqueOrThrow({ where: { id: labelId } });
    }

    const updated = await this.prisma.labels.update({
      where: { id: labelId },
      data,
    });
    this.eventEmitter.emit('label.updated', {
      boardId: label.boardId,
      label: updated,
      userId,
    });
    return updated;
  }

  async remove(labelId: string, userId: string) {
    const label = await this.prisma.labels.findUniqueOrThrow({
      where: { id: labelId, board: { users: { some: { userId } } } },
    });

    const deleted = await this.prisma.labels.delete({ where: { id: labelId } });
    this.eventEmitter.emit('label.deleted', {
      boardId: label.boardId,
      label: deleted,
      userId,
    });
    return deleted;
  }

  async linkToCard(cardId: string, labelId: string, userId: string) {
    // verify card exists
    const card = await this.prisma.cards.findUniqueOrThrow({
      where: { id: cardId, column: { board: { users: { some: { userId } } } } },
      include: { column: { select: { boardId: true } } },
    });

    // verify label exists
    const label = await this.prisma.labels.findUniqueOrThrow({
      where: { id: labelId },
    });

    // ensure label belongs to the same board as the card
    if (label.boardId !== card.column.boardId)
      throw new NotFoundException('Not Found');

    const created = await this.prisma.cardLabels.create({
      data: { cardId, labelId },
    });
    this.eventEmitter.emit('label.linked', {
      boardId: label.boardId,
      card,
      label,
      userId,
    });
    return created;
  }

  async unlinkFromCard(cardId: string, labelId: string, userId: string) {
    // verify card exists
    const card = await this.prisma.cards.findUniqueOrThrow({
      where: { id: cardId, column: { board: { users: { some: { userId } } } } },
      include: { column: { select: { boardId: true } } },
    });

    const relation = await this.prisma.cardLabels.findFirstOrThrow({
      where: { cardId, labelId },
    });

    await this.prisma.cardLabels.delete({
      where: {
        cardId_labelId: { cardId, labelId },
      },
    });
    const label = await this.prisma.labels.findUniqueOrThrow({
      where: { id: labelId },
    });
    this.eventEmitter.emit('label.unlinked', {
      boardId: card.column.boardId,
      card,
      label,
      userId,
    });
    return relation;
  }
}
