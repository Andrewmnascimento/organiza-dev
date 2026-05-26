import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ColumnsService } from './columns.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

const mockPrisma = {
  boards: {
    findFirstOrThrow: vi.fn(),
  },
  columns: {
    findUniqueOrThrow: vi.fn(),
    findFirstOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const mockEventEmitter = {
  emit: vi.fn(),
};

describe('ColumnsService', () => {
  let service: ColumnsService;

  beforeEach(() => {
    Object.values(mockPrisma).forEach((group) =>
      Object.values(group).forEach((mockFn) => mockFn.mockReset()),
    );
    Object.values(mockEventEmitter).forEach((mockFn) => mockFn.mockReset());
    service = new ColumnsService(
      mockPrisma as unknown as PrismaService,
      mockEventEmitter as unknown as EventEmitter2,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create - happy path: column created and event emitted', async () => {
    const boardId = 'board-1';
    const userId = 'user-1';
    const dto = { name: 'New Column' };

    mockPrisma.boards.findFirstOrThrow.mockResolvedValue({
      id: boardId,
      columns: [],
    });

    const created = {
      id: 'col-1',
      name: dto.name,
      boardId,
      order: 0,
    };
    mockPrisma.columns.create.mockResolvedValue(created);

    const result = await service.create(dto, boardId, userId);

    expect(mockPrisma.boards.findFirstOrThrow).toHaveBeenCalled();
    expect(mockPrisma.columns.create).toHaveBeenCalledWith({
      data: { name: dto.name, boardId: boardId, order: 0 },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('column.created', {
      boardId: created.boardId,
      column: created,
      userId,
    });
    expect(result).toEqual(created);
  });

  it('create - prisma error: rejects with PrismaClientKnownRequestError and does not emit', async () => {
    const boardId = 'broken-board';
    const userId = 'user-1';
    const dto = { name: 'New Column' };

    mockPrisma.boards.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Query failed', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(service.create(dto, boardId, userId)).rejects.toBeInstanceOf(
      PrismaClientKnownRequestError,
    );
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  // UPDATE
  it('update - happy path: column updated and event emitted', async () => {
    const columnId = 'col-1';
    const userId = 'user-1';
    const dto = { name: 'Updated Column' };

    const existing = {
      id: columnId,
      boardId: 'board-1',
    };
    mockPrisma.columns.findFirstOrThrow.mockResolvedValue(existing);

    const updated = { id: columnId, name: dto.name };
    mockPrisma.columns.update.mockResolvedValue(updated);

    const result = await service.update(columnId, dto, userId);

    expect(mockPrisma.columns.update).toHaveBeenCalledWith({
      where: { id: columnId },
      data: { name: dto.name },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('column.updated', {
      boardId: existing.boardId,
      column: updated,
      userId,
    });
    expect(result).toEqual(updated);
  });

  it('update - column not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    const columnId = 'missing-col';
    const userId = 'user-1';
    const dto = { name: 'Whatever' };

    mockPrisma.columns.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not Found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(service.update(columnId, dto, userId)).rejects.toBeInstanceOf(
      PrismaClientKnownRequestError,
    );
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  // REMOVE
  it('remove - happy path: deletes column and emits event', async () => {
    const columnId = 'col-1';
    const userId = 'user-1';
    const existing = {
      id: columnId,
      boardId: 'board-1',
    };

    mockPrisma.columns.findFirstOrThrow.mockResolvedValueOnce(existing);
    const deleted = { id: columnId, name: 'Gone Column' };
    mockPrisma.columns.delete.mockResolvedValue(deleted);

    const result = await service.remove(columnId, userId);

    expect(mockPrisma.columns.delete).toHaveBeenCalledWith({
      where: { id: columnId },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('column.deleted', {
      boardId: existing.boardId,
      column: deleted,
      userId,
    });
    expect(result).toEqual(deleted);
  });

  it('remove - column not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    const columnId = 'missing-col';
    const userId = 'user-1';

    mockPrisma.columns.findFirstOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Not Found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(service.remove(columnId, userId)).rejects.toBeInstanceOf(
      PrismaClientKnownRequestError,
    );
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});
