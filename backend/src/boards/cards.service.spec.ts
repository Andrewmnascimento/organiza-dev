import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CardsService } from './cards.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

const mockPrisma = {
  columns: {
    findFirstOrThrow: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  cards: {
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const mockEventEmitter = {
  emit: vi.fn(),
};

describe('CardsService', () => {
  let service: CardsService;

  beforeEach(() => {
    Object.values(mockPrisma).forEach((group) =>
      Object.values(group).forEach((mockFn) => mockFn.mockReset()),
    );
    Object.values(mockEventEmitter).forEach((mockFn) => mockFn.mockReset());
    service = new CardsService(
      mockPrisma as unknown as PrismaService,
      mockEventEmitter as unknown as EventEmitter2,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create - happy path: card created and event emitted', async () => {
    const columnId = 'col-1';
    const userId = 'user-1';
    const dto = { title: 'New Card' };

    mockPrisma.columns.findFirstOrThrow.mockResolvedValue({
      id: columnId,
      boardId: 'board-1',
    });
    // getNextOrder -> no last card
    mockPrisma.cards.findFirst.mockResolvedValueOnce(null);

    const created = {
      id: 'card-1',
      title: dto.title,
      order: 0,
      columnId,
      column: { boardId: 'board-1' },
    };
    mockPrisma.cards.create.mockResolvedValue(created);

    const result = await service.create(dto, columnId, userId);

    expect(mockPrisma.columns.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: columnId,
        board: { users: { some: { userId } } },
      },
    });
    expect(mockPrisma.cards.create).toHaveBeenCalledWith({
      data: { title: dto.title, order: 0, columnId },
      include: { column: true },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('card.created', {
      boardId: created.column.boardId,
      card: created,
      userId,
    });
    expect(result).toEqual(created);
  });

  it('create - column not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    const columnId = 'missing-col';
    const userId = 'user-1';
    const dto = { title: 'New Card' };

    mockPrisma.columns.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(service.create(dto, columnId, userId)).rejects.toBeInstanceOf(
      PrismaClientKnownRequestError,
    );
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  // FIND ONE
  it('findOne - happy path: returns card', async () => {
    const cardId = 'card-1';
    const userId = 'user-1';
    const card = { id: cardId, column: { id: 'col-1', boardId: 'board-1' } };

    mockPrisma.cards.findFirstOrThrow.mockResolvedValue(card);

    const result = await service.findOne(cardId, userId);

    expect(mockPrisma.cards.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: cardId,
        column: { board: { users: { some: { userId } } } },
      },
      include: { column: true },
    });
    expect(result).toEqual(card);
  });

  it('findOne - missing id or user: throws PrismaClientKnownRequestError', async () => {
    mockPrisma.cards.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.findOne('missing-card', 'user-1'),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
  });

  // UPDATE
  it('update - card not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    mockPrisma.cards.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.update('card-x', { title: 'x' }, 'user-1'),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('update - happy path with movement and update: moves card and emits event', async () => {
    const cardId = 'card-1';
    const userId = 'user-1';
    const dto = { columnId: 'col-2', title: 'new title' };

    const existingCard = {
      id: cardId,
      title: 'old',
      column: { id: 'col-1', boardId: 'board-1' },
    };
    // findCardAndAssert
    mockPrisma.cards.findFirstOrThrow.mockResolvedValueOnce(existingCard);
    // target column exists
    mockPrisma.columns.findUniqueOrThrow.mockResolvedValue({
      id: dto.columnId,
    });
    // getNextOrder for target column -> no last card
    mockPrisma.cards.findFirst.mockResolvedValueOnce(null);

    const updated = {
      id: cardId,
      title: dto.title,
      columnId: dto.columnId,
      order: 0,
    };
    mockPrisma.cards.update.mockResolvedValue(updated);

    const result = await service.update(cardId, dto, userId);

    expect(mockPrisma.columns.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: dto.columnId,
        boardId: existingCard.column.boardId,
        board: { users: { some: { userId } } },
      },
      select: { id: true },
    });
    expect(mockPrisma.cards.update).toHaveBeenCalledWith({
      where: { id: cardId },
      data: { title: dto.title, columnId: dto.columnId, order: 0 },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('card.updated', {
      boardId: existingCard.column.boardId,
      card: updated,
      userId,
    });
    expect(result).toEqual(updated);
  });

  it('update - target column not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    const cardId = 'card-1';
    const userId = 'user-1';
    const dto = { columnId: 'missing-col' };

    const existingCard = {
      id: cardId,
      title: 'old',
      column: { id: 'col-1', boardId: 'board-1' },
    };
    mockPrisma.cards.findFirstOrThrow.mockResolvedValueOnce(existingCard);
    mockPrisma.columns.findUniqueOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(service.update(cardId, dto, userId)).rejects.toBeInstanceOf(
      PrismaClientKnownRequestError,
    );
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('update - happy path no change: returns current card and does not emit', async () => {
    const cardId = 'card-1';
    const userId = 'user-1';
    const existingCard = {
      id: cardId,
      title: 'old',
      column: { id: 'col-1', boardId: 'board-1' },
    };

    mockPrisma.cards.findFirstOrThrow.mockResolvedValueOnce(existingCard);
    const currentRecord = { id: cardId, title: 'old', columnId: 'col-1' };
    mockPrisma.cards.findUniqueOrThrow.mockResolvedValue(currentRecord);

    const result = await service.update(cardId, {}, userId);

    expect(mockPrisma.cards.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: cardId },
    });
    expect(result).toEqual(currentRecord);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('update - happy path simple change: updates title/description and emits event', async () => {
    const cardId = 'card-1';
    const userId = 'user-1';
    const dto = { title: 'new title', description: 'new desc' };

    const existingCard = {
      id: cardId,
      title: 'old',
      column: { id: 'col-1', boardId: 'board-1' },
    };
    mockPrisma.cards.findFirstOrThrow.mockResolvedValueOnce(existingCard);

    const updated = {
      id: cardId,
      title: dto.title,
      description: dto.description,
    };
    mockPrisma.cards.update.mockResolvedValue(updated);

    const result = await service.update(cardId, dto, userId);

    expect(mockPrisma.cards.update).toHaveBeenCalledWith({
      where: { id: cardId },
      data: { title: dto.title, description: dto.description },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('card.updated', {
      boardId: existingCard.column.boardId,
      card: updated,
      userId,
    });
    expect(result).toEqual(updated);
  });

  // REMOVE
  it('remove - happy path: deletes card and emits event', async () => {
    const cardId = 'card-1';
    const userId = 'user-1';
    const existingCard = {
      id: cardId,
      column: { id: 'col-1', boardId: 'board-1' },
    };

    mockPrisma.cards.findFirstOrThrow.mockResolvedValueOnce(existingCard);
    const deleted = { id: cardId, title: 'gone' };
    mockPrisma.cards.delete.mockResolvedValue(deleted);

    const result = await service.remove(cardId, userId);

    expect(mockPrisma.cards.delete).toHaveBeenCalledWith({
      where: { id: cardId },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('card.deleted', {
      boardId: existingCard.column.boardId,
      card: deleted,
      userId,
    });
    expect(result).toEqual(deleted);
  });

  it('remove - card not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    mockPrisma.cards.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.remove('missing-card', 'user-1'),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});
