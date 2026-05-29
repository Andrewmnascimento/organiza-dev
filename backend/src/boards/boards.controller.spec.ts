import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardsController } from './boards.controller';
import type { BoardsService } from './boards.service';
import { FastifyRequest } from 'fastify';

const mockBoardsService = {
  create: vi.fn(),
  findAllByUser: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('BoardsController', () => {
  let controller: BoardsController;

  beforeEach(() => {
    Object.values(mockBoardsService).forEach((mockFn) => mockFn.mockReset());
    controller = new BoardsController(
      mockBoardsService as unknown as BoardsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should forward user id and dto to service', () => {
    const dto = { name: 'My board' };
    mockBoardsService.create.mockReturnValue(dto);

    const result = controller.create(
      {
        user: {
          id: 'user-id',
        },
      } as FastifyRequest,
      dto,
    );

    expect(mockBoardsService.create).toHaveBeenCalledWith('user-id', dto);
    expect(result).toBe(dto);
  });

  it('findAll should forward user id to service', () => {
    mockBoardsService.findAllByUser.mockReturnValue([]);

    const result = controller.findAll({ user: { id: 'user-id' } } as never);

    expect(mockBoardsService.findAllByUser).toHaveBeenCalledWith('user-id');
    expect(result).toEqual([]);
  });

  it('findOne should return the board from guard', () => {
    const request = {
      board: { id: 'board-1', name: 'Test' },
    } as FastifyRequest;
    const result = controller.findOne(request);
    expect(result).toEqual({ board: { id: 'board-1', name: 'Test' } });
  });

  it('update should forward boardId, dto and request.user.id to service', () => {
    mockBoardsService.update.mockResolvedValue({});

    const result = controller.update('1234', { name: 'board' }, {
      user: {
        id: 'test',
      },
    } as FastifyRequest);

    expect(mockBoardsService.update).toHaveBeenCalledWith(
      '1234',
      { name: 'board' },
      'test',
    );

    expect(result).resolves.toEqual({});
  });

  it('delete should foward boardId and request.user.id to service', () => {
    mockBoardsService.remove.mockResolvedValue({});

    const boardId = 'id';
    const request = {
      user: {
        id: 'userid',
      },
    } as FastifyRequest;

    const result = controller.remove(boardId, request);

    expect(mockBoardsService.remove).toHaveBeenCalledWith('id', 'userid');

    expect(result.then()).resolves.toEqual({});
  });
});
