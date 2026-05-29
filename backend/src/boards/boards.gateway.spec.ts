import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { BoardsGateway } from './boards.gateway';
import type { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import type { Server } from 'socket.io';

const mockFindUnique = vi.fn();
const mockPrisma = {
  userOnBoards: { findUnique: mockFindUnique },
} as unknown as PrismaService;

describe('BoardsGateway', () => {
  let gateway: BoardsGateway;
  let emitMock: ReturnType<typeof vi.fn>;
  let server: Server;
  let originalSupabaseUrl: string | undefined;

  beforeAll(() => {
    originalSupabaseUrl = process.env.SUPABASE_URL;
    process.env.SUPABASE_URL = 'https://example.supabase.co';
  });

  afterAll(() => {
    if (originalSupabaseUrl === undefined) {
      delete process.env.SUPABASE_URL;
    } else {
      process.env.SUPABASE_URL = originalSupabaseUrl;
    }
  });

  beforeEach(() => {
    mockFindUnique.mockReset();
    emitMock = vi.fn();
    server = {
      to: vi.fn(() => ({ emit: emitMock })),
    } as unknown as Server;
    gateway = new BoardsGateway(mockPrisma);
    gateway.server = server;
  });

  it('handleJoinRoom - happy path: joins room when membership exists', async () => {
    mockFindUnique.mockResolvedValue({ userId: 'user-1' });
    const client = { data: { user: { id: 'user-1' } }, join: vi.fn() };

    await gateway.handleJoinRoom(client as never, 'board-1');

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        userId_boardId: { userId: 'user-1', boardId: 'board-1' },
      },
      select: { userId: true },
    });
    expect(client.join).toHaveBeenCalledWith('board-1');
  });

  it('handleJoinRoom - no membership: throws ForbiddenException', async () => {
    mockFindUnique.mockResolvedValue(null);
    const client = { data: { user: { id: 'user-1' } }, join: vi.fn() };

    await expect(
      gateway.handleJoinRoom(client as never, 'board-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('handleBoardUpdated - emits board:updated', () => {
    gateway.handleBoardUpdated({
      boardId: 'board-1',
      board: { id: 'board-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('board:updated', {
      data: { id: 'board-1' },
      userId: 'user-1',
    });
  });

  it('handleCardCreated - emits card:created', () => {
    gateway.handleCardCreated({
      boardId: 'board-1',
      card: { id: 'card-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('card:created', {
      data: { id: 'card-1' },
      userId: 'user-1',
    });
  });

  it('handleCardUpdated - emits card:updated', () => {
    gateway.handleCardUpdated({
      boardId: 'board-1',
      card: { id: 'card-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('card:updated', {
      data: { id: 'card-1' },
      userId: 'user-1',
    });
  });

  it('handleCardDeleted - emits card:deleted', () => {
    gateway.handleCardDeleted({
      boardId: 'board-1',
      card: { id: 'card-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('card:deleted', {
      data: { id: 'card-1' },
      userId: 'user-1',
    });
  });

  it('handleColumnCreated - emits column:created', () => {
    gateway.handleColumnCreated({
      boardId: 'board-1',
      column: { id: 'col-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('column:created', {
      data: { id: 'col-1' },
      userId: 'user-1',
    });
  });

  it('handleColumnUpdated - emits column:updated', () => {
    gateway.handleColumnUpdated({
      boardId: 'board-1',
      column: { id: 'col-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('column:updated', {
      data: { id: 'col-1' },
      userId: 'user-1',
    });
  });

  it('handleColumnReorder - emits column:reordered', () => {
    gateway.handleColumnReorder({
      boardId: 'board-1',
      columns: [{ id: 'col-1', order: 1 }],
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('column:reordered', {
      data: [{ id: 'col-1', order: 1 }],
      userId: 'user-1',
    });
  });

  it('handleCardReorder - emits card:reordered', () => {
    gateway.handleCardReorder({
      boardId: 'board-1',
      cards: [{ id: 'card-1', order: 1 }],
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('card:reordered', {
      data: [{ id: 'card-1', order: 1 }],
      userId: 'user-1',
    });
  });

  it('handleColumnDeleted - emits column:deleted', () => {
    gateway.handleColumnDeleted({
      boardId: 'board-1',
      column: { id: 'col-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('column:deleted', {
      data: { id: 'col-1' },
      userId: 'user-1',
    });
  });

  it('handleLabelCreated - emits label:created', () => {
    gateway.handleLabelCreated({
      boardId: 'board-1',
      label: { id: 'label-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('label:created', {
      data: { id: 'label-1' },
      userId: 'user-1',
    });
  });

  it('handleLabelUpdated - emits label:updated', () => {
    gateway.handleLabelUpdated({
      boardId: 'board-1',
      label: { id: 'label-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('label:updated', {
      data: { id: 'label-1' },
      userId: 'user-1',
    });
  });

  it('handleLabelDeleted - emits label:deleted', () => {
    gateway.handleLabelDeleted({
      boardId: 'board-1',
      label: { id: 'label-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('label:deleted', {
      data: { id: 'label-1' },
      userId: 'user-1',
    });
  });

  it('handleLabelLinked - emits label:linked', () => {
    gateway.handleLabelLinked({
      boardId: 'board-1',
      card: { id: 'card-1' } as never,
      label: { id: 'label-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('label:linked', {
      data: { card: { id: 'card-1' }, label: { id: 'label-1' } },
      userId: 'user-1',
    });
  });

  it('handleLabelUnlinked - emits label:unlinked', () => {
    gateway.handleLabelUnlinked({
      boardId: 'board-1',
      card: { id: 'card-1' } as never,
      label: { id: 'label-1' } as never,
      userId: 'user-1',
    });

    expect(server.to).toHaveBeenCalledWith('board-1');
    expect(emitMock).toHaveBeenCalledWith('label:unlinked', {
      data: { card: { id: 'card-1' }, label: { id: 'label-1' } },
      userId: 'user-1',
    });
  });
});
