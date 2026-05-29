import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LabelsService } from './labels.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  boards: {
    findFirstOrThrow: vi.fn(),
  },
  labels: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  cards: {
    findUniqueOrThrow: vi.fn(),
  },
  cardLabels: {
    create: vi.fn(),
    findFirstOrThrow: vi.fn(),
    delete: vi.fn(),
  },
};

const mockEventEmitter = {
  emit: vi.fn(),
};

describe('LabelsService', () => {
  let service: LabelsService;

  beforeEach(() => {
    Object.values(mockPrisma).forEach((group) =>
      Object.values(group).forEach((mockFn) => mockFn.mockReset()),
    );
    Object.values(mockEventEmitter).forEach((mockFn) => mockFn.mockReset());
    service = new LabelsService(
      mockPrisma as unknown as PrismaService,
      mockEventEmitter as unknown as EventEmitter2,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create - happy path: label created and event emitted', async () => {
    const boardId = 'board-1';
    const userId = 'user-1';
    const dto = { name: 'Label', color: '#fff' };

    mockPrisma.boards.findFirstOrThrow.mockResolvedValue({ id: boardId });
    const created = {
      id: 'label-1',
      name: dto.name,
      color: dto.color,
      boardId,
    };
    mockPrisma.labels.create.mockResolvedValue(created);

    const result = await service.create(boardId, dto, userId);

    expect(mockPrisma.boards.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: boardId, users: { some: { userId } } },
    });
    expect(mockPrisma.labels.create).toHaveBeenCalledWith({
      data: { name: dto.name, color: dto.color, boardId },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('label.created', {
      boardId,
      label: created,
      userId,
    });
    expect(result).toEqual(created);
  });

  it('create - board not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    mockPrisma.boards.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.create(
        'missing-board',
        { name: 'Label', color: '#fff' },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  // FIND ONE
  it('findOne - happy path: returns label', async () => {
    const labelId = 'label-1';
    const userId = 'user-1';
    const label = { id: labelId };

    mockPrisma.labels.findUniqueOrThrow.mockResolvedValue(label);

    const result = await service.findOne(labelId, userId);

    expect(mockPrisma.labels.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: labelId, board: { users: { some: { userId } } } },
    });
    expect(result).toEqual(label);
  });

  it('findOne - not found: throws PrismaClientKnownRequestError', async () => {
    mockPrisma.labels.findUniqueOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(service.findOne('missing', 'user-1')).rejects.toBeInstanceOf(
      PrismaClientKnownRequestError,
    );
  });

  // UPDATE
  it('update - happy path: label updated and event emitted', async () => {
    const labelId = 'label-1';
    const userId = 'user-1';
    const dto = { name: 'Updated', color: '#000' };
    const existing = { id: labelId, boardId: 'board-1' };

    mockPrisma.labels.findUniqueOrThrow.mockResolvedValue(existing);
    const updated = { id: labelId, name: dto.name, color: dto.color };
    mockPrisma.labels.update.mockResolvedValue(updated);

    const result = await service.update(labelId, dto, userId);

    expect(mockPrisma.labels.update).toHaveBeenCalledWith({
      where: { id: labelId },
      data: { name: dto.name, color: dto.color },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('label.updated', {
      boardId: existing.boardId,
      label: updated,
      userId,
    });
    expect(result).toEqual(updated);
  });

  it('update - no changes: returns current record and does not emit', async () => {
    const labelId = 'label-1';
    const userId = 'user-1';
    const existing = { id: labelId, boardId: 'board-1' };
    const current = { id: labelId, name: 'Current' };

    mockPrisma.labels.findUniqueOrThrow
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(current);

    const result = await service.update(labelId, {}, userId);

    expect(mockPrisma.labels.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: labelId },
    });
    expect(result).toEqual(current);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('update - not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    mockPrisma.labels.findUniqueOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.update('missing', { name: 'x' }, 'user-1'),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  // REMOVE
  it('remove - happy path: label deleted and event emitted', async () => {
    const labelId = 'label-1';
    const userId = 'user-1';
    const existing = { id: labelId, boardId: 'board-1' };

    mockPrisma.labels.findUniqueOrThrow.mockResolvedValue(existing);
    const deleted = { id: labelId };
    mockPrisma.labels.delete.mockResolvedValue(deleted);

    const result = await service.remove(labelId, userId);

    expect(mockPrisma.labels.delete).toHaveBeenCalledWith({
      where: { id: labelId },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('label.deleted', {
      boardId: existing.boardId,
      label: deleted,
      userId,
    });
    expect(result).toEqual(deleted);
  });

  it('remove - not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    mockPrisma.labels.findUniqueOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(service.remove('missing', 'user-1')).rejects.toBeInstanceOf(
      PrismaClientKnownRequestError,
    );
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  // LINK
  it('linkToCard - happy path: links label and emits event', async () => {
    const cardId = 'card-1';
    const labelId = 'label-1';
    const userId = 'user-1';
    const card = { id: cardId, column: { boardId: 'board-1' } };
    const label = { id: labelId, boardId: 'board-1' };
    const relation = { cardId, labelId };

    mockPrisma.cards.findUniqueOrThrow.mockResolvedValue(card);
    mockPrisma.labels.findUniqueOrThrow.mockResolvedValue(label);
    mockPrisma.cardLabels.create.mockResolvedValue(relation);

    const result = await service.linkToCard(cardId, labelId, userId);

    expect(mockPrisma.cards.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: cardId,
        column: { board: { users: { some: { userId } } } },
      },
      include: { column: { select: { boardId: true } } },
    });
    expect(mockPrisma.cardLabels.create).toHaveBeenCalledWith({
      data: { cardId, labelId },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('label.linked', {
      boardId: label.boardId,
      card,
      label,
      userId,
    });
    expect(result).toEqual(relation);
  });

  it('linkToCard - label not on same board: throws NotFoundException and does not emit', async () => {
    const card = { id: 'card-1', column: { boardId: 'board-1' } };
    const label = { id: 'label-1', boardId: 'board-2' };

    mockPrisma.cards.findUniqueOrThrow.mockResolvedValue(card);
    mockPrisma.labels.findUniqueOrThrow.mockResolvedValue(label);

    await expect(
      service.linkToCard('card-1', 'label-1', 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('linkToCard - card not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    mockPrisma.cards.findUniqueOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.linkToCard('missing-card', 'label-1', 'user-1'),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('linkToCard - label not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    const card = { id: 'card-1', column: { boardId: 'board-1' } };
    mockPrisma.cards.findUniqueOrThrow.mockResolvedValue(card);
    mockPrisma.labels.findUniqueOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.linkToCard('card-1', 'missing-label', 'user-1'),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  // UNLINK
  it('unlinkFromCard - happy path: removes relation and emits event', async () => {
    const cardId = 'card-1';
    const labelId = 'label-1';
    const userId = 'user-1';
    const card = { id: cardId, column: { boardId: 'board-1' } };
    const relation = { cardId, labelId };
    const label = { id: labelId, boardId: 'board-1' };

    mockPrisma.cards.findUniqueOrThrow.mockResolvedValue(card);
    mockPrisma.cardLabels.findFirstOrThrow.mockResolvedValue(relation);
    mockPrisma.cardLabels.delete.mockResolvedValue({});
    mockPrisma.labels.findUniqueOrThrow.mockResolvedValue(label);

    const result = await service.unlinkFromCard(cardId, labelId, userId);

    expect(mockPrisma.cardLabels.delete).toHaveBeenCalledWith({
      where: { cardId_labelId: { cardId, labelId } },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('label.unlinked', {
      boardId: card.column.boardId,
      card,
      label,
      userId,
    });
    expect(result).toEqual(relation);
  });

  it('unlinkFromCard - relation not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    mockPrisma.cards.findUniqueOrThrow.mockResolvedValue({
      id: 'card-1',
      column: { boardId: 'board-1' },
    });
    mockPrisma.cardLabels.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.unlinkFromCard('card-1', 'label-1', 'user-1'),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});
