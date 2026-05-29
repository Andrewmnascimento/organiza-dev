import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardsService } from './boards.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  boards: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  userOnBoards: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
};

const mockEventEmitter = {
  emit: vi.fn(),
};

describe('BoardsService', () => {
  let service: BoardsService;

  beforeEach(() => {
    Object.values(mockPrisma).forEach((group) =>
      Object.values(group).forEach((mockFn) => mockFn.mockReset()),
    );
    Object.values(mockEventEmitter).forEach((mockFn) => mockFn.mockReset());
    service = new BoardsService(
      mockPrisma as unknown as PrismaService,
      mockEventEmitter as unknown as EventEmitter2,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create - happy path: creates board', async () => {
    const dto = { name: 'Board' };
    const created = { id: 'board-1', name: dto.name };
    mockPrisma.boards.create.mockResolvedValue(created);

    const result = await service.create('user-1', dto);

    expect(mockPrisma.boards.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        users: {
          create: {
            userId: 'user-1',
            role: 'owner',
          },
        },
      },
    });
    expect(result).toEqual(created);
  });

  it('findAllByUser - happy path: returns boards', async () => {
    const boards = [{ id: 'board-1' }];
    mockPrisma.boards.findMany.mockResolvedValue(boards);

    const result = await service.findAllByUser('user-1');

    expect(mockPrisma.boards.findMany).toHaveBeenCalledWith({
      where: {
        users: { some: { userId: 'user-1' } },
      },
    });
    expect(result).toEqual(boards);
  });

  it('update - happy path: updates board and emits event', async () => {
    const updated = { id: 'board-1', name: 'Updated' };
    mockPrisma.boards.update.mockResolvedValue(updated);

    const result = await service.update(
      'board-1',
      { name: 'Updated' },
      'user-1',
    );

    expect(mockPrisma.boards.update).toHaveBeenCalledWith({
      where: { id: 'board-1' },
      data: { name: 'Updated' },
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('board.updated', {
      boardId: 'board-1',
      board: updated,
      userId: 'user-1',
    });
    expect(result).toEqual(updated);
  });

  it('update - not found: throws PrismaClientKnownRequestError and does not emit', async () => {
    mockPrisma.boards.update.mockRejectedValue(
      new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.8.0',
      }),
    );

    await expect(
      service.update('missing', { name: 'Updated' }, 'user-1'),
    ).rejects.toBeInstanceOf(PrismaClientKnownRequestError);
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('remove - membership not found: throws NotFoundException', async () => {
    mockPrisma.userOnBoards.findUnique.mockResolvedValue(null);

    await expect(service.remove('board-1', 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('remove - member role: leaves board', async () => {
    mockPrisma.userOnBoards.findUnique.mockResolvedValue({
      userId: 'user-1',
      boardId: 'board-1',
      role: 'member',
    });
    mockPrisma.userOnBoards.delete.mockResolvedValue({});

    const result = await service.remove('board-1', 'user-1');

    expect(mockPrisma.userOnBoards.delete).toHaveBeenCalledWith({
      where: { userId_boardId: { userId: 'user-1', boardId: 'board-1' } },
    });
    expect(result).toEqual({ success: true, action: 'left' });
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('remove - owner with oldest member: promotes and leaves', async () => {
    mockPrisma.userOnBoards.findUnique.mockResolvedValue({
      userId: 'user-1',
      boardId: 'board-1',
      role: 'owner',
    });
    mockPrisma.userOnBoards.findFirst.mockResolvedValue({
      userId: 'member-1',
      boardId: 'board-1',
      role: 'member',
    });
    mockPrisma.userOnBoards.update.mockResolvedValue({});
    mockPrisma.userOnBoards.delete.mockResolvedValue({});

    const result = await service.remove('board-1', 'user-1');

    expect(mockPrisma.userOnBoards.update).toHaveBeenCalledWith({
      where: { userId_boardId: { userId: 'member-1', boardId: 'board-1' } },
      data: { role: 'owner' },
    });
    expect(mockPrisma.userOnBoards.delete).toHaveBeenCalledWith({
      where: { userId_boardId: { userId: 'user-1', boardId: 'board-1' } },
    });
    expect(result).toEqual({ success: true, action: 'promoted' });
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('remove - owner with no members: deletes board', async () => {
    mockPrisma.userOnBoards.findUnique.mockResolvedValue({
      userId: 'user-1',
      boardId: 'board-1',
      role: 'owner',
    });
    mockPrisma.userOnBoards.findFirst.mockResolvedValue(null);
    mockPrisma.boards.delete.mockResolvedValue({ id: 'board-1' });

    const result = await service.remove('board-1', 'user-1');

    expect(mockPrisma.boards.delete).toHaveBeenCalledWith({
      where: { id: 'board-1' },
    });
    expect(result).toEqual({ success: true, action: 'deleted' });
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});
