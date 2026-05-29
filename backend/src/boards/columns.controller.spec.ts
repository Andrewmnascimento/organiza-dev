import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ColumnsController } from './columns.controller';
import type { ColumnsService } from './columns.service';
import type { FastifyRequest } from 'fastify';

const mockColumnsService = {
  create: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  reorder: vi.fn(),
  remove: vi.fn(),
};

describe('ColumnsController', () => {
  let controller: ColumnsController;

  beforeEach(() => {
    Object.values(mockColumnsService).forEach((mockFn) => mockFn.mockReset());
    controller = new ColumnsController(
      mockColumnsService as unknown as ColumnsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should forward body, boardId and user id to service', async () => {
    const dto = { name: 'Column' };
    mockColumnsService.create.mockResolvedValue({ id: 'col-1' });

    const result = await controller.create(dto, 'board-1', {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockColumnsService.create).toHaveBeenCalledWith(
      dto,
      'board-1',
      'user-id',
    );
    expect(result).toEqual({ id: 'col-1' });
  });

  it('findAll should forward boardId to service', () => {
    const board = { id: 'board-1', columns: [] };
    mockColumnsService.findAll.mockReturnValue(board);

    const result = controller.findAll('board-1');

    expect(mockColumnsService.findAll).toHaveBeenCalledWith('board-1');
    expect(result).toEqual(board);
  });

  it('update should forward id, body and user id to service', async () => {
    const dto = { name: 'Updated' };
    mockColumnsService.update.mockResolvedValue({ id: 'col-1' });

    const result = await controller.update('col-1', dto, {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockColumnsService.update).toHaveBeenCalledWith(
      'col-1',
      dto,
      'user-id',
    );
    expect(result).toEqual({ id: 'col-1' });
  });

  it('reorder should forward boardId, body and user id to service', async () => {
    const dto = { columns: [{ id: 'col-1', order: 1 }] };
    mockColumnsService.reorder.mockResolvedValue(undefined);

    const result = await controller.reorder('board-1', dto, {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockColumnsService.reorder).toHaveBeenCalledWith(
      dto,
      'board-1',
      'user-id',
    );
    expect(result).toBeUndefined();
  });

  it('remove should forward id and user id to service', async () => {
    mockColumnsService.remove.mockResolvedValue({ id: 'col-1' });

    const result = await controller.remove('col-1', {
      user: { id: 'user-id' },
    } as FastifyRequest);

    expect(mockColumnsService.remove).toHaveBeenCalledWith('col-1', 'user-id');
    expect(result).toEqual({ id: 'col-1' });
  });
});
